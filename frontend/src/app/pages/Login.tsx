import { Link, useNavigate } from 'react-router';
import { User, Stethoscope, Activity, Lock } from 'lucide-react';

export function Login() {
  const navigate = useNavigate();

  const handleLogin = (role: 'patient' | 'doctor' | 'nurse') => {
    // Navigate to login form for the selected role
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
          Sign in to I-CAMS
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
          Select your role to continue to the dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-8 px-4 shadow dark:shadow-xl sm:rounded-lg sm:px-10 space-y-6">

          <button
            onClick={() => handleLogin('patient')}
            className="w-full flex items-center justify-between px-4 py-4 border border-slate-300 dark:border-slate-700 shadow-sm text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-blue-500 group transition-all duration-200"
          >
            <div className="flex items-center">
              <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full mr-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-900">
                <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-left">
                <p className="text-lg font-semibold text-slate-900 dark:text-white">Patient</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Access your health records</p>
              </div>
            </div>
            <Lock className="h-4 w-4 text-slate-400 dark:text-slate-500" />
          </button>

          <button
            onClick={() => handleLogin('nurse')}
            className="w-full flex items-center justify-between px-4 py-4 border border-slate-300 dark:border-slate-700 shadow-sm text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-green-500 group transition-all duration-200"
          >
            <div className="flex items-center">
              <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-full mr-4 group-hover:bg-green-200 dark:group-hover:bg-green-900">
                <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="text-left">
                <p className="text-lg font-semibold text-slate-900 dark:text-white">Nurse</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Monitor ward patients</p>
              </div>
            </div>
            <Lock className="h-4 w-4 text-slate-400 dark:text-slate-500" />
          </button>

          <button
            onClick={() => handleLogin('doctor')}
            className="w-full flex items-center justify-between px-4 py-4 border border-slate-300 dark:border-slate-700 shadow-sm text-sm font-medium rounded-md text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-purple-500 group transition-all duration-200"
          >
            <div className="flex items-center">
              <div className="bg-purple-100 dark:bg-purple-900/50 p-2 rounded-full mr-4 group-hover:bg-purple-200 dark:group-hover:bg-purple-900">
                <Stethoscope className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="text-left">
                <p className="text-lg font-semibold text-slate-900 dark:text-white">Doctor</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Review patient cases</p>
              </div>
            </div>
            <Lock className="h-4 w-4 text-slate-400 dark:text-slate-500" />
          </button>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300 dark:border-slate-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400">
                  Or go back home
                </span>
              </div>
            </div>
            <div className="mt-6 text-center">
              <Link to="/" className="font-medium text-blue-600 dark:text-blue-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors duration-200">
                Return to Landing Page
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
