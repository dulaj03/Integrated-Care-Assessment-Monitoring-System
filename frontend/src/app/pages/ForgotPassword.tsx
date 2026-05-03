import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, ShieldCheck, KeyRound, CheckCircle2, RefreshCw } from 'lucide-react';

type Step = 'email' | 'otp' | 'reset' | 'success';

export function ForgotPassword() {
  const navigate = useNavigate();
  const { role } = useParams<{ role: string }>();

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown for resend OTP
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const roleConfig: Record<string, { label: string; color: string; gradientFrom: string; gradientTo: string; icon: string }> = {
    patient:  { label: 'Patient',       color: '#2563eb', gradientFrom: '#1e3a8a', gradientTo: '#2563eb', icon: '👤' },
    doctor:   { label: 'Doctor',        color: '#7c3aed', gradientFrom: '#4c1d95', gradientTo: '#7c3aed', icon: '👨‍⚕️' },
    nurse:    { label: 'Nurse',         color: '#059669', gradientFrom: '#064e3b', gradientTo: '#059669', icon: '👩‍⚕️' },
    hospital: { label: 'Hospital Admin',color: '#0d9488', gradientFrom: '#134e4a', gradientTo: '#0d9488', icon: '🏥' },
  };
  const cfg = roleConfig[role || ''] || roleConfig.patient;

  // ─── Step 1: Request OTP ─────────────────────────────────────────
  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      setInfo(`OTP sent successfully to ${email}. Please check your inbox (and spam folder).`);
      setStep('otp');
      setCountdown(60);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 2: Verify OTP ──────────────────────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const otpValue = otp.join('');
    if (otpValue.length < 6) {
      setError('Please enter the complete 6-digit OTP');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role, otp: otpValue }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'OTP verification failed');
      setStep('reset');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // ─── Step 3: Reset Password ──────────────────────────────────────
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Password reset failed');
      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // ─── Resend OTP ──────────────────────────────────────────────────
  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setError('');
    setInfo('');
    setLoading(true);
    setOtp(['', '', '', '', '', '']);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to resend OTP');
      setInfo('A new OTP has been sent to your email.');
      setCountdown(60);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // ─── OTP Input helpers ───────────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text.length > 0) {
      const newOtp = [...otp];
      text.split('').forEach((char, i) => { newOtp[i] = char; });
      setOtp(newOtp);
      otpRefs.current[Math.min(text.length, 5)]?.focus();
    }
  };

  const passwordStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strengthLabel = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  const strengthColor = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#0d9488'];
  const pwdStrength = passwordStrength(newPassword);

  const stepNumbers = [
    { key: 'email', label: 'Email' },
    { key: 'otp',   label: 'Verify' },
    { key: 'reset', label: 'Reset' },
  ];
  const currentStepIndex = step === 'success' ? 3 : stepNumbers.findIndex((s) => s.key === step);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      {/* Decorative blobs */}
      <div style={{
        position: 'fixed', top: '-10rem', right: '-10rem',
        width: '30rem', height: '30rem', borderRadius: '50%',
        background: `radial-gradient(circle, ${cfg.color}33 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'fixed', bottom: '-10rem', left: '-10rem',
        width: '30rem', height: '30rem', borderRadius: '50%',
        background: `radial-gradient(circle, ${cfg.color}22 0%, transparent 70%)`,
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: '460px', position: 'relative', zIndex: 1 }}>

        {/* Logo / Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '18px',
            background: `linear-gradient(135deg, ${cfg.gradientFrom}, ${cfg.gradientTo})`,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', boxShadow: `0 8px 32px ${cfg.color}55`, marginBottom: '1rem',
          }}>
            {cfg.icon}
          </div>
          <h1 style={{ color: '#fff', fontSize: '1.75rem', fontWeight: 800, margin: '0 0 0.25rem', letterSpacing: '-0.5px' }}>
            Reset Password
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
            {cfg.label} Account • I-CAMS
          </p>
        </div>

        {/* Step progress (only show on non-success) */}
        {step !== 'success' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2rem', gap: '0' }}>
            {stepNumbers.map((s, i) => (
              <div key={s.key} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '0.85rem',
                  background: i < currentStepIndex
                    ? cfg.color
                    : i === currentStepIndex
                      ? `linear-gradient(135deg, ${cfg.gradientFrom}, ${cfg.gradientTo})`
                      : '#1e293b',
                  color: i <= currentStepIndex ? '#fff' : '#475569',
                  border: i === currentStepIndex ? `2px solid ${cfg.color}` : i < currentStepIndex ? 'none' : '2px solid #334155',
                  boxShadow: i === currentStepIndex ? `0 0 16px ${cfg.color}66` : 'none',
                  transition: 'all 0.3s ease',
                }}>
                  {i < currentStepIndex ? '✓' : i + 1}
                </div>
                <span style={{
                  marginLeft: '6px', fontSize: '0.8rem', fontWeight: 600,
                  color: i <= currentStepIndex ? '#e2e8f0' : '#475569',
                }}>
                  {s.label}
                </span>
                {i < stepNumbers.length - 1 && (
                  <div style={{
                    width: '40px', height: '2px', margin: '0 10px',
                    background: i < currentStepIndex ? cfg.color : '#334155',
                    transition: 'background 0.3s ease',
                  }} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Card */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.8)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          border: '1px solid rgba(255,255,255,0.08)',
          padding: '2rem',
          boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
        }}>

          {/* Error / Info banners */}
          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
              borderRadius: '12px', padding: '12px 16px', marginBottom: '1.25rem',
              color: '#fca5a5', fontSize: '0.875rem', display: 'flex', gap: '8px', alignItems: 'flex-start',
            }}>
              <span>⚠️</span><span>{error}</span>
            </div>
          )}
          {info && !error && (
            <div style={{
              background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)',
              borderRadius: '12px', padding: '12px 16px', marginBottom: '1.25rem',
              color: '#86efac', fontSize: '0.875rem', display: 'flex', gap: '8px', alignItems: 'flex-start',
            }}>
              <span>✅</span><span>{info}</span>
            </div>
          )}

          {/* ─── STEP 1: Email ─── */}
          {step === 'email' && (
            <form onSubmit={handleRequestOtp}>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '16px', marginBottom: '1rem',
                  background: `${cfg.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `1px solid ${cfg.color}44`,
                }}>
                  <Mail size={24} color={cfg.color} />
                </div>
                <h2 style={{ color: '#f1f5f9', fontSize: '1.3rem', fontWeight: 700, margin: '0 0 0.4rem' }}>
                  Enter your email
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0, lineHeight: 1.5 }}>
                  We'll send a 6-digit OTP to your registered email address.
                </p>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} color="#475569" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    disabled={loading}
                    style={{
                      width: '100%', padding: '12px 14px 12px 44px', borderRadius: '12px',
                      background: 'rgba(15, 23, 42, 0.6)', border: '1px solid #334155',
                      color: '#f1f5f9', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
                      transition: 'border-color 0.2s',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = cfg.color)}
                    onBlur={(e) => (e.target.style.borderColor = '#334155')}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '13px', borderRadius: '12px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  background: loading ? '#334155' : `linear-gradient(135deg, ${cfg.gradientFrom}, ${cfg.gradientTo})`,
                  color: '#fff', fontSize: '0.95rem', fontWeight: 700, letterSpacing: '0.02em',
                  boxShadow: loading ? 'none' : `0 4px 20px ${cfg.color}55`,
                  transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
              >
                {loading ? (
                  <><span style={{ width: '18px', height: '18px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Sending OTP...</>
                ) : (
                  <><Mail size={18} />Send OTP</>
                )}
              </button>
            </form>
          )}

          {/* ─── STEP 2: OTP ─── */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp}>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '16px', marginBottom: '1rem',
                  background: `${cfg.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `1px solid ${cfg.color}44`,
                }}>
                  <ShieldCheck size={24} color={cfg.color} />
                </div>
                <h2 style={{ color: '#f1f5f9', fontSize: '1.3rem', fontWeight: 700, margin: '0 0 0.4rem' }}>
                  Verify your OTP
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0, lineHeight: 1.5 }}>
                  Enter the 6-digit code sent to <strong style={{ color: '#94a3b8' }}>{email}</strong>
                </p>
              </div>

              {/* OTP Inputs */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '1.75rem' }}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { otpRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={handleOtpPaste}
                    disabled={loading}
                    style={{
                      width: '52px', height: '60px', textAlign: 'center', fontSize: '1.6rem', fontWeight: 800,
                      borderRadius: '14px', background: 'rgba(15, 23, 42, 0.8)',
                      border: digit ? `2px solid ${cfg.color}` : '1px solid #334155',
                      color: '#f1f5f9', outline: 'none', boxShadow: digit ? `0 0 12px ${cfg.color}44` : 'none',
                      transition: 'all 0.2s', fontFamily: "'Courier New', monospace",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = cfg.color)}
                    onBlur={(e) => (e.target.style.borderColor = digit ? cfg.color : '#334155')}
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '13px', borderRadius: '12px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  background: loading ? '#334155' : `linear-gradient(135deg, ${cfg.gradientFrom}, ${cfg.gradientTo})`,
                  color: '#fff', fontSize: '0.95rem', fontWeight: 700,
                  boxShadow: loading ? 'none' : `0 4px 20px ${cfg.color}55`,
                  transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '1rem',
                }}
              >
                {loading ? (
                  <><span style={{ width: '18px', height: '18px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Verifying...</>
                ) : (
                  <><ShieldCheck size={18} />Verify OTP</>
                )}
              </button>

              {/* Resend */}
              <div style={{ textAlign: 'center' }}>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={countdown > 0 || loading}
                  style={{
                    background: 'none', border: 'none', cursor: countdown > 0 ? 'not-allowed' : 'pointer',
                    color: countdown > 0 ? '#475569' : cfg.color, fontSize: '0.875rem', fontWeight: 600,
                    display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px',
                    transition: 'color 0.2s',
                  }}
                >
                  <RefreshCw size={14} />
                  {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
                </button>
              </div>
            </form>
          )}

          {/* ─── STEP 3: New Password ─── */}
          {step === 'reset' && (
            <form onSubmit={handleResetPassword}>
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '16px', marginBottom: '1rem',
                  background: `${cfg.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `1px solid ${cfg.color}44`,
                }}>
                  <KeyRound size={24} color={cfg.color} />
                </div>
                <h2 style={{ color: '#f1f5f9', fontSize: '1.3rem', fontWeight: 700, margin: '0 0 0.4rem' }}>
                  Set new password
                </h2>
                <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>
                  Choose a strong password for your account.
                </p>
              </div>

              {/* New Password */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>
                  New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} color="#475569" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    disabled={loading}
                    style={{
                      width: '100%', padding: '12px 44px 12px 44px', borderRadius: '12px',
                      background: 'rgba(15, 23, 42, 0.6)', border: '1px solid #334155',
                      color: '#f1f5f9', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = cfg.color)}
                    onBlur={(e) => (e.target.style.borderColor = '#334155')}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 0 }}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {/* Strength bar */}
                {newPassword && (
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                      {[1,2,3,4,5].map((i) => (
                        <div key={i} style={{
                          flex: 1, height: '4px', borderRadius: '2px',
                          background: i <= pwdStrength ? strengthColor[pwdStrength] : '#334155',
                          transition: 'background 0.3s',
                        }} />
                      ))}
                    </div>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: strengthColor[pwdStrength], fontWeight: 600 }}>
                      {strengthLabel[pwdStrength]}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div style={{ marginBottom: '1.75rem' }}>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>
                  Confirm Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} color="#475569" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your new password"
                    disabled={loading}
                    style={{
                      width: '100%', padding: '12px 44px 12px 44px', borderRadius: '12px',
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: `1px solid ${confirmPassword && confirmPassword !== newPassword ? '#ef4444' : confirmPassword && confirmPassword === newPassword ? '#22c55e' : '#334155'}`,
                      color: '#f1f5f9', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = cfg.color)}
                    onBlur={(e) => {
                      if (confirmPassword && confirmPassword !== newPassword) e.target.style.borderColor = '#ef4444';
                      else if (confirmPassword && confirmPassword === newPassword) e.target.style.borderColor = '#22c55e';
                      else e.target.style.borderColor = '#334155';
                    }}
                  />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 0 }}>
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {confirmPassword && confirmPassword === newPassword && (
                  <p style={{ margin: '6px 0 0', fontSize: '0.75rem', color: '#22c55e', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={13} /> Passwords match
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '13px', borderRadius: '12px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  background: loading ? '#334155' : `linear-gradient(135deg, ${cfg.gradientFrom}, ${cfg.gradientTo})`,
                  color: '#fff', fontSize: '0.95rem', fontWeight: 700,
                  boxShadow: loading ? 'none' : `0 4px 20px ${cfg.color}55`,
                  transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
              >
                {loading ? (
                  <><span style={{ width: '18px', height: '18px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Resetting Password...</>
                ) : (
                  <><KeyRound size={18} />Reset Password</>
                )}
              </button>
            </form>
          )}

          {/* ─── STEP 4: Success ─── */}
          {step === 'success' && (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 1.5rem',
                background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid rgba(34,197,94,0.4)', boxShadow: '0 0 30px rgba(34,197,94,0.3)',
                animation: 'successPulse 1.5s ease-in-out infinite alternate',
              }}>
                <CheckCircle2 size={44} color="#22c55e" />
              </div>
              <h2 style={{ color: '#f1f5f9', fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.75rem' }}>
                Password Reset!
              </h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 2rem' }}>
                Your password has been successfully updated. You can now log in with your new credentials.
              </p>
              <button
                onClick={() => navigate(`/login/${role}`)}
                style={{
                  width: '100%', padding: '13px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                  background: `linear-gradient(135deg, ${cfg.gradientFrom}, ${cfg.gradientTo})`,
                  color: '#fff', fontSize: '0.95rem', fontWeight: 700,
                  boxShadow: `0 4px 20px ${cfg.color}55`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
              >
                Go to Login
              </button>
            </div>
          )}
        </div>

        {/* Back link */}
        {step !== 'success' && (
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <button
              onClick={() => {
                if (step === 'otp') setStep('email');
                else if (step === 'reset') setStep('otp');
                else navigate(`/login/${role}`);
                setError('');
                setInfo('');
              }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#64748b', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '6px',
                transition: 'color 0.2s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = '#94a3b8')}
              onMouseOut={(e) => (e.currentTarget.style.color = '#64748b')}
            >
              <ArrowLeft size={16} />
              {step === 'email' ? 'Back to Login' : 'Go back'}
            </button>
          </div>
        )}
      </div>

      {/* Inline animation keyframes */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes successPulse {
          from { box-shadow: 0 0 20px rgba(34,197,94,0.2); }
          to   { box-shadow: 0 0 50px rgba(34,197,94,0.5); }
        }
      `}</style>
    </div>
  );
}
