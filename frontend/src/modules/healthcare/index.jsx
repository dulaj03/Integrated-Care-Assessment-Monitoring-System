/**
 * Healthcare Dashboard Index
 * Main dashboard for doctors and nurses
 */

import React, { useState } from 'react';
import { useI18n } from '../../i18n';
import PatientQueue from './PatientQueue';
import ClinicalDetailView from './ClinicalDetailView';
import './HealthcareDashboard.css';

const HealthcareDashboard = () => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState('queue');
  const [criticalAlerts] = useState([
    {
      id: 1,
      patient: 'Ahmad Hassan',
      alert: 'Blood pressure critical: 160/100',
      severity: 'critical',
      time: '5 minutes ago',
    },
    {
      id: 2,
      patient: 'Priya Silva',
      alert: 'Blood sugar elevated: 250 mg/dL',
      severity: 'warning',
      time: '15 minutes ago',
    },
  ]);

  return (
    <div className="healthcare-dashboard">
      <div className="dashboard-header">
        <h1>{t('healthcare.dashboard')}</h1>
        <p>Manage your assigned patients and provide clinical care.</p>
      </div>

      {criticalAlerts.length > 0 && (
        <div className="alerts-banner">
          <h3>🚨 Active Alerts</h3>
          <div className="alerts-scroll">
            {criticalAlerts.map((alert) => (
              <div key={alert.id} className={`alert-banner-item ${alert.severity}`}>
                <strong>{alert.patient}</strong> - {alert.alert}
                <span className="alert-time">{alert.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === 'queue' ? 'active' : ''}`}
          onClick={() => setActiveTab('queue')}
        >
          👥 {t('healthcare.patientQueue')}
        </button>
        <button
          className={`tab-button ${activeTab === 'clinical' ? 'active' : ''}`}
          onClick={() => setActiveTab('clinical')}
        >
          📋 {t('healthcare.clinicalDetails')}
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'queue' && <PatientQueue />}
        {activeTab === 'clinical' && <ClinicalDetailView />}
      </div>
    </div>
  );
};

export default HealthcareDashboard;
