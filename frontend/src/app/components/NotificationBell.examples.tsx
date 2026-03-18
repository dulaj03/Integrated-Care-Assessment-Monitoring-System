/**
 * NotificationBell Component - Usage Examples
 * 
 * A reusable, fully responsive notification bell component with dropdown,
 * unread count badge, and rich notification details.
 */

import { NotificationBell } from './NotificationBell';
import { mockNotifications, Notification } from '../lib/mockNotifications';
import { useState } from 'react';

/**
 * EXAMPLE 1: Basic Usage (with mock data)
 * Simply drop the component into your navbar/header
 */
export const Example1_BasicUsage = () => {
  return (
    <div className="flex items-center gap-4 p-4">
      <NotificationBell />
    </div>
  );
};

/**
 * EXAMPLE 2: With Callbacks (mark as read, click handlers)
 * Track notification interactions in your component
 */
export const Example2_WithCallbacks = () => {
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
    console.log('Notification clicked:', notification);
    // Navigate to detail view or perform action
  };

  return (
    <NotificationBell
      notifications={notifications}
      onMarkAsRead={handleMarkAsRead}
      onNotificationClick={handleNotificationClick}
    />
  );
};

/**
 * EXAMPLE 3: Integration in navbar (for dashboard/authenticated users)
 * Typical placement in a professional dashboard navbar
 */
export const Example3_DashboardNavbar = () => {
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
  };

  return (
    <nav className="flex items-center justify-between px-4 py-3 border-b bg-white dark:bg-slate-900">
      {/* Logo */}
      <div className="text-lg font-bold">Dashboard</div>

      {/* Right side: Notifications + User Menu */}
      <div className="flex items-center gap-2">
        <NotificationBell
          notifications={notifications}
          onMarkAsRead={handleMarkAsRead}
        />
        {/* Other navbar items like user avatar, settings, etc. */}
      </div>
    </nav>
  );
};

/**
 * EXAMPLE 4: Dynamic Notifications (with real-time updates)
 * Simulates real-time notification updates
 */
export const Example4_DynamicNotifications = () => {
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);

  // Simulate adding new notifications
  const addNotification = () => {
    const newNotification: Notification = {
      id: String(Date.now()),
      patientName: 'New Patient',
      message: 'New alert received',
      timestamp: new Date(),
      status: 'High',
      isRead: false,
    };

    setNotifications((prev) => [newNotification, ...prev]);
  };

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      )
    );
  };

  return (
    <div className="p-4">
      <button
        onClick={addNotification}
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Add Notification
      </button>
      <NotificationBell
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
      />
    </div>
  );
};

/**
 * EXAMPLE 5: Empty State Handling
 * Shows behavior when there are no notifications
 */
export const Example5_EmptyState = () => {
  return (
    <div className="p-4">
      <NotificationBell notifications={[]} />
    </div>
  );
};

/**
 * INTEGRATION GUIDE
 * ==================
 *
 * 1. Import the component and mock data:
 *    import { NotificationBell } from "@/app/components/NotificationBell";
 *    import { mockNotifications, Notification } from "@/app/lib/mockNotifications";
 *
 * 2. Add to your navbar/header:
 *    <NotificationBell
 *      notifications={yourNotifications}
 *      onMarkAsRead={handleMarkAsRead}
 *      onNotificationClick={handleNotificationClick}
 *    />
 *
 * 3. Handle callbacks in your parent component:
 *    - onMarkAsRead: Called when user clicks an unread notification
 *    - onNotificationClick: Called when user clicks any notification
 *
 * 4. Replace mock data with real API calls when ready:
 *    useEffect(() => {
 *      fetchNotifications().then(setNotifications);
 *    }, []);
 *
 * COMPONENT API
 * ==============
 * Props:
 *   - notifications?: Notification[] - Array of notifications (defaults to mockNotifications)
 *   - onNotificationClick?: (notification: Notification) => void - Click handler
 *   - onMarkAsRead?: (notificationId: string) => void - Mark as read handler
 *
 * Features:
 *   ✓ Bell icon with unread count badge
 *   ✓ Dropdown/Popover with scrollable notification list
 *   ✓ Each notification shows: patient name, message, timestamp, status
 *   ✓ Status badge with color coding (High: red, Moderate: yellow, Normal: green)
 *   ✓ Unread indicator (blue dot)
 *   ✓ Empty state message
 *   ✓ Dark mode support
 *   ✓ Fully responsive design
 *   ✓ Uses shadcn UI components
 *   ✓ Tailwind CSS styling
 *   ✓ TypeScript support
 */
