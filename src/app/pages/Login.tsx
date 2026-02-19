import { Link, useNavigate } from 'react-router';
import { User, Stethoscope, Activity, Lock } from 'lucide-react';

export function Login() {
  const navigate = useNavigate();

  const handleLogin = (role: 'patient' | 'doctor' | 'nurse') => {
    // In a real app, this would set the auth token/context
    if (role === 'patient') navigate('/patient/dashboard');
    else if (role === 'doctor') navigate('/doctor/dashboard');
    else navigate('/nurse/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
            <div className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <Activity className="h-8 w-8 text-white" />
            </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-slate-900">
          Sign in to I-CAMS
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          Select your role to continue to the dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 space-y-6">
          
          <button
            onClick={() => handleLogin('patient')}
            className="w-full flex items-center justify-between px-4 py-4 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 group transition-all"
          >
            <div className="flex items-center">
                <div className="bg-blue-100 p-2 rounded-full mr-4 group-hover:bg-blue-200">
                    <User className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-left">
                    <p className="text-lg font-semibold text-slate-900">Patient</p>
                    <p className="text-xs text-slate-500">Access your health records</p>
                </div>
            </div>
            <Lock className="h-4 w-4 text-slate-400" />
          </button>

          <button
            onClick={() => handleLogin('nurse')}
            className="w-full flex items-center justify-between px-4 py-4 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 group transition-all"
          >
             <div className="flex items-center">
                <div className="bg-green-100 p-2 rounded-full mr-4 group-hover:bg-green-200">
                    <Activity className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-left">
                    <p className="text-lg font-semibold text-slate-900">Nurse</p>
                    <p className="text-xs text-slate-500">Monitor ward patients</p>
                </div>
            </div>
            <Lock className="h-4 w-4 text-slate-400" />
          </button>

          <button
            onClick={() => handleLogin('doctor')}
            className="w-full flex items-center justify-between px-4 py-4 border border-slate-300 shadow-sm text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 group transition-all"
          >
             <div className="flex items-center">
                <div className="bg-purple-100 p-2 rounded-full mr-4 group-hover:bg-purple-200">
                    <Stethoscope className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-left">
                    <p className="text-lg font-semibold text-slate-900">Doctor</p>
                    <p className="text-xs text-slate-500">Review patient cases</p>
                </div>
            </div>
            <Lock className="h-4 w-4 text-slate-400" />
          </button>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">
                  Or go back home
                </span>
              </div>
            </div>
            <div className="mt-6 text-center">
                <Link to="/" className="font-medium text-blue-600 hover:text-blue-500">
                    Return to Landing Page
                </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
