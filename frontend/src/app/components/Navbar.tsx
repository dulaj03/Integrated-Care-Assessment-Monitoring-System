import { Link, useLocation } from 'react-router';
import { Menu, X, Activity } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { ThemeSwitcher } from './ThemeSwitcher';
import { AdvancedLanguageSwitcher } from './AdvancedLanguageSwitcher';

export function Navbar() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const userRole = sessionStorage.getItem('userRole');
  const userName = sessionStorage.getItem('userName');
  const isLoggedIn = !!sessionStorage.getItem('token');

  const getDashboardPath = () => {
    switch (userRole) {
    case 'patient': return '/patient/dashboard';
    case 'doctor': return '/doctor/dashboard';
    case 'nurse': return '/nurse/dashboard';
    case 'hospital': return '/hospital/dashboard';
    default: return '/login';
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const links = [
    { name: t('navigation.home'), href: '/' },
    { name: t('navigation.about'), href: '/about' },
    { name: t('navigation.features'), href: '/features' },
    { name: t('navigation.contact'), href: '/contact' },
    { name: t('navigation.dashboard'), href: '/login', isSpecial: true },
  ];

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <Activity className="h-8 w-8 text-blue-600 dark:text-blue-500" />
              <span className="font-bold text-xl text-slate-900 dark:text-white tracking-tight">I-CAMS</span>
            </Link>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-8">
            {links.filter(link => !link.isSpecial).map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={clsx(
                  isActive(link.href)
                    ? 'border-blue-500 text-slate-900 dark:text-white'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-700 dark:hover:text-slate-300',
                  'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium h-full transition-colors duration-200'
                )}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to={getDashboardPath()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 dark:from-blue-700 dark:to-cyan-700 dark:hover:from-blue-600 dark:hover:to-cyan-600 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-cyan-500 shadow-lg shadow-blue-500/50 dark:shadow-cyan-500/50 hover:shadow-xl hover:shadow-blue-500/60 dark:hover:shadow-cyan-500/60 transition-all duration-200"
            >
              {isLoggedIn ? t('common.goToDashboard') : t('common.dashboard')}
            </Link>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:items-center gap-3">
            <AdvancedLanguageSwitcher compact showNativeNames={false} />
            <ThemeSwitcher />
            {isLoggedIn ? (
              <Link
                to={getDashboardPath()}
                className="inline-flex items-center gap-2 px-4 py-2 border-2 border-blue-100 dark:border-blue-900/50 text-sm font-semibold rounded-xl text-blue-700 dark:text-blue-300 bg-white dark:bg-slate-900/50 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all duration-200 shadow-sm"
              >
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                {userName || t('common.profile')}
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-blue-500 transition-colors duration-200"
                >
                  {t('navigation.login')}
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900 focus:ring-blue-500 shadow-sm transition-colors duration-200"
                >
                  {t('navigation.register')}
                </Link>
              </>
            )}
          </div>

          <div className="-mr-2 flex items-center sm:hidden gap-2">
            <AdvancedLanguageSwitcher compact showNativeNames={false} />
            <ThemeSwitcher />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 dark:text-slate-500 hover:text-slate-500 dark:hover:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors duration-200"
            >
              <span className="sr-only">{t('sidebar.openSidebar')}</span>
              {isOpen ? <X className="block h-6 w-6" /> : <Menu className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="sm:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-lg absolute w-full">
          <div className="pt-2 pb-3 space-y-1">
            {links.filter(link => !link.isSpecial).map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={clsx(
                  isActive(link.href)
                    ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-300'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-700 dark:hover:text-slate-300',
                  'block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-colors duration-200'
                )}
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <Link
              to={getDashboardPath()}
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 mx-3 my-2 rounded transition-all duration-200 shadow-lg shadow-blue-500/50 hover:shadow-xl hover:shadow-blue-500/60"
              onClick={() => setIsOpen(false)}
            >
              {t('navigation.dashboard')}
            </Link>
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800 pb-4">
              <div className="space-y-2 px-4">
                {isLoggedIn ? (
                  <Link
                    to={getDashboardPath()}
                    className="block w-full text-center px-4 py-3 border-2 border-blue-500/20 text-base font-bold rounded-xl text-blue-700 dark:text-blue-300 bg-blue-50/50 dark:bg-blue-900/20 transition-colors duration-200"
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="flex items-center justify-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      {userName || t('common.profile')}
                    </span>
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="block w-full text-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors duration-200"
                      onClick={() => setIsOpen(false)}
                    >
                      {t('navigation.login')}
                    </Link>
                    <Link
                      to="/register"
                      className="block w-full text-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200"
                      onClick={() => setIsOpen(false)}
                    >
                      {t('navigation.register')}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
