/**
 * Progress Tracker Component
 * Displays visual charts and graphs showing health trends
 */

import React, { useState, useEffect } from 'react';
import { useI18n } from '../../i18n';
import './ProgressTracker.css';

const ProgressTracker = () => {
  const { t } = useI18n();

  useEffect(() => {
    // Mock data - replace with actual API call
    const chartData = {
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
      datasets: [
        {
          label: 'Blood Pressure (Systolic)',
          data: [130, 128, 125, 122],
          borderColor: '#0066CC',
          backgroundColor: 'rgba(0, 102, 204, 0.1)',
          tension: 0.4,
        },
        {
          label: 'Blood Sugar (mg/dL)',
          data: [180, 170, 160, 155],
          borderColor: '#DC3545',
          backgroundColor: 'rgba(220, 53, 69, 0.1)',
          tension: 0.4,
        },
      ],
    };
    // chartData is stored in memory for future chart integration
  }, []);

  return (
    <div className="progress-tracker">
      <h2>{t('patient.progressTracker')}</h2>

      <div className="tracker-container">
        <div className="chart-placeholder">
          <div className="chart-info">
            <svg
              className="chart-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="12" y1="20" x2="12" y2="10"></line>
              <line x1="18" y1="20" x2="18" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
            <h3>{t('patient.viewTrends')}</h3>
            <p>📊 Chart.js integration for health trends visualization</p>
            <p style={{ fontSize: '0.85rem', marginTop: '8px', color: '#999' }}>
              Install: npm install chart.js react-chartjs-2
            </p>
          </div>
        </div>

        <div className="trend-summary">
          <h3>Trend Summary</h3>
          <div className="summary-item">
            <span className="summary-label">Blood Pressure</span>
            <span className="summary-value improving">↓ Improving</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Blood Sugar</span>
            <span className="summary-value improving">↓ Improving</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Overall Status</span>
            <span className="summary-value healthy">✓ Healthy</span>
          </div>
        </div>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <h4>Blood Pressure</h4>
          <div className="metric-value">122/80</div>
          <div className="metric-status normal">Normal Range</div>
        </div>
        <div className="metric-card">
          <h4>Blood Sugar</h4>
          <div className="metric-value">155</div>
          <div className="metric-status normal">mg/dL</div>
        </div>
        <div className="metric-card">
          <h4>Temperature</h4>
          <div className="metric-value">98.6</div>
          <div className="metric-status normal">°C - Normal</div>
        </div>
        <div className="metric-card">
          <h4>Last Update</h4>
          <div className="metric-value">2 hours</div>
          <div className="metric-status">ago</div>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracker;
