import React from 'react';
import HealthTrendChart from '../common/HealthTrendChart';
import Notifications from '../common/Notifications';
import './PatientDashboard.css';

const PatientDashboard = () => {
  const [healthData, setHealthData] = React.useState({
    bloodPressure: '120/80',
    heartRate: '72',
    glucose: '95',
    temperature: '98.6',
  });

  const recentUpdates = [
    { id: 1, type: 'medication', message: 'Take medication in 30 minutes', time: '10:30 AM' },
    { id: 2, type: 'test', message: 'Blood test scheduled for tomorrow', time: 'Yesterday' },
    { id: 3, type: 'appointment', message: 'Follow-up appointment with Dr. Smith', time: '2 days ago' },
  ];

  return (
    <div className="patient-dashboard">
      <div className="dashboard-header">
        <h2>Welcome back, John!</h2>
        <p>Last updated: Today, 9:45 AM</p>
      </div>

      <div className="grid-container">
        {/* Health Stats Cards */}
        <div className="health-stats">
          <div className="stat-card">
            <div className="stat-icon">❤️</div>
            <div className="stat-info">
              <h3>Blood Pressure</h3>
              <p className="stat-value">{healthData.bloodPressure}</p>
              <p className="stat-trend">↗️ Slight increase</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">💓</div>
            <div className="stat-info">
              <h3>Heart Rate</h3>
              <p className="stat-value">{healthData.heartRate} bpm</p>
              <p className="stat-trend">➡️ Stable</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🩸</div>
            <div className="stat-info">
              <h3>Glucose Level</h3>
              <p className="stat-value">{healthData.glucose} mg/dL</p>
              <p className="stat-trend">↘️ Improving</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🌡️</div>
            <div className="stat-info">
              <h3>Temperature</h3>
              <p className="stat-value">{healthData.temperature}°F</p>
              <p className="stat-trend">➡️ Normal</p>
            </div>
          </div>
        </div>

        {/* Health Trend Chart */}
        <div className="card">
          <h3>Health Trend Overview</h3>
          <HealthTrendChart />
        </div>

        {/* Quick Actions */}
        <div className="card quick-actions">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <button className="btn btn-primary">
              📝 Update Health Status
            </button>
            <button className="btn btn-secondary">
              📅 Schedule Appointment
            </button>
            <button className="btn">
              💬 Message Care Team
            </button>
            <button className="btn">
              📋 View Test Results
            </button>
          </div>
        </div>

        {/* Recent Updates */}
        <div className="card">
          <h3>Recent Updates & Notifications</h3>
          <Notifications updates={recentUpdates} />
        </div>

        {/* Upcoming Appointments */}
        <div className="card">
          <h3>Upcoming Appointments</h3>
          <div className="appointment-list">
            <div className="appointment-item">
              <div className="appointment-date">
                <span className="day">15</span>
                <span className="month">FEB</span>
              </div>
              <div className="appointment-details">
                <h4>Dr. Sarah Johnson</h4>
                <p>Cardiology Follow-up</p>
                <span className="time">10:00 AM - 10:30 AM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;