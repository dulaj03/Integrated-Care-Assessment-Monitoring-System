import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  User,
  FileText,
  LogOut,
  Menu,
  Activity,
  Calendar,
  Users,
  MessageCircle,
  Building2,
  FlaskConical,
  ClipboardList,
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { clsx } from 'clsx';
import { toast } from 'sonner';
import { initSocket } from '../lib/socket';
import { ThemeSwitcher } from './ThemeSwitcher';
import { AdvancedLanguageSwitcher } from './AdvancedLanguageSwitcher';
import { NotificationBell } from './NotificationBell';
import { Notification } from '../lib/mockNotifications';

export type UserRole = 'patient' | 'nurse' | 'doctor' | 'hospital';

interface DashboardLayoutProps {
  role: UserRole;
  userName?: string;
}

export function DashboardLayout({ role, userName: initialUserName = '' }: DashboardLayoutProps) {
  const { t } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userName, setUserName] = useState(initialUserName);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const userId = sessionStorage.getItem('userId');

  const handleLogout = useCallback(() => {
    sessionStorage.clear();
    // Also clear specific admin keys just in case
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_auth');
    toast.success('Signed out successfully');
    navigate('/login');
  }, [navigate]);

  const fetchUnreadCount = useCallback(async () => {
    const token = sessionStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch('http://localhost:5000/api/messages/conversations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const conversations = await res.json();
        // Correctly count only conversations with active unread incoming messages
        const count = conversations.reduce((acc: number, conv: any) => acc + (conv.is_incoming_unread ? 1 : 0), 0);
        setUnreadMessages(count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    const token = sessionStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch('http://localhost:5000/api/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const mapped: Notification[] = data.map((n: any) => ({
          id: String(n.id),
          patientName: n.title, // Using title as "Source" name for now
          message: n.message,
          timestamp: new Date(n.created_at),
          status: n.type === 'critical' || n.type === 'error' ? 'High' : n.type === 'warning' ? 'Moderate' : 'Normal',
          isRead: n.is_read
        }));
        setNotifications(mapped);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  }, []);

  // Initialize notifications
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();

    // Load actual user name from session
    const storedName = sessionStorage.getItem('userName');
    if (storedName) {
      setUserName(storedName);
    }

    // Socket for real-time updates
    const socket = initSocket(String(userId), role);
    
    const handleNewMessage = () => {
      if (!location.pathname.includes('messages')) {
        setUnreadMessages(prev => prev + 1);
      }
    };

    const handleNewNotification = (notif: any) => {
      const mapped: Notification = {
        id: String(notif.id),
        patientName: notif.title,
        message: notif.message,
        timestamp: new Date(notif.created_at),
        status: notif.type === 'critical' || notif.type === 'error' ? 'High' : notif.type === 'warning' ? 'Moderate' : 'Normal',
        isRead: notif.is_read
      };
      setNotifications(prev => [mapped, ...prev]);
      toast.info(notif.title, { description: notif.message });
    };

    socket?.on('new_message', handleNewMessage);
    socket?.on('messages_read', fetchUnreadCount);
    socket?.on('new_notification', handleNewNotification);

    return () => {
      socket?.off('new_message', handleNewMessage);
      socket?.off('messages_read', fetchUnreadCount);
      socket?.off('new_notification', handleNewNotification);
    };
  }, [userId, role, location.pathname, fetchUnreadCount, fetchNotifications]);

  // Clear unread count when entering messages page
  useEffect(() => {
    fetchUnreadCount();
  }, [location.pathname, fetchUnreadCount]);

  // Handle marking notification as read
  const handleMarkAsRead = async (notificationId: string) => {
    const token = sessionStorage.getItem('token');
    if (!token) return;
    try {
      await fetch(`http://localhost:5000/api/notifications/mark-read/${notificationId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
    } catch (e) {
      console.error('Failed to mark read:', e);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    handleMarkAsRead(notification.id);
  };

  const patientLinks = [
    { name: t('sidebar.dashboard'), href: '/patient/dashboard', icon: LayoutDashboard },
    { name: t('sidebar.healthLog'), href: '/patient/log', icon: FileText },
    { name: t('sidebar.careHistory'), href: '/patient/care-history', icon: Activity },
    { name: t('sidebar.appointments'), href: '/patient/appointments', icon: Calendar },
    { name: t('sidebar.findHospitals'), href: '/patient/hospitals', icon: Building2 },
    { name: t('sidebar.labResults'), href: '/patient/lab-results', icon: FlaskConical },
    { name: t('sidebar.messages'), href: '/patient/messages', icon: MessageCircle },
    { name: t('sidebar.profile'), href: '/patient/profile', icon: User },
  ];

  const doctorLinks = [
    { name: t('sidebar.dashboard'), href: '/doctor/dashboard', icon: LayoutDashboard },
    { name: t('sidebar.myPatients'), href: '/doctor/patients', icon: Users },
    { name: t('sidebar.proceduralHub'), href: '/doctor/procedural-hub', icon: ClipboardList },
    { name: t('sidebar.messages'), href: '/doctor/messages', icon: MessageCircle },
    { name: t('sidebar.schedule'), href: '/doctor/schedule', icon: Calendar },
    { name: t('sidebar.reports'), href: '/doctor/reports', icon: FileText },
    { name: t('sidebar.settings'), href: '/doctor/settings', icon: User },
  ];

  const nurseLinks = [
    { name: t('sidebar.dashboard'), href: '/nurse/dashboard', icon: LayoutDashboard },
    { name: t('sidebar.patients'), href: '/nurse/patients', icon: Users },
    { name: t('sidebar.patientCare'), href: '/nurse/care', icon: ClipboardList },
    { name: t('sidebar.messages'), href: '/nurse/messages', icon: MessageCircle },
    { name: t('sidebar.rounds'), href: '/nurse/rounds', icon: Activity },
    { name: t('sidebar.settings'), href: '/nurse/settings', icon: User },
  ];

  const hospitalLinks = [
    { name: t('sidebar.dashboard'), href: '/hospital/dashboard', icon: LayoutDashboard },
    { name: t('sidebar.messages'), href: '/hospital/messages', icon: MessageCircle },
  ];

  const links = role === 'patient' ? patientLinks
    : role === 'doctor' ? doctorLinks
      : role === 'nurse' ? nurseLinks
        : hospitalLinks;


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-600 bg-opacity-75 dark:bg-slate-950 dark:bg-opacity-80 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={clsx(
        'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:sticky md:top-0 md:h-screen md:inset-auto',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center justify-center h-16 border-b border-slate-200 dark:border-slate-800">
          <Link to="/" className="flex items-center gap-2 px-4">
            <Activity className="h-8 w-8 text-blue-600 dark:text-blue-500" />
            <span className="font-bold text-xl text-slate-900 dark:text-white">I-CAMS</span>
          </Link>
        </div>

        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {links.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={clsx(
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-r-4 border-blue-600'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-300',
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 relative'
                  )}
                >
                  <item.icon
                    className={clsx(
                      isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-500 dark:group-hover:text-slate-400',
                      'mr-3 flex-shrink-0 h-6 w-6'
                    )}
                  />
                  {item.name}
                  {item.href.includes('messages') && unreadMessages > 0 && (
                    <span className="absolute right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg shadow-red-500/40 animate-pulse">
                      {unreadMessages}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex-shrink-0 flex flex-col border-t border-slate-200 dark:border-slate-800 p-4 gap-4">
          <div className="flex-shrink-0 w-full group block">
            <div className="flex items-center">
              <div className="h-9 w-9 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400">
                <User size={20} />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors duration-200">
                  {userName}
                </p>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 capitalize transition-colors duration-200">
                  {t(`common.${role}`)}
                </p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="mt-4 flex items-center text-sm text-red-600 dark:text-red-500 hover:text-red-800 dark:hover:text-red-400 transition-colors duration-200"
            >
              <LogOut className="h-4 w-4 mr-2" />
              {t('common.signOut')}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 h-16">
          {/* Left side - Mobile menu toggle */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden -ml-0.5 h-10 w-10 inline-flex items-center justify-center rounded-md text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-colors duration-200"
          >
            <span className="sr-only">{t('sidebar.openSidebar')}</span>
            <Menu className="h-6 w-6" />
          </button>

          {/* Center - Page title (mobile) */}
          <div className="md:hidden font-semibold text-slate-900 dark:text-white text-sm">{t('sidebar.dashboard')}</div>

          {/* Right side - Notifications, Theme, etc */}
          <div className="flex items-center gap-2 ml-auto md:ml-0">
            <AdvancedLanguageSwitcher compact showNativeNames={false} />
            <NotificationBell
              notifications={notifications}
              onMarkAsRead={handleMarkAsRead}
              onNotificationClick={handleNotificationClick}
            />
            <ThemeSwitcher />
          </div>
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
