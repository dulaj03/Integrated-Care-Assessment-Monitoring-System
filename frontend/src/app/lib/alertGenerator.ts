import { Notification, NotificationStatus } from './mockNotifications';
import { HealthLog, Patient } from './mockData';

/**
 * Generates health alerts based on pain level from health logs
 * 
 * Alert Rules:
 * - painLevel > 7: "High Risk" alert (status: "High")
 * - painLevel 4-7: "Moderate Risk" alert (status: "Moderate")
 * - painLevel < 4: No alert
 */

export const generateHealthAlerts = (patient: Patient, existingNotifications: Notification[]): Notification[] => {
  const newAlerts: Notification[] = [];

  // Get the most recent health log
  if (patient.logs && patient.logs.length > 0) {
    const latestLog = patient.logs[0]; // Most recent log (index 0)
    const painLevel = latestLog.painLevel ?? 0;

    // Generate unique alert ID based on patient and log
    const alertId = `pain-alert-${patient.id}-${latestLog.date}`;

    // Check if alert for this log already exists
    const alertExists = existingNotifications.some(n => n.id === alertId);

    // High Risk: painLevel > 7
    if (painLevel > 7) {
      if (!alertExists) {
        newAlerts.push({
          id: alertId,
          patientName: patient.name,
          message: `⚠️ HIGH RISK: Patient reported severe pain level of ${painLevel}/10. Immediate attention recommended.`,
          timestamp: new Date(latestLog.date),
          status: 'High',
          isRead: false,
        });
      }
    }
    // Moderate Risk: painLevel between 4-7
    else if (painLevel >= 4 && painLevel <= 7) {
      if (!alertExists) {
        newAlerts.push({
          id: alertId,
          patientName: patient.name,
          message: `📌 MODERATE RISK: Patient reported moderate pain level of ${painLevel}/10. Monitor closely.`,
          timestamp: new Date(latestLog.date),
          status: 'Moderate',
          isRead: false,
        });
      }
    }
    // Low/No Risk: painLevel < 4
    // No alert generated
  }

  return newAlerts;
};

/**
 * Merges generated alerts with existing notifications
 * Prevents duplicates and maintains read status
 */
export const mergeAlerts = (
  existingNotifications: Notification[],
  generatedAlerts: Notification[]
): Notification[] => {
  // Filter out old alerts for the same patients/logs
  const filtered = existingNotifications.filter(n => !n.id.startsWith('pain-alert-'));

  // Add generated alerts only if they don't exist
  const merged = [...generatedAlerts, ...filtered];

  // Remove duplicates (by ID)
  const seen = new Set<string>();
  return merged.filter(n => {
    if (seen.has(n.id)) return false;
    seen.add(n.id);
    return true;
  });
};

/**
 * Check all patients and generate alerts from their latest health logs
 */
export const checkAllPatientAlerts = (
  patients: Patient[],
  existingNotifications: Notification[]
): Notification[] => {
  let allAlerts: Notification[] = [];

  // Generate alerts for each patient
  for (const patient of patients) {
    const patientAlerts = generateHealthAlerts(patient, existingNotifications);
    allAlerts = [...allAlerts, ...patientAlerts];
  }

  // Merge with existing notifications
  return mergeAlerts(existingNotifications, allAlerts);
};

/**
 * Format pain level into a readable risk category
 */
export const getPainRiskCategory = (painLevel: number = 0): {
  category: string;
  severity: NotificationStatus;
  description: string;
} => {
  if (painLevel > 7) {
    return {
      category: 'HIGH RISK',
      severity: 'High',
      description: `Severe pain level: ${painLevel}/10 - Requires immediate attention`,
    };
  } else if (painLevel >= 4) {
    return {
      category: 'MODERATE RISK',
      severity: 'Moderate',
      description: `Moderate pain level: ${painLevel}/10 - Monitor closely`,
    };
  } else {
    return {
      category: 'LOW RISK',
      severity: 'Normal',
      description: `Low pain level: ${painLevel}/10 - No immediate concern`,
    };
  }
};
