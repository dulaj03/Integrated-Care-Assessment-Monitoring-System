import { useState } from 'react';
import { Bell, Clock } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../components/ui/popover';
import { ScrollArea } from '../components/ui/scroll-area';
import { Separator } from '../components/ui/separator';
import {
  mockNotifications,
  NotificationStatus,
  Notification,
} from '../lib/mockNotifications';

const getStatusBadgeColor = (status: NotificationStatus) => {
  switch (status) {
  case 'High':
    return 'bg-red-100 text-red-800 border-red-300';
  case 'Moderate':
    return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  case 'Normal':
    return 'bg-green-100 text-green-800 border-green-300';
  }
};

const formatTimestamp = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

export interface NotificationBellProps {
  notifications?: Notification[];
  onNotificationClick?: (notification: Notification) => void;
  onMarkAsRead?: (notificationId: string) => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  notifications = mockNotifications,
  onNotificationClick,
  onMarkAsRead,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      onMarkAsRead?.(notification.id);
    }
    onNotificationClick?.(notification);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-10 w-10 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <Bell className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-full max-w-sm p-0" align="end">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
            Notifications
          </h2>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount} new
            </Badge>
          )}
        </div>

        {/* Notifications List */}
        {notifications.length > 0 ? (
          <ScrollArea className="h-96">
            <div className="divide-y">
              {notifications.map((notification, index) => (
                <div key={notification.id}>
                  <button
                    onClick={() => handleNotificationClick(notification)}
                    className={`w-full px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        {/* Patient Name */}
                        <p className="font-semibold text-gray-900 dark:text-gray-50">
                          {notification.patientName}
                        </p>

                        {/* Message */}
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {notification.message}
                        </p>

                        {/* Timestamp and Status */}
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <Clock className="h-3 w-3" />
                            <span>{formatTimestamp(notification.timestamp)}</span>
                          </div>
                          <Badge
                            variant="outline"
                            className={`${getStatusBadgeColor(
                              notification.status
                            )} text-xs`}
                          >
                            {notification.status}
                          </Badge>
                        </div>
                      </div>

                      {/* Unread Indicator */}
                      {!notification.isRead && (
                        <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500" />
                      )}
                    </div>
                  </button>

                  {index < notifications.length - 1 && <Separator />}
                </div>
              ))}
            </div>
          </ScrollArea>
        ) : (
          // Empty State
          <div className="flex h-48 flex-col items-center justify-center text-center">
            <Bell className="mb-3 h-8 w-8 text-gray-400 dark:text-gray-500" />
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              No notifications
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
              You're all caught up!
            </p>
          </div>
        )}

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="px-4 py-3">
              <Button
                variant="outline"
                className="w-full text-xs"
                onClick={() => setIsOpen(false)}
              >
                View All Notifications
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
};
