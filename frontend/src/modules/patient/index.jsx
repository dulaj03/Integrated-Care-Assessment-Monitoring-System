/**
 * Patient Dashboard Index
 * Main dashboard combining all patient modules
 */

import React, { useState } from 'react';
import { useI18n } from '../../i18n';
import HealthLogger from './HealthLogger';
import ProgressTracker from './ProgressTracker';
import AlertCenter from './AlertCenter';
import './PatientDashboard.css';

const PatientDashboard = () => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState('logger');

  return (
    <div className="patient-dashboard">
      <div className="dashboard-header">
        <h1>{t('patient.dashboard')}</h1>
        <p>Welcome back! Keep tracking your health progress.</p>
      </div>

      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === 'logger' ? 'active' : ''}`}
          onClick={() => setActiveTab('logger')}
        >
          📝 {t('patient.healthLogger')}
        </button>
        <button
          className={`tab-button ${activeTab === 'tracker' ? 'active' : ''}`}
          onClick={() => setActiveTab('tracker')}
        >
          📊 {t('patient.progressTracker')}
        </button>
        <button
          className={`tab-button ${activeTab === 'alerts' ? 'active' : ''}`}
          onClick={() => setActiveTab('alerts')}
        >
          🔔 {t('patient.alertCenter')}
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'logger' && <HealthLogger />}
        {activeTab === 'tracker' && <ProgressTracker />}
        {activeTab === 'alerts' && <AlertCenter />}
      </div>
    </div>
  );
};

export default PatientDashboard;
