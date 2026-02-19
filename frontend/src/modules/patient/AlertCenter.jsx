/**
 * Alert Center Component
 * Displays notifications for medication reminders and upcoming tests
 */

import React, { useState, useEffect } from 'react';
import { useI18n } from '../../i18n';
import './AlertCenter.css';

const AlertCenter = () => {
  const { t } = useI18n();
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    // Mock alerts data
    setAlerts([
      {
        id: 1,
        type: 'medication',
        title: 'Medication Reminder',
        message: 'Take Aspirin 500mg with water',
        time: '09:00 AM',
        status: 'active',
        priority: 'high',
      },
      {
        id: 2,
        type: 'test',
        title: 'Upcoming Test',
        message: 'Blood test scheduled for tomorrow at 10:00 AM',
        time: 'Tomorrow',
        status: 'active',
        priority: 'medium',
      },
      {
        id: 3,
        type: 'medication',
        title: 'Medication Reminder',
        message: 'Take Metformin 500mg after breakfast',
        time: '08:00 AM',
        status: 'completed',
        priority: 'high',
      },
      {
        id: 4,
        type: 'appointment',
        title: 'Doctor Consultation',
        message: 'Follow-up appointment with Dr. Silva on Friday',
        time: 'Friday',
        status: 'active',
        priority: 'medium',
      },
    ]);
  }, []);

  const handleMarkAsRead = (id) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id ? { ...alert, status: 'read' } : alert
      )
    );
  };

  const getAlertIcon = (type) => {
    const icons = {
      medication: '💊',
      test: '🧪',
      appointment: '📅',
    };
    return icons[type] || '🔔';
  };

  const getAlertBadgeClass = (priority) => {
    return `alert-badge badge-${priority}`;
  };

  const activeAlerts = alerts.filter((a) => a.status === 'active' || a.status === 'read');
  const completedAlerts = alerts.filter((a) => a.status === 'completed');

  return (
    <div className="alert-center">
      <h2>{t('notifications.title')}</h2>

      <div className="alert-tabs">
        <button className="tab-button active">Active</button>
        <button className="tab-button">Completed</button>
      </div>

      <div className="alerts-section">
        <h3>Active Alerts</h3>
        {activeAlerts.length === 0 ? (
          <p className="no-alerts-message">No active alerts</p>
        ) : (
          <div className="alerts-list">
            {activeAlerts.map((alert) => (
              <div key={alert.id} className={`alert-item alert-${alert.priority}`}>
                <div className="alert-icon">{getAlertIcon(alert.type)}</div>
                <div className="alert-content">
                  <h4 className="alert-title">{alert.title}</h4>
                  <p className="alert-message">{alert.message}</p>
                  <span className="alert-time">{alert.time}</span>
                </div>
                <div className="alert-actions">
                  <span className={getAlertBadgeClass(alert.priority)}>
                    {alert.priority === 'high' ? '⚠️' : '→'} {alert.priority}
                  </span>
                  {alert.status === 'read' ? (
                    <span className="read-badge">✓ Read</span>
                  ) : (
                    <button
                      className="btn-mark-read"
                      onClick={() => handleMarkAsRead(alert.id)}
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="alerts-section completed-section">
        <h3>Completed</h3>
        {completedAlerts.length === 0 ? (
          <p className="no-alerts-message">No completed alerts</p>
        ) : (
          <div className="alerts-list">
            {completedAlerts.map((alert) => (
              <div key={alert.id} className="alert-item alert-completed">
                <div className="alert-icon">{getAlertIcon(alert.type)}</div>
                <div className="alert-content">
                  <h4 className="alert-title">{alert.title}</h4>
                  <p className="alert-message">{alert.message}</p>
                  <span className="alert-time">{alert.time}</span>
                </div>
                <div className="alert-actions">
                  <span className="completed-badge">✓ Completed</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AlertCenter;
