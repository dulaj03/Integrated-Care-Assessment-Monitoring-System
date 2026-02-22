/**
 * Health Trend Filtering Utilities
 * 
 * Helper functions for filtering and transforming health log data
 * for trend visualization and analysis.
 */

import { HealthLog } from './mockData';

/**
 * Filter logs by date range based on number of days
 * 
 * @param logs - Array of health logs to filter
 * @param days - Number of days to look back (7 for weekly, 30 for monthly)
 * @returns Array of logs from the past N days
 */
export const filterLogsByDays = (logs: HealthLog[], days: number): HealthLog[] => {
  const now = new Date();
  const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  return logs.filter(log => {
    const logDate = new Date(log.date);
    return logDate >= cutoffDate;
  });
};

/**
 * Calculate average vital over a period
 * 
 * @param logs - Array of health logs
 * @param vitalKey - Which vital to average ('heartRate', 'oxygenLevel', 'temperature')
 * @returns Average value, rounded to nearest integer
 */
export const calculateAverageVital = (
  logs: HealthLog[],
  vitalKey: 'heartRate' | 'oxygenLevel' | 'temperature'
): number => {
  if (logs.length === 0) return 0;

  const total = logs
    .filter(log => log.vitals[vitalKey] !== undefined && log.vitals[vitalKey] !== null)
    .reduce((sum, log) => sum + (log.vitals[vitalKey] as number), 0);

  return Math.round(total / logs.length);
};

/**
 * Calculate average blood pressure (systolic and diastolic)
 * 
 * @param logs - Array of health logs
 * @returns Object with avgSystolic and avgDiastolic
 */
export const calculateAverageBloodPressure = (logs: HealthLog[]): { avgSystolic: number; avgDiastolic: number } => {
  if (logs.length === 0) return { avgSystolic: 0, avgDiastolic: 0 };

  let systolicSum = 0;
  let diastolicSum = 0;
  let count = 0;

  for (const log of logs) {
    if (log.vitals.bloodPressure) {
      const [systolic, diastolic] = log.vitals.bloodPressure.split('/').map(Number);
      if (!isNaN(systolic) && !isNaN(diastolic)) {
        systolicSum += systolic;
        diastolicSum += diastolic;
        count++;
      }
    }
  }

  return {
    avgSystolic: count > 0 ? Math.round(systolicSum / count) : 0,
    avgDiastolic: count > 0 ? Math.round(diastolicSum / count) : 0,
  };
};

/**
 * Detect vital anomalies within a period
 * Returns count of readings outside normal range
 * 
 * Normal ranges:
 * - Heart Rate: 60-100 bpm
 * - SpO2: 95-100%
 * - Systolic BP: < 130 mmHg
 */
export const detectVitalAnomalies = (logs: HealthLog[]) => {
  let heartRateAnomalies = 0;
  let oxygenAnomalies = 0;
  let bloodPressureAnomalies = 0;

  for (const log of logs) {
    // Check heart rate (60-100 bpm)
    if (log.vitals.heartRate && (log.vitals.heartRate < 60 || log.vitals.heartRate > 100)) {
      heartRateAnomalies++;
    }

    // Check oxygen level (95-100%)
    if (log.vitals.oxygenLevel && log.vitals.oxygenLevel < 95) {
      oxygenAnomalies++;
    }

    // Check systolic BP (< 130)
    if (log.vitals.bloodPressure) {
      const systolic = parseInt(log.vitals.bloodPressure.split('/')[0]);
      if (systolic >= 130) {
        bloodPressureAnomalies++;
      }
    }
  }

  return {
    heartRateAnomalies,
    oxygenAnomalies,
    bloodPressureAnomalies,
    total: heartRateAnomalies + oxygenAnomalies + bloodPressureAnomalies,
  };
};

/**
 * Get trend direction for a vital (improving, stable, declining)
 * by comparing first half to second half of period
 */
export const getTrendDirection = (
  logs: HealthLog[],
  vitalKey: 'heartRate' | 'oxygenLevel' | 'temperature'
): 'improving' | 'stable' | 'declining' => {
  if (logs.length < 2) return 'stable';

  const midpoint = Math.floor(logs.length / 2);
  const firstHalf = logs.slice(0, midpoint);
  const secondHalf = logs.slice(midpoint);

  const firstAvg = calculateAverageVital(firstHalf, vitalKey);
  const secondAvg = calculateAverageVital(secondHalf, vitalKey);

  // For oxygen and temperature, higher is better
  // For heart rate, lower (closer to 70) is better
  const isBetterHigher = vitalKey === 'oxygenLevel' || vitalKey === 'temperature';

  if (isBetterHigher) {
    if (secondAvg > firstAvg * 1.02) return 'improving';
    if (secondAvg < firstAvg * 0.98) return 'declining';
  } else {
    if (secondAvg < firstAvg * 0.98) return 'improving';
    if (secondAvg > firstAvg * 1.02) return 'declining';
  }

  return 'stable';
};

/**
 * Get summary of health period for display
 */
export const getHealthPeriodSummary = (logs: HealthLog[], period: 'weekly' | 'monthly') => {
  const days = period === 'weekly' ? 7 : 30;
  const filteredLogs = filterLogsByDays(logs, days);

  if (filteredLogs.length === 0) {
    return null;
  }

  const avgHR = calculateAverageVital(filteredLogs, 'heartRate');
  const avgO2 = calculateAverageVital(filteredLogs, 'oxygenLevel');
  const { avgSystolic } = calculateAverageBloodPressure(filteredLogs);
  const anomalies = detectVitalAnomalies(filteredLogs);

  return {
    period,
    dataPoints: filteredLogs.length,
    avgHeartRate: avgHR,
    avgOxygen: avgO2,
    avgSystolic,
    anomaliesFound: anomalies.total > 0,
    anomalyCount: anomalies.total,
    details: anomalies,
  };
};
