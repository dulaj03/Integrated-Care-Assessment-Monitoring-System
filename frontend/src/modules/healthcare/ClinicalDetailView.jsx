/**
 * Clinical Detail View Component
 * Displays patient history, diagnostic trends, and medical instruction input
 */

import React, { useState } from 'react';
import { useI18n } from '../../i18n';
import './ClinicalDetailView.css';

const ClinicalDetailView = () => {
  const { t } = useI18n();
  const [instructions, setInstructions] = useState('');
  const [medication, setMedication] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('Once daily');

  const [patientHistory] = useState([
    {
      date: '2024-02-15',
      type: 'Visit',
      notes: 'Regular checkup - Blood pressure elevated',
      provider: 'Dr. Silva',
    },
    {
      date: '2024-02-10',
      type: 'Lab Result',
      notes: 'Blood test completed - Results within normal range',
      provider: 'Lab',
    },
    {
      date: '2024-02-05',
      type: 'Medication Updated',
      notes: 'Increased dosage of Atenolol to 100mg',
      provider: 'Dr. Silva',
    },
  ]);

  const handleAddInstruction = (e) => {
    e.preventDefault();
    console.log('Instruction added:', instructions);
    setInstructions('');
  };

  const handleAddMedication = (e) => {
    e.preventDefault();
    console.log('Medication added:', { medication, dosage, frequency });
    setMedication('');
    setDosage('');
    setFrequency('Once daily');
  };

  return (
    <div className="clinical-detail">
      <h2>{t('healthcare.clinicalDetails')}</h2>

      <div className="clinical-container">
        <div className="clinical-left">
          <div className="section">
            <h3>Patient Medical History</h3>
            <div className="history-timeline">
              {patientHistory.map((entry, index) => (
                <div key={index} className="history-item">
                  <div className="history-date">{entry.date}</div>
                  <div className="history-marker"></div>
                  <div className="history-content">
                    <div className="history-type">{entry.type}</div>
                    <div className="history-notes">{entry.notes}</div>
                    <div className="history-provider">By: {entry.provider}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="section">
            <h3>Diagnostic Trends</h3>
            <div className="trends-placeholder">
              <p>📈 Trend chart integration</p>
              <p style={{ fontSize: '0.85rem', color: '#999', marginTop: '8px' }}>
                Visual representation of patient's test results and vital signs over time
              </p>
            </div>
          </div>
        </div>

        <div className="clinical-right">
          <form onSubmit={handleAddInstruction} className="instruction-form">
            <h3>{t('healthcare.addInstructions')}</h3>
            <div className="form-group">
              <label htmlFor="instructions" className="form-label">
                Medical Instructions
              </label>
              <textarea
                id="instructions"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Enter medical instructions for the patient..."
                rows="5"
                className="form-textarea"
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Add Instructions
            </button>
          </form>

          <form onSubmit={handleAddMedication} className="medication-form">
            <h3>{t('healthcare.updateMedications')}</h3>

            <div className="form-group">
              <label htmlFor="medication" className="form-label">
                Medication Name
              </label>
              <input
                type="text"
                id="medication"
                value={medication}
                onChange={(e) => setMedication(e.target.value)}
                placeholder="e.g., Aspirin, Atenolol"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="dosage" className="form-label">
                Dosage
              </label>
              <input
                type="text"
                id="dosage"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="e.g., 500mg, 100mg"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="frequency" className="form-label">
                Frequency
              </label>
              <select
                id="frequency"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="form-select"
              >
                <option>Once daily</option>
                <option>Twice daily</option>
                <option>Three times daily</option>
                <option>Four times daily</option>
                <option>As needed</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary">
              Add Medication
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ClinicalDetailView;
