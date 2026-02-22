/**
 * Professional Dashboard Header Component
 * 
 * This is an example of how to integrate NotificationBell into a real dashboard
 * with professional features like user menu, theme switcher, and notifications.
 */

import { useState } from "react";
import { Bell, Settings, LogOut, User } from "lucide-react";
import { NotificationBell } from "./NotificationBell";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { mockNotifications, Notification } from "../lib/mockNotifications";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

interface ProfessionalHeaderProps {
  userName?: string;
  userEmail?: string;
  userAvatar?: string;
  onLogout?: () => void;
  onSettings?: () => void;
}

/**
 * Complete professional dashboard header with NotificationBell
 * Usage: Import this component and place it in your dashboard layout
 * 
 * <ProfessionalDashboardHeader
 *   userName="Dr. Emily Chen"
 *   userEmail="emily@hospital.com"
 *   onLogout={handleLogout}
 *   onSettings={handleSettings}
 * />
 */
export function ProfessionalDashboardHeader({
  userName = "Professional",
  userEmail = "user@icams.com",
  userAvatar,
  onLogout,
  onSettings,
}: ProfessionalHeaderProps) {
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
  };

  const handleNotificationClick = (notification: Notification) => {
    console.log("Notification clicked:", notification);
    // You can add navigation or action handling here
    // e.g., navigate to patient detail, open alert dialog, etc.
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left side - Logo/Branding */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 text-white font-bold">
            IC
          </div>
          <h1 className="hidden sm:inline-block text-xl font-bold text-slate-900 dark:text-white">
            I-CAMS Dashboard
          </h1>
        </div>

        {/* Right side - Notifications, Theme, User Menu */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Notifications */}
          <NotificationBell
            notifications={notifications}
            onMarkAsRead={handleMarkAsRead}
            onNotificationClick={handleNotificationClick}
          />

          {/* Theme Switcher */}
          <ThemeSwitcher />

          {/* Divider */}
          <div className="hidden h-8 w-px bg-slate-200 dark:bg-slate-700 sm:block" />

          {/* User Menu Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="relative h-10 w-10"
              >
                <Avatar className="h-10 w-10 cursor-pointer">
                  <AvatarImage src={userAvatar} alt={userName} />
                  <AvatarFallback className="bg-blue-600 text-white font-semibold">
                    {getInitials(userName)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              {/* User Info */}
              <div className="px-2 py-1.5">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {userName}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {userEmail}
                </p>
              </div>

              <DropdownMenuSeparator />

              {/* Menu Items */}
              <DropdownMenuItem onClick={() => console.log("Profile")}>
                <User className="mr-2 h-4 w-4" />
                <span>View Profile</span>
              </DropdownMenuItem>

              <DropdownMenuItem onClick={onSettings}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={onLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

/**
 * Minimal Header Version (for simple dashboards)
 * More compact alternative
 */
export function MinimalDashboardHeader() {
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);

  return (
    <header className="flex h-14 items-center justify-between border-b bg-white px-4 dark:border-slate-800 dark:bg-slate-900">
      <h1 className="font-semibold text-slate-900 dark:text-white">Dashboard</h1>
      <div className="flex items-center gap-2">
        <NotificationBell
          notifications={notifications}
          onMarkAsRead={(id) => {
            setNotifications((prev) =>
              prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
            );
          }}
        />
        <ThemeSwitcher />
      </div>
    </header>
  );
}

/**
 * Integration Steps:
 * 
 * 1. In your main dashboard component or layout:
 *    import { ProfessionalDashboardHeader } from "@/app/components/DashboardHeader";
 *
 * 2. Handle state management for notifications:
 *    const [notifications, setNotifications] = useState(mockNotifications);
 *    
 *    useEffect(() => {
 *      // Fetch notifications from API
 *      const fetchNotifications = async () => {
 *        const response = await fetch("/api/notifications");
 *        const data = await response.json();
 *        setNotifications(data);
 *      };
 *      
 *      fetchNotifications();
 *      const interval = setInterval(fetchNotifications, 30000);
 *      return () => clearInterval(interval);
 *    }, []);
 *
 * 3. Add the header to your layout:
 *    <ProfessionalDashboardHeader
 *      userName={currentUser.name}
 *      userEmail={currentUser.email}
 *      userAvatar={currentUser.avatarUrl}
 *      onLogout={handleLogout}
 *      onSettings={handleSettings}
 *    />
 *
 * 4. Wrap your page content within the same provider for context state
 */
