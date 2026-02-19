/**
 * Patient Queue Component
 * Displays list of assigned patients with status indicators
 */

import React, { useState, useEffect } from 'react';
import { useI18n } from '../../i18n';
import './PatientQueue.css';

const PatientQueue = () => {
  const { t } = useI18n();
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);

  useEffect(() => {
    // Mock patient data
    setPatients([
      {
        id: 1,
        name: 'Raj Kumar',
        age: 52,
        condition: 'Hypertension',
        lastUpdate: '2 hours ago',
        status: 'healthy', // green
        bloodPressure: '120/80',
        riskLevel: 'Low',
      },
      {
        id: 2,
        name: 'Priya Silva',
        age: 38,
        condition: 'Diabetes Type 2',
        lastUpdate: '30 minutes ago',
        status: 'moderate', // yellow
        bloodSugar: '180 mg/dL',
        riskLevel: 'Medium',
      },
      {
        id: 3,
        name: 'Ahmad Hassan',
        age: 65,
        condition: 'Heart Disease',
        lastUpdate: '45 minutes ago',
        status: 'critical', // red
        bloodPressure: '160/100',
        riskLevel: 'High',
      },
      {
        id: 4,
        name: 'Sophia Fernando',
        age: 45,
        condition: 'Asthma',
        lastUpdate: '1 hour ago',
        status: 'healthy',
        symptoms: 'Controlled',
        riskLevel: 'Low',
      },
    ]);
  }, []);

  const getStatusIcon = (status) => {
    const icons = {
      healthy: '🟢',
      moderate: '🟡',
      critical: '🔴',
    };
    return icons[status] || '⚪';
  };

  const getStatusLabel = (status) => {
    const labels = {
      healthy: 'Healthy',
      moderate: 'Caution',
      critical: 'Critical',
    };
    return labels[status] || 'Unknown';
  };

  return (
    <div className="patient-queue">
      <h2>{t('healthcare.patientQueue')}</h2>

      <div className="queue-container">
        <div className="queue-list">
          <div className="queue-header">
            <span className="col-name">Patient Name</span>
            <span className="col-condition">Condition</span>
            <span className="col-status">Status</span>
            <span className="col-risk">Risk Level</span>
            <span className="col-update">Last Update</span>
          </div>

          {patients.map((patient) => (
            <div
              key={patient.id}
              className={`queue-item ${patient.status} ${selectedPatient?.id === patient.id ? 'selected' : ''
                }`}
              onClick={() => setSelectedPatient(patient)}
            >
              <span className="col-name">
                <div className="patient-avatar">{patient.name.charAt(0)}</div>
                {patient.name}
              </span>
              <span className="col-condition">
                <span className="age-badge">{patient.age}y</span>
                {patient.condition}
              </span>
              <span className="col-status">
                <span className={`status-indicator ${patient.status}`}>
                  {getStatusIcon(patient.status)}
                </span>
                {getStatusLabel(patient.status)}
              </span>
              <span className="col-risk">
                <span className={`risk-badge risk-${patient.riskLevel.toLowerCase()}`}>
                  {patient.riskLevel}
                </span>
              </span>
              <span className="col-update">{patient.lastUpdate}</span>
            </div>
          ))}
        </div>

        {selectedPatient && (
          <div className="queue-details">
            <div className="details-header">
              <h3>{selectedPatient.name}</h3>
              <button
                className="btn-close"
                onClick={() => setSelectedPatient(null)}
              >
                ✕
              </button>
            </div>

            <div className="details-content">
              <div className="detail-row">
                <span className="detail-label">Age:</span>
                <span className="detail-value">{selectedPatient.age} years</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Condition:</span>
                <span className="detail-value">{selectedPatient.condition}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status:</span>
                <span className={`detail-value status-${selectedPatient.status}`}>
                  {getStatusLabel(selectedPatient.status)}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Risk Level:</span>
                <span className={`detail-value risk-${selectedPatient.riskLevel.toLowerCase()}`}>
                  {selectedPatient.riskLevel}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Last Update:</span>
                <span className="detail-value">{selectedPatient.lastUpdate}</span>
              </div>

              <div className="action-buttons">
                <button className="btn btn-primary">📋 View Details</button>
                <button className="btn btn-secondary">💬 Message Patient</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientQueue;
