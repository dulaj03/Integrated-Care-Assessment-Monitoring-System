/**
 * StatusBadge Component - Usage Examples
 *
 * Demonstrates various ways to use the StatusBadge component
 */

import { StatusBadge, StatusIndicator, StatusRow } from './StatusBadge';
import { Patient } from '../lib/mockData';

/**
 * Example 1: Basic Usage
 * Display patient status based on condition severity
 */
export const Example1_BasicStatus = () => {
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-lg font-bold">Status Levels</h2>

      {/* Stable */}
      <div className="flex items-center gap-4">
        <label className="w-32 font-semibold">Stable (0-3):</label>
        <StatusBadge severity={2} />
      </div>

      {/* Moderate */}
      <div className="flex items-center gap-4">
        <label className="w-32 font-semibold">Moderate (4-7):</label>
        <StatusBadge severity={5} />
      </div>

      {/* Critical */}
      <div className="flex items-center gap-4">
        <label className="w-32 font-semibold">Critical (8-10):</label>
        <StatusBadge severity={9} />
      </div>
    </div>
  );
};

/**
 * Example 2: Different Sizes
 */
export const Example2_Sizes = () => {
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-lg font-bold">Size Variants</h2>

      <div className="flex items-center gap-4">
        <label className="w-20 font-semibold">Small:</label>
        <StatusBadge severity={3} size="sm" />
      </div>

      <div className="flex items-center gap-4">
        <label className="w-20 font-semibold">Medium:</label>
        <StatusBadge severity={5} size="md" />
      </div>

      <div className="flex items-center gap-4">
        <label className="w-20 font-semibold">Large:</label>
        <StatusBadge severity={8} size="lg" />
      </div>
    </div>
  );
};

/**
 * Example 3: Patient List with Status
 */
export const Example3_PatientList = ({ patients }: { patients: Patient[] }) => {
  // Map patient status to severity number
  const getPatientSeverity = (status: Patient['status']) => {
    switch (status) {
    case 'recovered':
      return 0;
    case 'stable':
      return 2;
    case 'monitoring':
      return 5;
    case 'critical':
      return 9;
    default:
      return 5;
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-lg font-bold mb-4">Patient Status Overview</h2>

      <div className="space-y-3">
        {patients.map((patient) => (
          <div
            key={patient.id}
            className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
          >
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">
                {patient.name}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {patient.condition}
              </p>
            </div>

            <StatusBadge
              severity={getPatientSeverity(patient.status)}
              size="md"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Example 4: Custom Labels
 */
export const Example4_CustomLabels = () => {
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-lg font-bold">Custom Labels</h2>

      <div className="flex items-center gap-4">
        <label className="w-40">Pain Level 2:</label>
        <StatusBadge severity={2} label="No Pain" />
      </div>

      <div className="flex items-center gap-4">
        <label className="w-40">Pain Level 5:</label>
        <StatusBadge severity={5} label="Mild Discomfort" />
      </div>

      <div className="flex items-center gap-4">
        <label className="w-40">Pain Level 9:</label>
        <StatusBadge severity={9} label="Severe Pain" />
      </div>
    </div>
  );
};

/**
 * Example 5: StatusIndicator (Compact Dot)
 */
export const Example5_Indicators = () => {
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-lg font-bold">Compact Indicators</h2>

      <div className="flex items-center gap-4">
        <label className="w-20">Stable:</label>
        <StatusIndicator severity={2} size="md" />
      </div>

      <div className="flex items-center gap-4">
        <label className="w-20">Moderate:</label>
        <StatusIndicator severity={5} size="md" />
      </div>

      <div className="flex items-center gap-4">
        <label className="w-20">Critical:</label>
        <StatusIndicator severity={9} size="md" animated />
      </div>
    </div>
  );
};

/**
 * Example 6: StatusRow (Combined)
 */
export const Example6_StatusRows = () => {
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-lg font-bold">Combined Indicator + Badge</h2>

      <div>
        <p className="text-sm font-semibold mb-2">Patient A:</p>
        <StatusRow severity={2} label="Stable" />
      </div>

      <div>
        <p className="text-sm font-semibold mb-2">Patient B:</p>
        <StatusRow severity={5} label="Monitoring" />
      </div>

      <div>
        <p className="text-sm font-semibold mb-2">Patient C:</p>
        <StatusRow severity={9} label="Critical" animated />
      </div>
    </div>
  );
};

/**
 * Example 7: Health Dashboard Card
 */
export const Example7_HealthCard = ({ patient }: { patient: Patient }) => {
  // Calculate patient severity from their logs
  const latestLog = patient.logs[0];
  const patientSeverity = latestLog?.painLevel ?? 0;

  return (
    <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-lg shadow-lg overflow-hidden border border-slate-200 dark:border-slate-800">
      {/* Header with Status */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">
            {patient.name}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {patient.condition}
          </p>
        </div>
        <StatusBadge severity={patientSeverity} size="lg" />
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-600 dark:text-slate-400">Age:</span>
          <span className="font-semibold text-slate-900 dark:text-white">
            {patient.age} years
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-600 dark:text-slate-400">
            Pain Level:
          </span>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900 dark:text-white">
              {patientSeverity}/10
            </span>
            <StatusIndicator severity={patientSeverity} animated />
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-600 dark:text-slate-400">
            Last Update:
          </span>
          <span className="text-sm text-slate-800 dark:text-slate-200">
            {new Date(patient.lastUpdate).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-800">
        <button className="w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
          View Details
        </button>
      </div>
    </div>
  );
};

/**
 * Example 8: Severity Mapper with Pain Levels
 */
export const Example8_PainLevelMapper = () => {
  const painLevels = [
    { level: 1, description: 'No Pain' },
    { level: 3, description: 'Mild' },
    { level: 5, description: 'Moderate' },
    { level: 7, description: 'Significant' },
    { level: 9, description: 'Severe' },
  ];

  return (
    <div className="p-6">
      <h2 className="text-lg font-bold mb-4">Pain Level Mapping</h2>

      <div className="space-y-3">
        {painLevels.map(({ level, description }) => (
          <div
            key={level}
            className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-mono text-slate-600 dark:text-slate-400">
                {level}/10
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {description}
              </span>
            </div>
            <StatusBadge severity={level} size="sm" showIcon={false} />
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Example 9: Interactive Status Selection
 */
export const Example9_Interactive = () => {
  const [selectedSeverity, setSelectedSeverity] = React.useState(5);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-bold mb-4">Interactive Status</h2>
        <div className="flex items-center justify-center gap-4">
          <StatusBadge severity={selectedSeverity} size="lg" />
          <div className="text-sm text-slate-600 dark:text-slate-400 font-mono">
            Severity: {selectedSeverity}/10
          </div>
        </div>
      </div>

      <input
        type="range"
        min="0"
        max="10"
        value={selectedSeverity}
        onChange={(e) => setSelectedSeverity(Number(e.target.value))}
        className="w-full"
      />

      <div className="grid grid-cols-3 gap-2">
        {[0, 3, 5, 7, 10].map((value) => (
          <button
            key={value}
            onClick={() => setSelectedSeverity(value)}
            className={`p-2 rounded-lg border transition-colors ${selectedSeverity === value
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:border-blue-600'
            }`}
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  );
};

/**
 * Example 10: Alert Dashboard
 */
export const Example10_AlertDashboard = () => {
  const alerts = [
    { id: 1, patient: 'John Smith', severity: 9, condition: 'Severe pain' },
    { id: 2, patient: 'Sarah Jane', severity: 5, condition: 'Moderate discomfort' },
    { id: 3, patient: 'Mike Johnson', severity: 2, condition: 'Stable' },
  ];

  return (
    <div className="p-6">
      <h2 className="text-lg font-bold mb-4">Active Alerts</h2>

      <div className="space-y-2">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
          >
            <div className="flex-1">
              <p className="font-semibold text-slate-900 dark:text-white">
                {alert.patient}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {alert.condition}
              </p>
            </div>
            <StatusRow severity={alert.severity} animated={alert.severity > 7} />
          </div>
        ))}
      </div>
    </div>
  );
};

// Import React if not already imported
import React from 'react';
