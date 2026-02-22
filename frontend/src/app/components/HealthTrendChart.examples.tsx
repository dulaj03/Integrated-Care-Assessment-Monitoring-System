/**
 * HealthTrendChart & Filtering - Usage Examples
 * 
 * Demonstrates various ways to use the HealthTrendChart component
 * and trend filtering utilities
 */

import { HealthTrendChart } from './HealthTrendChart';
import { Patient } from '../lib/mockData';
import {
  filterLogsByDays,
  calculateAverageVital,
  calculateAverageBloodPressure,
  detectVitalAnomalies,
  getTrendDirection,
  getHealthPeriodSummary,
} from '../lib/trendFilterUtils';

/**
 * Example 1: Basic Chart Integration
 * Display patient health trends with default weekly view
 */
export const Example1_BasicChart = ({ patient }: { patient: Patient }) => {
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Patient Health Overview</h2>

      {/* Chart renders with weekly/monthly toggle buttons */}
      <HealthTrendChart
        logs={patient.logs}
        title="Vitals Trend"
        height={350}
      />
    </div>
  );
};

/**
 * Example 2: Using Filtering Utilities
 * Analyze last 7 days of data programmatically
 */
export const Example2_WeeklyAnalysis = ({ patient }: { patient: Patient }) => {
  const weeklyLogs = filterLogsByDays(patient.logs, 7);
  const avgHR = calculateAverageVital(weeklyLogs, 'heartRate');
  const avgO2 = calculateAverageVital(weeklyLogs, 'oxygenLevel');

  return (
    <div className="p-6 bg-white dark:bg-slate-900 rounded-lg">
      <h3 className="text-lg font-bold mb-4">Last 7 Days Summary</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-slate-600 dark:text-slate-400">Avg Heart Rate</p>
          <p className="text-2xl font-bold text-red-600">{avgHR} bpm</p>
        </div>
        <div>
          <p className="text-slate-600 dark:text-slate-400">Avg SpO2</p>
          <p className="text-2xl font-bold text-green-600">{avgO2}%</p>
        </div>
      </div>
    </div>
  );
};

/**
 * Example 3: Monthly Comparison
 * Compare 30-day average and detect trends
 */
export const Example3_MonthlyComparison = ({ patient }: { patient: Patient }) => {
  const monthlyLogs = filterLogsByDays(patient.logs, 30);
  const bpAvg = calculateAverageBloodPressure(monthlyLogs);
  const hrTrend = getTrendDirection(monthlyLogs, 'heartRate');
  const o2Trend = getTrendDirection(monthlyLogs, 'oxygenLevel');

  return (
    <div className="p-6 space-y-4">
      <h3 className="text-lg font-bold">Monthly Trends</h3>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-2">Blood Pressure Average</p>
        <p className="text-2xl font-bold text-blue-600">
          {bpAvg.avgSystolic}/{bpAvg.avgDiastolic} mmHg
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className={`p-4 rounded-lg ${hrTrend === 'improving' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-yellow-50 dark:bg-yellow-900/20'
          }`}>
          <p className="text-sm text-slate-700 dark:text-slate-300">Heart Rate</p>
          <p className="text-lg font-bold capitalize text-green-600">
            {hrTrend === 'improving' ? '↓ Improving' : hrTrend === 'stable' ? '→ Stable' : '↑ Declining'}
          </p>
        </div>

        <div className={`p-4 rounded-lg ${o2Trend === 'improving' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-yellow-50 dark:bg-yellow-900/20'
          }`}>
          <p className="text-sm text-slate-700 dark:text-slate-300">SpO2 Level</p>
          <p className="text-lg font-bold capitalize text-green-600">
            {o2Trend === 'improving' ? '↑ Improving' : o2Trend === 'stable' ? '→ Stable' : '↓ Declining'}
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Example 4: Anomaly Detection
 * Find unusual vital readings
 */
export const Example4_AnomalyDetection = ({ patient }: { patient: Patient }) => {
  const recentLogs = filterLogsByDays(patient.logs, 7);
  const anomalies = detectVitalAnomalies(recentLogs);

  return (
    <div className="p-6 bg-white dark:bg-slate-900 rounded-lg space-y-4">
      <h3 className="text-lg font-bold">Health Alerts (Last 7 Days)</h3>

      {anomalies.total === 0 ? (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-700 dark:text-green-400">
          ✓ No concerning vitals detected
        </div>
      ) : (
        <div className="space-y-2">
          {anomalies.heartRateAnomalies > 0 && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-800">
              <p className="font-medium text-yellow-800 dark:text-yellow-300">
                Heart Rate Alert: {anomalies.heartRateAnomalies} readings outside normal range (60-100 bpm)
              </p>
            </div>
          )}

          {anomalies.oxygenAnomalies > 0 && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
              <p className="font-medium text-red-800 dark:text-red-300">
                Oxygen Alert: {anomalies.oxygenAnomalies} readings below 95%
              </p>
            </div>
          )}

          {anomalies.bloodPressureAnomalies > 0 && (
            <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded border border-orange-200 dark:border-orange-800">
              <p className="font-medium text-orange-800 dark:text-orange-300">
                BP Alert: {anomalies.bloodPressureAnomalies} high systolic readings (&gt;130 mmHg)
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Example 5: Period Summary
 * Get complete summary for a period
 */
export const Example5_PeriodSummary = ({ patient }: { patient: Patient }) => {
  const weeklySummary = getHealthPeriodSummary(patient.logs, 'weekly');
  const monthlySummary = getHealthPeriodSummary(patient.logs, 'monthly');

  if (!weeklySummary || !monthlySummary) {
    return <div className="p-6 text-slate-500">No data available</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <h3 className="text-lg font-bold">Health Summary Comparison</h3>

      {/* Weekly Summary */}
      <div className="border-l-4 border-blue-500 pl-4">
        <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Weekly (Last 7 Days)</h4>
        <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
          <p>📊 Data Points: {weeklySummary.dataPoints}</p>
          <p>💓 Avg HR: {weeklySummary.avgHeartRate} bpm</p>
          <p>🫁 Avg SpO2: {weeklySummary.avgOxygen}%</p>
          <p>🩸 Avg Systolic: {weeklySummary.avgSystolic} mmHg</p>
          {weeklySummary.anomaliesFound && (
            <p className="text-orange-600">⚠️ {weeklySummary.anomalyCount} anomalies detected</p>
          )}
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="border-l-4 border-green-500 pl-4">
        <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Monthly (Last 30 Days)</h4>
        <div className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
          <p>📊 Data Points: {monthlySummary.dataPoints}</p>
          <p>💓 Avg HR: {monthlySummary.avgHeartRate} bpm</p>
          <p>🫁 Avg SpO2: {monthlySummary.avgOxygen}%</p>
          <p>🩸 Avg Systolic: {monthlySummary.avgSystolic} mmHg</p>
          {monthlySummary.anomaliesFound && (
            <p className="text-orange-600">⚠️ {monthlySummary.anomalyCount} anomalies detected</p>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Example 6: Integrated Dashboard
 * Complete dashboard with chart + analytics
 */
export const Example6_DashboardIntegration = ({ patient }: { patient: Patient }) => {
  const summary = getHealthPeriodSummary(patient.logs, 'weekly');

  return (
    <div className="space-y-6">
      {/* Main Chart */}
      <HealthTrendChart
        logs={patient.logs}
        title={`Health Trends - ${patient.name}`}
        height={380}
      />

      {/* Quick Stats */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow">
            <p className="text-sm text-slate-600 dark:text-slate-400">Weekly Avg HR</p>
            <p className="text-3xl font-bold text-red-600">{summary.avgHeartRate}</p>
            <p className="text-xs text-slate-500 mt-1">bpm</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow">
            <p className="text-sm text-slate-600 dark:text-slate-400">Weekly Avg O2</p>
            <p className="text-3xl font-bold text-green-600">{summary.avgOxygen}</p>
            <p className="text-xs text-slate-500 mt-1">% (Goal: 95%+)</p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow">
            <p className="text-sm text-slate-600 dark:text-slate-400">Status</p>
            <p className={`text-2xl font-bold ${summary.anomalyCount === 0 ? 'text-green-600' : 'text-yellow-600'
              }`}>
              {summary.anomalyCount === 0 ? 'Stable' : `${summary.anomalyCount} Alert${summary.anomalyCount !== 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Example 7: Real-time Alerts Dashboard
 * Shows which patients have concerning trends
 */
export const Example7_RealTimeAlerts = ({ patients }: { patients: Patient[] }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-6">Patient Alert Summary</h2>

      {patients.map(patient => {
        const summary = getHealthPeriodSummary(patient.logs, 'weekly');
        if (!summary) return null;

        return (
          <div
            key={patient.id}
            className={`p-4 rounded-lg border-l-4 ${summary.anomalyCount > 0
                ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                : 'bg-green-50 dark:bg-green-900/20 border-green-500'
              }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">{patient.name}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  HR: {summary.avgHeartRate} bpm • SpO2: {summary.avgOxygen}% •
                  BP: {summary.avgSystolic} mmHg
                </p>
              </div>
              <div className="text-right">
                {summary.anomalyCount > 0 ? (
                  <p className="text-orange-600 dark:text-orange-400 font-bold">
                    {summary.anomalyCount} Alert{summary.anomalyCount !== 1 ? 's' : ''}
                  </p>
                ) : (
                  <p className="text-green-600 dark:text-green-400 font-bold">✓ Stable</p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
