/**
 * App Constants
 * Centralized constants for the application
 */

export const APP_CONFIG = {
  name: 'I-CAMS',
  version: '1.0.0',
  apiBaseUrl: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  apiTimeout: 30000, // 30 seconds
};

export const ROUTES = {
  // Public routes
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  HOME: '/',

  // Patient routes
  PATIENT_DASHBOARD: '/patient/dashboard',
  PATIENT_PROFILE: '/patient/profile',
  PATIENT_HEALTH: '/patient/health',
  PATIENT_APPOINTMENTS: '/patient/appointments',

  // Healthcare routes
  HEALTHCARE_DASHBOARD: '/healthcare/dashboard',
  HEALTHCARE_PATIENTS: '/healthcare/patients',
  HEALTHCARE_REPORTS: '/healthcare/reports',

  // Common routes
  MESSAGES: '/messages',
  NOTIFICATIONS: '/notifications',
  SETTINGS: '/settings',
  PROFILE: '/profile',

  // Error routes
  UNAUTHORIZED: '/unauthorized',
  NOT_FOUND: '/not-found',
  ERROR: '/error',
};

export const HEALTH_METRICS = {
  BLOOD_PRESSURE: {
    optimal: { systolic: [120, 129], diastolic: [80, 84] },
    elevated: { systolic: [130, 139], diastolic: [80, 89] },
    stage1: { systolic: [140, 159], diastolic: [90, 99] },
    stage2: { systolic: [160, 100000], diastolic: [100, 100000] },
  },
  BLOOD_SUGAR: {
    normal: [70, 100],
    prediabetic: [101, 125],
    diabetic: [126, 100000],
  },
  TEMPERATURE: {
    normal: [36.5, 37.5],
    fever: [37.6, 100],
    hypothermia: [0, 36.4],
  },
};

export const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'noshow',
};

export const NOTIFICATION_TYPES = {
  MEDICATION_REMINDER: 'medication_reminder',
  APPOINTMENT_REMINDER: 'appointment_reminder',
  TEST_RESULT: 'test_result',
  ALERT: 'alert',
  MESSAGE: 'message',
};

export const SEVERITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

export const LANGUAGES = {
  EN: 'en',
  SI: 'si',
  TA: 'ta',
};

export const DEFAULT_LANGUAGE = 'en';

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh',
  VERIFY_EMAIL: '/auth/verify-email',

  // Users
  GET_PROFILE: '/users/profile',
  UPDATE_PROFILE: '/users/profile',
  GET_USER: '/users/:id',

  // Patients
  GET_PATIENTS: '/patients',
  GET_PATIENT: '/patients/:id',
  CREATE_PATIENT_RECORD: '/patients/:id/records',
  GET_PATIENT_RECORDS: '/patients/:id/records',

  // Health Data
  ADD_HEALTH_DATA: '/health-data',
  GET_HEALTH_DATA: '/health-data',
  GET_HEALTH_TRENDS: '/health-data/trends',

  // Appointments
  GET_APPOINTMENTS: '/appointments',
  CREATE_APPOINTMENT: '/appointments',
  UPDATE_APPOINTMENT: '/appointments/:id',
  CANCEL_APPOINTMENT: '/appointments/:id/cancel',

  // Messages
  GET_MESSAGES: '/messages',
  SEND_MESSAGE: '/messages',
  GET_CONVERSATIONS: '/conversations',

  // Notifications
  GET_NOTIFICATIONS: '/notifications',
  MARK_NOTIFICATION_READ: '/notifications/:id/read',
};

const appConstants = {
  APP_CONFIG,
  ROUTES,
  HEALTH_METRICS,
  APPOINTMENT_STATUS,
  NOTIFICATION_TYPES,
  SEVERITY_LEVELS,
  LANGUAGES,
  DEFAULT_LANGUAGE,
  API_ENDPOINTS,
};

export default appConstants;
