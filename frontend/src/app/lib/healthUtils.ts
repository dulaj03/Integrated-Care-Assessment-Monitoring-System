/**
 * Health Status Calculation Utilities
 * 
 * Functions to calculate health status indicators from health log data
 */

import { HealthLog } from './mockData';

/**
 * Calculate overall health severity from painLevel and symptoms
 * 
 * Scoring:
 * - painLevel: 0-10 (direct mapping)
 * - Symptoms: each symptom adds points
 * 
 * Severity Range: 0-10 (for StatusBadge compatibility)
 */
export const calculateHealthSeverity = (log: HealthLog): number => {
  let severity = 0;

  // Start with pain level (0-10)
  if (log.painLevel !== undefined) {
    severity = log.painLevel;
  }

  // Add severity based on symptom count
  // Each symptom adds 1-2 points depending on the symptom type
  if (log.symptoms && log.symptoms.length > 0) {
    const criticalSymptoms = ['Chest Pain', 'Difficulty Breathing', 'Severe Headache', 'Loss of Consciousness', 'Uncontrollable Bleeding'];
    const moderateSymptoms = ['Moderate Pain', 'Dizziness', 'Nausea', 'Vomiting', 'Shortness of Breath'];

    for (const symptom of log.symptoms) {
      if (criticalSymptoms.includes(symptom)) {
        severity += 3; // Add 3 points for critical symptoms
      } else if (moderateSymptoms.includes(symptom)) {
        severity += 1.5; // Add 1.5 points for moderate symptoms
      } else {
        severity += 1; // Add 1 point for other symptoms
      }
    }
  }

  // Cap severity at 10
  return Math.min(severity, 10);
};

/**
 * Get a descriptive label for the health status
 */
export const getHealthStatusLabel = (severity: number): string => {
  if (severity <= 3) {
    return 'Stable';
  } else if (severity <= 7) {
    return 'Monitoring';
  } else {
    return 'Critical';
  }
};

/**
 * Get symptom severity level (for additional context)
 */
export const getSymptomSeverity = (symptoms: string[]): 'none' | 'mild' | 'moderate' | 'severe' => {
  if (!symptoms || symptoms.length === 0) {
    return 'none';
  }

  const criticalSymptoms = ['Chest Pain', 'Difficulty Breathing', 'Severe Headache', 'Loss of Consciousness', 'Uncontrollable Bleeding'];
  const moderateSymptoms = ['Moderate Pain', 'Dizziness', 'Nausea', 'Vomiting', 'Shortness of Breath'];

  const hasCritical = symptoms.some(s => criticalSymptoms.includes(s));
  const hasModerate = symptoms.some(s => moderateSymptoms.includes(s));

  if (hasCritical) {
    return 'severe';
  } else if (hasModerate || symptoms.length > 2) {
    return 'moderate';
  } else {
    return 'mild';
  }
};

/**
 * Generate a tooltip/description for health status
 */
export const getHealthStatusDescription = (log: HealthLog): string => {
  const severity = calculateHealthSeverity(log);
  const symptomSeverity = getSymptomSeverity(log.symptoms);

  if (severity <= 3) {
    return 'Patient is stable with normal vitals';
  } else if (severity <= 7) {
    return `Patient requires monitoring - ${log.symptoms.length > 0 ? `${log.symptoms.length} symptom(s) reported` : 'vital changes noted'}`;
  } else {
    return `Critical condition - Immediate attention required`;
  }
};
