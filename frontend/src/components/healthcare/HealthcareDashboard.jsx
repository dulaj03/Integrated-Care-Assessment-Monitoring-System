import React from 'react';
import PatientList from './PatientList';
import AlertSystem from '../common/AlertSystem';
import './HealthcareDashboard.css';

const HealthcareDashboard = ({ userType }) => {
  const [stats, setStats] = React.useState({
    totalPatients: 24,
    activeAlerts: 3,
    pendingUpdates: 5,
    appointmentsToday: 8,
  });

  return (
    <div className="healthcare-dashboard">
      <div className="dashboard-header">
        <h2>Healthcare Provider Dashboard</h2>
        <p>Welcome, {userType === 'nurse' ? 'Nurse' : 'Doctor'} Johnson</p>
      </div>

      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-value">{stats.totalPatients}</div>
          <div className="stat-label">Total Patients</div>
        </div>

        <div className="stat-card alert">
          <div className="stat-value">{stats.activeAlerts}</div>
          <div className="stat-label">Active Alerts</div>
        </div>

        <div className="stat-card warning">
          <div className="stat-value">{stats.pendingUpdates}</div>
          <div className="stat-label">Pending Updates</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{stats.appointmentsToday}</div>
          <div className="stat-label">Today's Appointments</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h3>Recent Patient Updates</h3>
          <PatientList limit={5} />
        </div>

        <div className="card">
          <h3>Alert System</h3>
          <AlertSystem />
        </div>

        <div className="card">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <button className="btn btn-primary">
              👁️ Monitor Patient
            </button>
            <button className="btn btn-secondary">
              📝 Send Instructions
            </button>
            <button className="btn">
              📅 Schedule Follow-up
            </button>
            <button className="btn">
              📋 Generate Report
            </button>
          </div>
        </div>

        <div className="card">
          <h3>Communication Panel</h3>
          <div className="communication-panel">
            <div className="message-input">
              <input type="text" placeholder="Type a message..." />
              <button className="btn btn-primary">Send</button>
            </div>
            <div className="message-list">
              {/* Messages will be listed here */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthcareDashboard;