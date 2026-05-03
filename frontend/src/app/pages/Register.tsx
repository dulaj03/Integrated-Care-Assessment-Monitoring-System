import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router';
import { UserPlus, Upload } from 'lucide-react';
import { Hospital } from '../lib/hospitalData';
import { Navbar } from '../components/Navbar';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { API_URL } from '../config';

export function Register() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const roleParam = searchParams.get('role') || 'patient';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: roleParam,
    password: '',
    confirmPassword: '',
    // Patient fields
    hospitalId: '',
    doctorId: '',
    // Professional fields
    licenseNumber: '',
    specialization: '',
    yearsOfExperience: '',
    institutionName: '',
    registrationNumber: '',
    qualifications: '',
    licenseDocument: null as File | null,
    hospital_ids: [] as number[],
  });

  const [hospitals, setHospitals] = useState<Hospital[]>([]);

  useEffect(() => {
    fetchHospitals();
  }, []);

  const fetchHospitals = async () => {
    try {
      const res = await fetch(`${API_URL}/api/hospitals`);
      if (res.ok) {
        const data = await res.json();
        setHospitals(data);
      }
    } catch (err) {
      console.error('Error fetching hospitals:', err);
    }
  };

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  // Patient email verification pending screen
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');

  const isProfessional = formData.role === 'doctor' || formData.role === 'nurse';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          licenseDocument: 'Please upload a PDF or image file (JPG/PNG)',
        }));
        return;
      }

      if (file.size > maxSize) {
        setErrors((prev) => ({
          ...prev,
          licenseDocument: 'File size must be less than 5MB',
        }));
        return;
      }

      setFormData((prev) => ({
        ...prev,
        licenseDocument: file,
      }));

      if (errors.licenseDocument) {
        setErrors((prev) => ({
          ...prev,
          licenseDocument: '',
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Please enter a valid email';

    // Password only required for non-patient (patient sets it after email verify)
    if (formData.role !== 'patient') {
      if (!formData.password) newErrors.password = 'Password is required';
      if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }

    // Professional validation
    if (isProfessional) {
      if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'License number is required';
      if (!formData.specialization.trim()) newErrors.specialization = formData.role === 'doctor' ? 'Specialization is required' : 'Qualification is required';
      if (!formData.yearsOfExperience) newErrors.yearsOfExperience = 'Years of experience is required';
      if (parseInt(formData.yearsOfExperience) < 0) newErrors.yearsOfExperience = 'Years of experience must be a positive number';
      if (formData.hospital_ids.length === 0) newErrors.institutionName = 'At least one hospital affiliation is required';
      if (!formData.registrationNumber.trim()) newErrors.registrationNumber = 'Registration number is required';
      if (!formData.licenseDocument) newErrors.licenseDocument = 'Professional license document is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      const baseUrl = `${API_URL}/api/auth`;

      // ── Patient: 2-step email-verify flow ──────────────────────────
      if (formData.role === 'patient') {
        const res = await fetch(`${baseUrl}/patient/initiate-registration`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ full_name: formData.name, email: formData.email }),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Registration failed');
        setVerificationEmail(formData.email);
        setPendingVerification(true);
        return;
      }

      // ── Professional: FormData upload ──────────────────────────────
      let response;
      if (isProfessional) {
        const data = new FormData();
        data.append('full_name', formData.name);
        data.append('email', formData.email);
        data.append('password', formData.password);
        data.append('role', formData.role);
        data.append('license_number', formData.licenseNumber);
        data.append('specialization', formData.specialization);
        data.append('years_of_experience', formData.yearsOfExperience);
        data.append('institution_name', formData.hospital_ids.map(id => hospitals.find(h => String(h.id) === String(id))?.name).filter(Boolean).join(', '));
        data.append('hospital_ids', JSON.stringify(formData.hospital_ids));
        data.append('registration_number', formData.registrationNumber);
        if (formData.licenseDocument) data.append('licenseDocument', formData.licenseDocument);
        response = await fetch(`${baseUrl}/register/${formData.role}`, { method: 'POST', body: data });
      } else {
        response = await fetch(`${baseUrl}/register/${formData.role}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      }

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Registration failed');

      sessionStorage.setItem('userRole', formData.role);
      sessionStorage.setItem('userEmail', formData.email);
      sessionStorage.setItem('userName', formData.name);

      if (isProfessional) {
        sessionStorage.setItem('verificationStatus', 'pending');
        toast.success('Registration successful!', {
          description: 'Your account is pending verification by our clinical team.',
        });
        navigate(`/login/${formData.role}`);
      } else {
        navigate(`/login/${formData.role}`);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'An error occurred. Please try again.';
      setErrors({ submit: errorMsg });
    } finally {
      setLoading(false);
    }
  };


  // ─── Pending email verification screen ──────────────────────────
  if (pendingVerification) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div style={{
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '2.5rem 2rem',
            boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
            textAlign: 'center',
          }}>
            {/* Animated envelope */}
            <div style={{
              width: '88px', height: '88px', borderRadius: '50%', margin: '0 auto 1.5rem',
              background: 'rgba(37,99,235,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '2px solid rgba(37,99,235,0.35)',
              boxShadow: '0 0 40px rgba(37,99,235,0.3)',
              fontSize: '38px',
              animation: 'bounceSlow 2s ease-in-out infinite',
            }}>📧</div>

            <h2 style={{ color: '#f1f5f9', fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.75rem' }}>
              Check Your Email!
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6, margin: '0 0 0.5rem' }}>
              We've sent a verification link to:
            </p>
            <p style={{
              color: '#60a5fa', fontWeight: 700, fontSize: '1rem',
              background: 'rgba(37,99,235,0.12)', borderRadius: '8px',
              padding: '8px 16px', display: 'inline-block', margin: '0 0 1.5rem',
              border: '1px solid rgba(37,99,235,0.25)',
            }}>{verificationEmail}</p>

            <div style={{
              background: 'rgba(15,23,42,0.6)', borderRadius: '12px',
              padding: '16px 20px', margin: '0 0 2rem',
              border: '1px solid #334155', textAlign: 'left',
            }}>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem', margin: '0 0 10px', fontWeight: 600 }}>Next steps:</p>
              {['Open the email from I-CAMS in your inbox', 'Click the "Verify Email Address" button in the email', 'Set your password on the verification page', 'You\'ll be logged in automatically'].map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: '10px', marginBottom: i < 3 ? '8px' : 0, alignItems: 'flex-start' }}>
                  <span style={{
                    width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
                    color: '#fff', fontSize: '0.7rem', fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>{i + 1}</span>
                  <span style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.4 }}>{step}</span>
                </div>
              ))}
            </div>

            <p style={{ color: '#475569', fontSize: '0.8rem', margin: '0 0 1.5rem' }}>
              Didn't receive an email? Check your spam folder. The link expires in <strong style={{ color: '#94a3b8' }}>30 minutes</strong>.
            </p>

            <button
              onClick={() => setPendingVerification(false)}
              style={{
                background: 'none', border: '1px solid #334155', borderRadius: '10px',
                color: '#64748b', fontSize: '0.875rem', padding: '10px 20px',
                cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseOver={(e) => { e.currentTarget.style.borderColor = '#475569'; e.currentTarget.style.color = '#94a3b8'; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.color = '#64748b'; }}
            >← Back to Register</button>
          </div>

          <style>{`
            @keyframes bounceSlow {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-10px); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />
      <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <UserPlus className="h-12 w-12 text-blue-600 dark:text-blue-500" />
          </div>
          <h2 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight text-slate-900 dark:text-white">
            {t('register.title')}
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
            {t('register.alreadyHaveAccount')}{' '}
            <Link to={roleParam ? `/login/${roleParam}` : '/login'} className="font-semibold text-blue-600 dark:text-blue-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200">
              {t('register.signIn')}
            </Link>
          </p>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
          <div className="bg-white dark:bg-slate-900 px-6 py-12 shadow dark:shadow-xl sm:rounded-lg sm:px-12">
            {errors.submit && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-400 text-sm">
                {errors.submit}
              </div>
            )}

            {isProfessional && (
              <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-md">
                <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
                  📋 Professional Verification Required
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                  Please provide your professional credentials. Your information will be verified by our admin team before activation.
                </p>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Basic fields for all roles */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium leading-6 text-slate-900 dark:text-white">
                  {t('patient_profile.fullName')}
                </label>
                <div className="mt-2">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    placeholder="John Doe"
                    className="block w-full rounded-md border-0 py-1.5 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:focus:ring-blue-500 bg-white dark:bg-slate-800 sm:text-sm sm:leading-6 disabled:opacity-50 transition-colors duration-200"
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.name}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium leading-6 text-slate-900 dark:text-white">
                  {t('register.email')}
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                    required
                    disabled={loading}
                    placeholder="john@example.com"
                    className="block w-full rounded-md border-0 py-1.5 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:focus:ring-blue-500 bg-white dark:bg-slate-800 sm:text-sm sm:leading-6 disabled:opacity-50 transition-colors duration-200"
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.email}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium leading-6 text-slate-900 dark:text-white">
                  {t('register.selectRole')}
                </label>
                <div className="mt-2">
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    disabled={loading}
                    className="block w-full rounded-md border-0 py-1.5 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:focus:ring-blue-500 bg-white dark:bg-slate-800 sm:text-sm sm:leading-6 disabled:opacity-50 transition-colors duration-200"
                  >
                    <option value="patient">{t('register.patient')}</option>
                    <option value="doctor">{t('register.doctor')}</option>
                    <option value="nurse">{t('register.nurse')}</option>
                  </select>
                </div>
              </div>


              {/* Professional Fields - Doctor */}
              {formData.role === 'doctor' && (
                <>
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Professional Credentials</h3>
                  </div>

                  <div>
                    <label htmlFor="specialization" className="block text-sm font-medium leading-6 text-slate-900 dark:text-white">
                      Medical Specialization
                    </label>
                    <div className="mt-2">
                      <select
                        id="specialization"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleChange}
                        disabled={loading}
                        className="block w-full rounded-md border-0 py-1.5 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:focus:ring-blue-500 bg-white dark:bg-slate-800 sm:text-sm sm:leading-6 disabled:opacity-50 transition-colors duration-200"
                      >
                        <option value="">Select a specialization</option>
                        <option value="cardiology">Cardiology</option>
                        <option value="neurology">Neurology</option>
                        <option value="orthopedics">Orthopedics</option>
                        <option value="pediatrics">Pediatrics</option>
                        <option value="dermatology">Dermatology</option>
                        <option value="psychology">Psychology</option>
                        <option value="general">General Practice</option>
                        <option value="surgery">Surgery</option>
                        <option value="oncology">Oncology</option>
                        <option value="other">Other</option>
                      </select>
                      {errors.specialization && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.specialization}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="licenseNumber" className="block text-sm font-medium leading-6 text-slate-900 dark:text-white">
                      Medical License Number
                    </label>
                    <div className="mt-2">
                      <input
                        id="licenseNumber"
                        name="licenseNumber"
                        type="text"
                        value={formData.licenseNumber}
                        onChange={handleChange}
                        disabled={loading}
                        placeholder="e.g., MD123456"
                        className="block w-full rounded-md border-0 py-1.5 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:focus:ring-blue-500 bg-white dark:bg-slate-800 sm:text-sm sm:leading-6 disabled:opacity-50 transition-colors duration-200"
                      />
                      {errors.licenseNumber && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.licenseNumber}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="registrationNumber" className="block text-sm font-medium leading-6 text-slate-900 dark:text-white">
                      Medical Council Registration Number
                    </label>
                    <div className="mt-2">
                      <input
                        id="registrationNumber"
                        name="registrationNumber"
                        type="text"
                        value={formData.registrationNumber}
                        onChange={handleChange}
                        disabled={loading}
                        placeholder="e.g., MCI-2023-123456"
                        className="block w-full rounded-md border-0 py-1.5 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:focus:ring-blue-500 bg-white dark:bg-slate-800 sm:text-sm sm:leading-6 disabled:opacity-50 transition-colors duration-200"
                      />
                      {errors.registrationNumber && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.registrationNumber}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="yearsOfExperience" className="block text-sm font-medium leading-6 text-slate-900 dark:text-white">
                      Years of Experience
                    </label>
                    <div className="mt-2">
                      <input
                        id="yearsOfExperience"
                        name="yearsOfExperience"
                        type="number"
                        min="0"
                        value={formData.yearsOfExperience}
                        onChange={handleChange}
                        disabled={loading}
                        placeholder="e.g., 5"
                        className="block w-full rounded-md border-0 py-1.5 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:focus:ring-blue-500 bg-white dark:bg-slate-800 sm:text-sm sm:leading-6 disabled:opacity-50 transition-colors duration-200"
                      />
                      {errors.yearsOfExperience && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.yearsOfExperience}</p>}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-white">
                      Current Hospital/Clinic Affiliations
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.hospital_ids.map(id => {
                        const h = hospitals.find(h => String(h.id) === String(id));
                        return h ? (
                          <span key={id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-medium border border-blue-200 dark:border-blue-800">
                            {h.name}
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, hospital_ids: prev.hospital_ids.filter(hid => hid !== id) }))}
                              className="hover:text-blue-900 dark:hover:text-blue-100"
                            >
                              ×
                            </button>
                          </span>
                        ) : null;
                      })}
                    </div>
                    <select
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (val && !formData.hospital_ids.includes(val)) {
                          setFormData(prev => ({ ...prev, hospital_ids: [...prev.hospital_ids, val] }));
                        }
                        e.target.value = '';
                      }}
                      className="block w-full rounded-md border-0 py-1.5 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:focus:ring-blue-500 bg-white dark:bg-slate-800 sm:text-sm sm:leading-6"
                    >
                      <option value="">Add a hospital...</option>
                      {hospitals
                        .filter(h => !formData.hospital_ids.map(String).includes(String(h.id)))
                        .map(h => <option key={h.id} value={h.id}>{h.name}</option>)
                      }
                    </select>
                    {errors.institutionName && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.institutionName}</p>}
                    <p className="text-[10px] text-slate-500 mt-1 italic">
                      Note: You must select at least one registered hospital.
                    </p>
                  </div>
                </>
              )}

              {/* Professional Fields - Nurse */}
              {formData.role === 'nurse' && (
                <>
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Professional Credentials</h3>
                  </div>

                  <div>
                    <label htmlFor="specialization" className="block text-sm font-medium leading-6 text-slate-900 dark:text-white">
                      Nursing Qualification
                    </label>
                    <div className="mt-2">
                      <select
                        id="specialization"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleChange}
                        disabled={loading}
                        className="block w-full rounded-md border-0 py-1.5 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:focus:ring-blue-500 bg-white dark:bg-slate-800 sm:text-sm sm:leading-6 disabled:opacity-50 transition-colors duration-200"
                      >
                        <option value="">Select qualification</option>
                        <option value="rn">Registered Nurse (RN)</option>
                        <option value="lpn">Licensed Practical Nurse (LPN)</option>
                        <option value="bscn">Bachelor of Science in Nursing (BSc N)</option>
                        <option value="icu">ICU Specialist Nurse</option>
                        <option value="surgical">Surgical Nurse</option>
                        <option value="community">Community Health Nurse</option>
                        <option value="other">Other</option>
                      </select>
                      {errors.specialization && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.specialization}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="licenseNumber" className="block text-sm font-medium leading-6 text-slate-900 dark:text-white">
                      Nursing License Number
                    </label>
                    <div className="mt-2">
                      <input
                        id="licenseNumber"
                        name="licenseNumber"
                        type="text"
                        value={formData.licenseNumber}
                        onChange={handleChange}
                        disabled={loading}
                        placeholder="e.g., NL-123456"
                        className="block w-full rounded-md border-0 py-1.5 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:focus:ring-blue-500 bg-white dark:bg-slate-800 sm:text-sm sm:leading-6 disabled:opacity-50 transition-colors duration-200"
                      />
                      {errors.licenseNumber && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.licenseNumber}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="registrationNumber" className="block text-sm font-medium leading-6 text-slate-900 dark:text-white">
                      Nursing Council Registration Number
                    </label>
                    <div className="mt-2">
                      <input
                        id="registrationNumber"
                        name="registrationNumber"
                        type="text"
                        value={formData.registrationNumber}
                        onChange={handleChange}
                        disabled={loading}
                        placeholder="e.g., NC-2023-123456"
                        className="block w-full rounded-md border-0 py-1.5 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:focus:ring-blue-500 bg-white dark:bg-slate-800 sm:text-sm sm:leading-6 disabled:opacity-50 transition-colors duration-200"
                      />
                      {errors.registrationNumber && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.registrationNumber}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="yearsOfExperience" className="block text-sm font-medium leading-6 text-slate-900 dark:text-white">
                      Years of Experience
                    </label>
                    <div className="mt-2">
                      <input
                        id="yearsOfExperience"
                        name="yearsOfExperience"
                        type="number"
                        min="0"
                        value={formData.yearsOfExperience}
                        onChange={handleChange}
                        disabled={loading}
                        placeholder="e.g., 3"
                        className="block w-full rounded-md border-0 py-1.5 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:focus:ring-blue-500 bg-white dark:bg-slate-800 sm:text-sm sm:leading-6 disabled:opacity-50 transition-colors duration-200"
                      />
                      {errors.yearsOfExperience && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.yearsOfExperience}</p>}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-medium leading-6 text-slate-900 dark:text-white">
                      Current Hospital/Clinic Affiliations
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.hospital_ids.map(id => {
                        const h = hospitals.find(h => String(h.id) === String(id));
                        return h ? (
                          <span key={id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-medium border border-blue-200 dark:border-blue-800">
                            {h.name}
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, hospital_ids: prev.hospital_ids.filter(hid => hid !== id) }))}
                              className="hover:text-blue-900 dark:hover:text-blue-100"
                            >
                              ×
                            </button>
                          </span>
                        ) : null;
                      })}
                    </div>
                    <select
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (val && !formData.hospital_ids.includes(val)) {
                          setFormData(prev => ({ ...prev, hospital_ids: [...prev.hospital_ids, val] }));
                        }
                        e.target.value = '';
                      }}
                      className="block w-full rounded-md border-0 py-1.5 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:focus:ring-blue-500 bg-white dark:bg-slate-800 sm:text-sm sm:leading-6"
                    >
                      <option value="">Add a hospital...</option>
                      {hospitals
                        .filter(h => !formData.hospital_ids.map(String).includes(String(h.id)))
                        .map(h => <option key={h.id} value={h.id}>{h.name}</option>)
                      }
                    </select>
                    {errors.institutionName && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.institutionName}</p>}
                  </div>
                </>
              )}

              {/* Document Upload - for professionals only */}
              {isProfessional && (
                <div>
                  <label htmlFor="licenseDocument" className="block text-sm font-medium leading-6 text-slate-900 dark:text-white">
                    Upload Professional License/Certificate
                  </label>
                  <div className="mt-2 flex justify-center rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 px-6 py-10 bg-white dark:bg-slate-800 transition-colors duration-200">
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
                      <div className="mt-4 flex items-center justify-center">
                        <label
                          htmlFor="licenseDocument"
                          className="relative cursor-pointer rounded-md font-semibold text-blue-600 dark:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 dark:focus-within:ring-blue-500 focus-within:ring-offset-2 dark:focus-within:ring-offset-slate-800 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200"
                        >
                          <span>Click to upload</span>
                          <input
                            id="licenseDocument"
                            name="licenseDocument"
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleFileChange}
                            disabled={loading}
                            className="sr-only"
                          />
                        </label>
                        <span className="pl-1 text-slate-600 dark:text-slate-400">or drag and drop</span>
                      </div>
                      <p className="text-xs leading-5 text-slate-600 dark:text-slate-400 mt-2">
                        PDF, JPG or PNG up to 5MB
                      </p>
                      {formData.licenseDocument && (
                        <p className="mt-2 text-xs text-green-600 dark:text-green-500 font-medium">
                          ✓ {formData.licenseDocument.name} selected
                        </p>
                      )}
                    </div>
                  </div>
                  {errors.licenseDocument && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.licenseDocument}</p>}
                </div>
              )}

              {/* Password fields — only shown for professionals (patients set password via email verification) */}
              {formData.role !== 'patient' && (
                <>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium leading-6 text-slate-900 dark:text-white">
                      {t('register.password')}
                    </label>
                    <div className="mt-2">
                      <input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        autoComplete="new-password"
                        required
                        disabled={loading}
                        className="block w-full rounded-md border-0 py-1.5 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:focus:ring-blue-500 bg-white dark:bg-slate-800 sm:text-sm sm:leading-6 disabled:opacity-50 transition-colors duration-200"
                      />
                      {errors.password && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.password}</p>}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium leading-6 text-slate-900 dark:text-white">
                      {t('register.confirmPassword')}
                    </label>
                    <div className="mt-2">
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        autoComplete="new-password"
                        required
                        disabled={loading}
                        className="block w-full rounded-md border-0 py-1.5 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-blue-600 dark:focus:ring-blue-500 bg-white dark:bg-slate-800 sm:text-sm sm:leading-6 disabled:opacity-50 transition-colors duration-200"
                      />
                      {errors.confirmPassword && <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.confirmPassword}</p>}
                    </div>
                  </div>
                </>
              )}

              {/* Patient: info banner explaining email verification */}
              {formData.role === 'patient' && (
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-300 font-semibold mb-1">📧 Email Verification Required</p>
                  <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                    We'll send a verification link to your email. Click it to verify your address, then set your password securely on the next page.
                  </p>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full justify-center rounded-md bg-blue-600 dark:bg-blue-700 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-blue-500 dark:hover:bg-blue-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:focus-visible:outline-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {loading
                    ? (formData.role === 'patient' ? 'Sending verification email...' : isProfessional ? 'Submitting for Verification...' : 'Creating account...')
                    : (formData.role === 'patient' ? '📧 Send Verification Email' : t('register.createAccount'))}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
