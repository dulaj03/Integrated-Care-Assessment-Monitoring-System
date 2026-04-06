import { Link, useNavigate } from 'react-router';
import { User, Stethoscope, Activity, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleLogin = (role: 'patient' | 'doctor' | 'nurse' | 'hospital') => {
    navigate(`/login/${role}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-12 w-12 bg-blue-600 dark:bg-blue-700 rounded-lg flex items-center justify-center">
            <Activity className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900 dark:text-white">
          {t('login.signIn')}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
          {t('login.selectRole')}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-8 px-4 shadow dark:shadow-xl sm:rounded-lg sm:px-10 space-y-4">

          {/* Patient */}
          <button
            onClick={() => handleLogin('patient')}
            className="w-full flex items-center justify-between px-4 py-4 border border-slate-300 dark:border-slate-700 shadow-sm text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-blue-500 group transition-all duration-200"
          >
            <div className="flex items-center">
              <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full mr-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-900">
                <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-left">
                <p className="text-base font-semibold text-slate-900 dark:text-white">{t('login.patient')}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t('login.patientDesc')}</p>
              </div>
            </div>
            <Lock className="h-4 w-4 text-slate-400 dark:text-slate-500" />
          </button>

          {/* Nurse */}
          <button
            onClick={() => handleLogin('nurse')}
            className="w-full flex items-center justify-between px-4 py-4 border border-slate-300 dark:border-slate-700 shadow-sm text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-green-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-green-500 group transition-all duration-200"
          >
            <div className="flex items-center">
              <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-full mr-4 group-hover:bg-green-200 dark:group-hover:bg-green-900">
                <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-left">
                <p className="text-base font-semibold text-slate-900 dark:text-white">{t('login.nurse')}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t('login.nurseDesc')}</p>
              </div>
            </div>
            <Lock className="h-4 w-4 text-slate-400 dark:text-slate-500" />
          </button>

          {/* Doctor */}
          <button
            onClick={() => handleLogin('doctor')}
            className="w-full flex items-center justify-between px-4 py-4 border border-slate-300 dark:border-slate-700 shadow-sm text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-purple-500 group transition-all duration-200"
          >
            <div className="flex items-center">
              <div className="bg-purple-100 dark:bg-purple-900/50 p-2 rounded-full mr-4 group-hover:bg-purple-200 dark:group-hover:bg-purple-900">
                <Stethoscope className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-left">
                <p className="text-base font-semibold text-slate-900 dark:text-white">{t('login.doctor')}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t('login.doctorDesc')}</p>
              </div>
            </div>
            <Lock className="h-4 w-4 text-slate-400 dark:text-slate-500" />
          </button>

          {/* ── Divider ── */}
          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white dark:bg-slate-900 text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-widest">
                {t('login.hospitalInstitutional')}
              </span>
            </div>
          </div>

          {/* Hospital Admin */}
          <button
            onClick={() => handleLogin('hospital')}
            className="w-full flex items-center justify-between px-4 py-4 border-2 border-emerald-200 dark:border-emerald-800 shadow-sm font-medium rounded-lg text-slate-700 dark:text-slate-300 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-emerald-500 group transition-all duration-200"
          >
            <div className="flex items-center">
              <div className="bg-emerald-100 dark:bg-emerald-900/60 p-2 rounded-full mr-4 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900">
                <svg className="h-6 w-6 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-base font-semibold text-slate-900 dark:text-white">{t('login.hospitalAdmin')}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {t('login.hospitalAdminDesc')}
                </p>
              </div>
            </div>
            <Lock className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
          </button>

          {/* Footer */}
          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300 dark:border-slate-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400">
                  {t('login.goBack')}
                </span>
              </div>
            </div>
            <div className="mt-4 text-center">
              <Link to="/" className="font-medium text-blue-600 dark:text-blue-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200">
                {t('login.returnHome')}
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
