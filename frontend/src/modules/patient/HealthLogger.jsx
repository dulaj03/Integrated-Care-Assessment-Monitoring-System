/**
 * Health Logger Component
 * Allows patients to log symptoms, test results, and daily health status
 */

import React, { useState } from 'react';
import { useI18n } from '../../i18n';
import './HealthLogger.css';

const HealthLogger = () => {
  const { t } = useI18n();
  const [formData, setFormData] = useState({
    symptom: '',
    severity: 'mild',
    bloodPressure: '',
    bloodSugar: '',
    temperature: '',
    notes: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Send to backend
    console.log('Health data submitted:', formData);
    // Reset form
    setFormData({
      symptom: '',
      severity: 'mild',
      bloodPressure: '',
      bloodSugar: '',
      temperature: '',
      notes: '',
    });
  };

  return (
    <div className="health-logger">
      <h2>{t('patient.healthLogger')}</h2>
      <form onSubmit={handleSubmit} className="health-logger-form">
        <div className="form-group">
          <label htmlFor="symptom" className="form-label">
            {t('patient.addSymptom')}
          </label>
          <input
            type="text"
            id="symptom"
            name="symptom"
            value={formData.symptom}
            onChange={handleChange}
            placeholder="e.g., Headache, Fever"
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="severity" className="form-label">
            {t('common.severity') || 'Severity'}
          </label>
          <select
            id="severity"
            name="severity"
            value={formData.severity}
            onChange={handleChange}
            className="form-select"
          >
            <option value="mild">Mild</option>
            <option value="moderate">Moderate</option>
            <option value="severe">Severe</option>
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="bloodPressure" className="form-label">
              Blood Pressure (mmHg)
            </label>
            <input
              type="text"
              id="bloodPressure"
              name="bloodPressure"
              value={formData.bloodPressure}
              onChange={handleChange}
              placeholder="e.g., 120/80"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="bloodSugar" className="form-label">
              Blood Sugar (mg/dL)
            </label>
            <input
              type="number"
              id="bloodSugar"
              name="bloodSugar"
              value={formData.bloodSugar}
              onChange={handleChange}
              placeholder="e.g., 120"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="temperature" className="form-label">
              Temperature (°C)
            </label>
            <input
              type="number"
              id="temperature"
              name="temperature"
              value={formData.temperature}
              onChange={handleChange}
              placeholder="e.g., 98.6"
              step="0.1"
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="notes" className="form-label">
            Additional Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Any additional information..."
            className="form-textarea"
            rows="4"
          />
        </div>

        <button type="submit" className="btn btn-primary">
          {t('common.submit')}
        </button>
      </form>
    </div>
  );
};

export default HealthLogger;
