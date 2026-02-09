import React from 'react';
import './HealthUpdate.css';

const HealthUpdate = () => {
  const [formData, setFormData] = React.useState({
    symptoms: '',
    bloodPressure: '',
    heartRate: '',
    glucose: '',
    temperature: '',
    notes: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Submit health update logic
    console.log('Health update submitted:', formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="health-update">
      <div className="page-header">
        <h2>Update Health Status</h2>
        <p>Report your current health condition and symptoms</p>
      </div>

      <form onSubmit={handleSubmit} className="health-form">
        <div className="form-section">
          <h3>Vital Signs</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Blood Pressure</label>
              <input
                type="text"
                name="bloodPressure"
                placeholder="e.g., 120/80"
                value={formData.bloodPressure}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Heart Rate (bpm)</label>
              <input
                type="number"
                name="heartRate"
                placeholder="e.g., 72"
                value={formData.heartRate}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Glucose Level (mg/dL)</label>
              <input
                type="number"
                name="glucose"
                placeholder="e.g., 95"
                value={formData.glucose}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Temperature (°F)</label>
              <input
                type="number"
                name="temperature"
                placeholder="e.g., 98.6"
                value={formData.temperature}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Symptoms & Notes</h3>
          <div className="form-group">
            <label>Current Symptoms</label>
            <textarea
              name="symptoms"
              rows="3"
              placeholder="Describe any symptoms you're experiencing..."
              value={formData.symptoms}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Additional Notes</label>
            <textarea
              name="notes"
              rows="3"
              placeholder="Any other observations or concerns..."
              value={formData.notes}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Medication & Tests</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Medication Taken Today?</label>
              <div className="radio-group">
                <label>
                  <input type="radio" name="medication" value="yes" /> Yes
                </label>
                <label>
                  <input type="radio" name="medication" value="no" /> No
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Any Side Effects?</label>
              <textarea
                rows="2"
                placeholder="Report any side effects..."
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Submit Health Update
          </button>
          <button type="button" className="btn">
            Save as Draft
          </button>
        </div>
      </form>
    </div>
  );
};

export default HealthUpdate;