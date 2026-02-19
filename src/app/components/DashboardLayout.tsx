import { Link, Outlet, useLocation } from 'react-router';
import { 
  LayoutDashboard, 
  User, 
  FileText, 
  Bell, 
  Settings, 
  LogOut,
  Menu,
  X,
  Activity,
  Calendar,
  Users
} from 'lucide-react';
import { useState } from 'react';
import { clsx } from 'clsx';
import { UserRole } from '../lib/mockData';

interface DashboardLayoutProps {
  role: UserRole;
  userName: string;
}

export function DashboardLayout({ role, userName }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const patientLinks = [
    { name: 'Dashboard', href: '/patient/dashboard', icon: LayoutDashboard },
    { name: 'Health Log', href: '/patient/log', icon: FileText },
    { name: 'Appointments', href: '/patient/appointments', icon: Calendar },
    { name: 'Profile', href: '/patient/profile', icon: User },
  ];

  const doctorLinks = [
    { name: 'Dashboard', href: '/doctor/dashboard', icon: LayoutDashboard },
    { name: 'My Patients', href: '/doctor/patients', icon: Users },
    { name: 'Schedule', href: '/doctor/schedule', icon: Calendar },
    { name: 'Reports', href: '/doctor/reports', icon: FileText },
  ];

  const nurseLinks = [
    { name: 'Dashboard', href: '/nurse/dashboard', icon: LayoutDashboard },
    { name: 'Patients', href: '/nurse/patients', icon: Users },
    { name: 'Rounds', href: '/nurse/rounds', icon: Activity },
  ];

  const links = role === 'patient' ? patientLinks : (role === 'doctor' ? doctorLinks : nurseLinks);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-600 bg-opacity-75 md:hidden" 
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={clsx(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static md:inset-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-center h-16 border-b border-slate-200">
          <Link to="/" className="flex items-center gap-2 px-4">
            <Activity className="h-8 w-8 text-blue-600" />
            <span className="font-bold text-xl text-slate-900">I-CAMS</span>
          </Link>
        </div>
        
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {links.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={clsx(
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md'
                  )}
                >
                  <item.icon
                    className={clsx(
                      isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-500',
                      'mr-3 flex-shrink-0 h-6 w-6'
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex-shrink-0 flex border-t border-slate-200 p-4">
          <div className="flex-shrink-0 w-full group block">
            <div className="flex items-center">
              <div className="inline-block h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                <User size={20} />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                  {userName}
                </p>
                <p className="text-xs font-medium text-slate-500 group-hover:text-slate-700 capitalize">
                  {role}
                </p>
              </div>
            </div>
             <Link to="/login" className="mt-4 flex items-center text-sm text-red-600 hover:text-red-800">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header (Mobile mainly) */}
        <div className="md:hidden flex items-center justify-between bg-white border-b border-slate-200 px-4 py-2">
            <button
              onClick={() => setSidebarOpen(true)}
              className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-slate-500 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <span className="sr-only">Open sidebar</span>
              <Menu className="h-6 w-6" />
            </button>
            <div className="font-semibold text-slate-900">Dashboard</div>
            <div className="w-6"></div> {/* Spacer for centering */}
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto focus:outline-none p-6">
            <div className="max-w-7xl mx-auto">
                <Outlet />
            </div>
        </main>
      </div>
    </div>
  );
}
