import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { Lock, Eye, EyeOff, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type Status = 'verifying' | 'valid' | 'invalid' | 'submitting' | 'success';

export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [status, setStatus] = useState<Status>('verifying');
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwdError, setPwdError] = useState('');

  // Verify token on mount
  useEffect(() => {
    if (!token) {
      setErrorMsg('No verification token was found in this link.');
      setStatus('invalid');
      return;
    }

    fetch(`http://localhost:5000/api/auth/patient/verify-email?token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.valid) {
          setUserName(data.name);
          setUserEmail(data.email);
          setStatus('valid');
        } else {
          setErrorMsg(data.error || 'Invalid verification link.');
          setStatus('invalid');
        }
      })
      .catch(() => {
        setErrorMsg('Could not connect to the server. Please try again.');
        setStatus('invalid');
      });
  }, [token]);

  const passwordStrength = (pwd: string) => {
    let s = 0;
    if (pwd.length >= 8) s++;
    if (pwd.length >= 12) s++;
    if (/[A-Z]/.test(pwd)) s++;
    if (/[0-9]/.test(pwd)) s++;
    if (/[^A-Za-z0-9]/.test(pwd)) s++;
    return s;
  };
  const strLabel = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  const strColor = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#0d9488'];
  const pwdStr = passwordStrength(password);

  const handleComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError('');
    if (password.length < 8) { setPwdError('Password must be at least 8 characters'); return; }
    if (password !== confirmPassword) { setPwdError('Passwords do not match'); return; }

    setStatus('submitting');
    try {
      const res = await fetch('http://localhost:5000/api/auth/patient/complete-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      // Auto-login — store session
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('userId', data.user.id);
      sessionStorage.setItem('userRole', 'patient');
      sessionStorage.setItem('userEmail', data.user.email);
      sessionStorage.setItem('userName', data.user.full_name || data.user.name || userName);
      sessionStorage.setItem('user', JSON.stringify(data.user));

      setStatus('success');

      // Navigate with welcome toast after brief delay
      setTimeout(() => {
        navigate('/patient/dashboard', { replace: true });
        setTimeout(() => {
          toast.success(`🎉 Welcome to I-CAMS, ${userName}!`, {
            description: 'Your patient account has been created. Explore your dashboard to get started.',
            duration: 6000,
          });
        }, 400);
      }, 1800);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'An error occurred');
      setStatus('valid'); // stay on form
      setPwdError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const sharedInput: React.CSSProperties = {
    width: '100%', padding: '12px 14px 12px 44px', borderRadius: '12px',
    background: 'rgba(15, 23, 42, 0.6)', border: '1px solid #334155',
    color: '#f1f5f9', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem 1rem',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    }}>
      {/* Background glow */}
      <div style={{
        position: 'fixed', top: '-8rem', right: '-8rem', width: '28rem', height: '28rem',
        borderRadius: '50%', background: 'radial-gradient(circle, #2563eb33 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '18px',
            background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', boxShadow: '0 8px 32px #2563eb55', marginBottom: '1rem',
          }}>👤</div>
          <h1 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 800, margin: '0 0 0.25rem' }}>
            {status === 'success' ? 'All Set!' : 'Email Verification'}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>I-CAMS Patient Portal</p>
        </div>

        {/* Card */}
        <div style={{
          background: 'rgba(30, 41, 59, 0.85)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          border: '1px solid rgba(255,255,255,0.08)',
          padding: '2.5rem 2rem',
          boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
        }}>

          {/* ── VERIFYING ── */}
          {status === 'verifying' && (
            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
              <Loader2 size={48} color="#2563eb" style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
              <p style={{ color: '#94a3b8', fontSize: '1rem', margin: 0 }}>Verifying your email link…</p>
            </div>
          )}

          {/* ── INVALID ── */}
          {status === 'invalid' && (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{
                width: '72px', height: '72px', borderRadius: '50%', margin: '0 auto 1.5rem',
                background: 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid rgba(239,68,68,0.35)',
              }}>
                <XCircle size={40} color="#ef4444" />
              </div>
              <h2 style={{ color: '#f1f5f9', fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.75rem' }}>Link Invalid or Expired</h2>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 2rem' }}>{errorMsg}</p>
              <button
                onClick={() => navigate('/register?role=patient')}
                style={{
                  width: '100%', padding: '13px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
                  color: '#fff', fontSize: '0.9rem', fontWeight: 700,
                  boxShadow: '0 4px 20px #2563eb55',
                }}
              >
                Register Again
              </button>
            </div>
          )}

          {/* ── VALID: Set Password Form ── */}
          {(status === 'valid' || status === 'submitting') && (
            <form onSubmit={handleComplete}>
              {/* Email verified banner */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)',
                borderRadius: '12px', padding: '12px 16px', marginBottom: '1.75rem',
              }}>
                <CheckCircle2 size={20} color="#22c55e" style={{ flexShrink: 0 }} />
                <div>
                  <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: '#86efac' }}>
                    Email Verified ✓
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#4ade80' }}>
                    {userEmail}
                  </p>
                </div>
              </div>

              <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0 0 1.5rem', lineHeight: 1.5 }}>
                Hi <strong style={{ color: '#e2e8f0' }}>{userName}</strong>! Set a secure password to complete your I-CAMS account.
              </p>

              {/* Password */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>
                  New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} color="#475569" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    disabled={status === 'submitting'}
                    style={{ ...sharedInput, paddingRight: '44px' }}
                    onFocus={(e) => (e.target.style.borderColor = '#2563eb')}
                    onBlur={(e) => (e.target.style.borderColor = '#334155')}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 0 }}>
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {password && (
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                      {[1,2,3,4,5].map((i) => (
                        <div key={i} style={{ flex: 1, height: '4px', borderRadius: '2px', background: i <= pwdStr ? strColor[pwdStr] : '#334155', transition: 'background 0.3s' }} />
                      ))}
                    </div>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: strColor[pwdStr], fontWeight: 600 }}>{strLabel[pwdStr]}</p>
                  </div>
                )}
              </div>

              {/* Confirm */}
              <div style={{ marginBottom: '1.75rem' }}>
                <label style={{ display: 'block', color: '#cbd5e1', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px' }}>
                  Confirm Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} color="#475569" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    required value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    disabled={status === 'submitting'}
                    style={{
                      ...sharedInput, paddingRight: '44px',
                      borderColor: confirmPassword && confirmPassword !== password ? '#ef4444' : confirmPassword && confirmPassword === password ? '#22c55e' : '#334155',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = '#2563eb')}
                    onBlur={(e) => {
                      if (confirmPassword && confirmPassword !== password) e.target.style.borderColor = '#ef4444';
                      else if (confirmPassword && confirmPassword === password) e.target.style.borderColor = '#22c55e';
                      else e.target.style.borderColor = '#334155';
                    }}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 0 }}>
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {confirmPassword && confirmPassword === password && (
                  <p style={{ margin: '6px 0 0', fontSize: '0.75rem', color: '#22c55e', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={13} /> Passwords match
                  </p>
                )}
              </div>

              {pwdError && (
                <div style={{
                  background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
                  borderRadius: '10px', padding: '10px 14px', marginBottom: '1rem',
                  color: '#fca5a5', fontSize: '0.85rem',
                }}>⚠️ {pwdError}</div>
              )}

              <button type="submit" disabled={status === 'submitting'}
                style={{
                  width: '100%', padding: '13px', borderRadius: '12px', border: 'none',
                  cursor: status === 'submitting' ? 'not-allowed' : 'pointer',
                  background: status === 'submitting' ? '#334155' : 'linear-gradient(135deg, #1e3a8a, #2563eb)',
                  color: '#fff', fontSize: '0.95rem', fontWeight: 700,
                  boxShadow: status === 'submitting' ? 'none' : '0 4px 20px #2563eb55',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}>
                {status === 'submitting' ? (
                  <><span style={{ width: '18px', height: '18px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />Creating account…</>
                ) : (
                  <>🚀 Create My Account</>
                )}
              </button>
            </form>
          )}

          {/* ── SUCCESS ── */}
          {status === 'success' && (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{
                width: '80px', height: '80px', borderRadius: '50%', margin: '0 auto 1.5rem',
                background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '2px solid rgba(34,197,94,0.4)', boxShadow: '0 0 40px rgba(34,197,94,0.35)',
                animation: 'pulse 1.5s ease-in-out infinite alternate',
              }}>
                <CheckCircle2 size={44} color="#22c55e" />
              </div>
              <h2 style={{ color: '#f1f5f9', fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem' }}>Account Created!</h2>
              <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '0 0 0.5rem' }}>
                Welcome aboard, <strong style={{ color: '#94a3b8' }}>{userName}</strong>!
              </p>
              <p style={{ color: '#475569', fontSize: '0.85rem', margin: 0 }}>Redirecting to your dashboard…</p>
              <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                <span style={{ width: '32px', height: '32px', border: '3px solid #2563eb', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { from { box-shadow: 0 0 20px rgba(34,197,94,0.2); } to { box-shadow: 0 0 50px rgba(34,197,94,0.5); } }
      `}</style>
    </div>
  );
}
