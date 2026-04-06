import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';

export function LoginForm() {
  const navigate = useNavigate();
  const { role } = useParams<{ role: string }>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Load remembered credentials on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem(`remembered_email_${role}`);
    const savedPassword = localStorage.getItem(`remembered_password_${role}`);
    const savedRememberMe = localStorage.getItem(`remembered_me_${role}`) === 'true';

    if (savedRememberMe) {
      if (savedEmail) setEmail(savedEmail);
      if (savedPassword) setPassword(savedPassword);
      setRememberMe(true);
    }
  }, [role]);

  const roleConfig: Record<string, { label: string; color: string; icon: string }> = {
    patient: {
      label: 'Patient',
      color: 'blue',
      icon: '👤',
    },
    doctor: {
      label: 'Doctor',
      color: 'purple',
      icon: '👨‍⚕️',
    },
    nurse: {
      label: 'Nurse',
      color: 'green',
      icon: '👩‍⚕️',
    },
    hospital: {
      label: 'Hospital Admin',
      color: 'emerald',
      icon: '🏥',
    },
  };

  const config = roleConfig[role || ''] || roleConfig.patient;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Login failed');
      }

      // Store auth info
      sessionStorage.setItem('token', result.token);
      sessionStorage.setItem('userId', result.user.id);
      sessionStorage.setItem('userRole', role || 'patient');
      sessionStorage.setItem('userEmail', result.user.email);
      sessionStorage.setItem('userName', result.user.full_name || result.user.name);
      sessionStorage.setItem('user', JSON.stringify(result.user)); // Cache entire user object for context-rich dashboards

      // Handle "Remember me"
      if (rememberMe) {
        localStorage.setItem(`remembered_email_${role}`, email);
        localStorage.setItem(`remembered_password_${role}`, password);
        localStorage.setItem(`remembered_me_${role}`, 'true');
      } else {
        localStorage.removeItem(`remembered_email_${role}`);
        localStorage.removeItem(`remembered_password_${role}`);
        localStorage.removeItem(`remembered_me_${role}`);
      }

      // Navigate to role-specific dashboard
      if (role === 'patient') {
        navigate('/patient/dashboard');
      } else if (role === 'doctor') {
        navigate('/doctor/dashboard');
      } else if (role === 'nurse') {
        navigate('/nurse/dashboard');
      } else if (role === 'hospital') {
        navigate('/hospital/dashboard');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred. Please try again.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Colour maps
  const bgColor: Record<string, string> = {
    blue: 'bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600',
    purple: 'bg-purple-600 dark:bg-purple-700 hover:bg-purple-700 dark:hover:bg-purple-600',
    green: 'bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600',
    emerald: 'bg-emerald-600 dark:bg-emerald-700 hover:bg-emerald-700 dark:hover:bg-emerald-600',
  };

  const ringColor: Record<string, string> = {
    blue: 'focus:ring-blue-500',
    purple: 'focus:ring-purple-500',
    green: 'focus:ring-green-500',
    emerald: 'focus:ring-emerald-500',
  };

  const iconBgColor: Record<string, string> = {
    blue: 'bg-blue-600 dark:bg-blue-700',
    purple: 'bg-purple-600 dark:bg-purple-700',
    green: 'bg-green-600 dark:bg-green-700',
    emerald: 'bg-emerald-600 dark:bg-emerald-700',
  };

  const c = config.color;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className={`h-14 w-14 ${iconBgColor[c]} rounded-xl flex items-center justify-center shadow-lg`}>
            <span className="text-2xl">{config.icon}</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 dark:text-white">
          {config.label} Login
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
          Sign in to your I-CAMS {config.label} account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-8 px-4 shadow dark:shadow-xl sm:rounded-xl sm:px-10">


          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Email Address
              </label>
              <div className="mt-1 relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400 dark:text-slate-500" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  disabled={loading}
                  className={`block w-full pl-10 pr-3 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 ${ringColor[c]} focus:border-${c}-500 transition-colors duration-200 disabled:opacity-50 text-sm`}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className="mt-1 relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400 dark:text-slate-500" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  className={`block w-full pl-10 pr-10 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 ${ringColor[c]} focus:border-${c}-500 transition-colors duration-200 disabled:opacity-50 text-sm`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400 transition-colors"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-slate-800"
                  disabled={loading}
                />
                <span className="ml-2 text-sm text-slate-600 dark:text-slate-400">Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm font-medium text-blue-600 dark:text-blue-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                disabled={loading}
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white ${bgColor[c]} ${ringColor[c]} focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-950 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                  Signing in...
                </span>
              ) : (
                `Sign in as ${config.label}`
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300 dark:border-slate-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400">
                  {role !== 'hospital' ? "Don't have an account?" : 'Need access?'}
                </span>
              </div>
            </div>
            <div className="mt-4 text-center">
              {role !== 'hospital' ? (
                <button
                  onClick={() => navigate(`/register?role=${role}`)}
                  className="font-medium text-blue-600 dark:text-blue-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                >
                  Create an account
                </button>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Contact <span className="font-semibold text-emerald-600 dark:text-emerald-400">admin@icams.lk</span> to register your hospital
                </p>
              )}
            </div>
          </div>

          {/* Back to role selection */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to role selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
