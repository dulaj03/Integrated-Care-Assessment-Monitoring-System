/**
 * Notification Context and Provider
 * Manages application-wide notifications and alerts
 */

import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  }, []);

  const addNotification = useCallback(
    (message, type = NOTIFICATION_TYPES.INFO, duration = 5000) => {
      const id = Date.now();
      const notification = {
        id,
        message,
        type,
        duration,
      };

      setNotifications((prev) => [...prev, notification]);

      if (duration > 0) {
        setTimeout(() => {
          removeNotification(id);
        }, duration);
      }

      return id;
    },
    [removeNotification]
  );

  const success = useCallback(
    (message, duration = 5000) =>
      addNotification(message, NOTIFICATION_TYPES.SUCCESS, duration),
    [addNotification]
  );

  const error = useCallback(
    (message, duration = 5000) =>
      addNotification(message, NOTIFICATION_TYPES.ERROR, duration),
    [addNotification]
  );

  const warning = useCallback(
    (message, duration = 5000) =>
      addNotification(message, NOTIFICATION_TYPES.WARNING, duration),
    [addNotification]
  );

  const info = useCallback(
    (message, duration = 5000) =>
      addNotification(message, NOTIFICATION_TYPES.INFO, duration),
    [addNotification]
  );

  const value = {
    notifications,
    addNotification,
    removeNotification,
    success,
    error,
    warning,
    info,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

export default NotificationContext;
