/**
 * API Service
 * Centralized API client with error handling and authentication
 */

import { SessionManager } from '../utils/security';
import { APP_CONFIG, API_ENDPOINTS } from '../constants';

class APIClient {
  constructor() {
    this.baseURL = APP_CONFIG.apiBaseUrl;
    this.timeout = APP_CONFIG.apiTimeout;
  }

  getHeaders() {
    const token = localStorage.getItem('icams_auth_token');
    return {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      timeout: this.timeout,
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (response.status === 401) {
        // Token expired, redirect to login
        SessionManager.clearSession();
        window.location.href = '/login';
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error: ${endpoint}`, error);
      throw error;
    }
  }

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

const apiClient = new APIClient();

// Auth API
export const authAPI = {
  login: (email, password) =>
    apiClient.post(API_ENDPOINTS.LOGIN, { email, password }),
  register: (data) =>
    apiClient.post(API_ENDPOINTS.REGISTER, data),
  logout: () =>
    apiClient.post(API_ENDPOINTS.LOGOUT, {}),
  verifyEmail: (token) =>
    apiClient.post(API_ENDPOINTS.VERIFY_EMAIL, { token }),
};

// User API
export const userAPI = {
  getProfile: () =>
    apiClient.get(API_ENDPOINTS.GET_PROFILE),
  updateProfile: (data) =>
    apiClient.put(API_ENDPOINTS.UPDATE_PROFILE, data),
};

// Patient API
export const patientAPI = {
  getPatients: () =>
    apiClient.get(API_ENDPOINTS.GET_PATIENTS),
  getPatient: (id) =>
    apiClient.get(API_ENDPOINTS.GET_PATIENT.replace(':id', id)),
  addHealthData: (patientId, data) =>
    apiClient.post(API_ENDPOINTS.ADD_HEALTH_DATA, { patientId, ...data }),
  getHealthData: (patientId) =>
    apiClient.get(`${API_ENDPOINTS.GET_HEALTH_DATA}?patientId=${patientId}`),
  getHealthTrends: (patientId) =>
    apiClient.get(API_ENDPOINTS.GET_HEALTH_TRENDS.replace(':id', patientId)),
};

// Appointment API
export const appointmentAPI = {
  getAppointments: () =>
    apiClient.get(API_ENDPOINTS.GET_APPOINTMENTS),
  createAppointment: (data) =>
    apiClient.post(API_ENDPOINTS.CREATE_APPOINTMENT, data),
  updateAppointment: (id, data) =>
    apiClient.put(API_ENDPOINTS.UPDATE_APPOINTMENT.replace(':id', id), data),
  cancelAppointment: (id) =>
    apiClient.post(API_ENDPOINTS.CANCEL_APPOINTMENT.replace(':id', id), {}),
};

// Message API
export const messageAPI = {
  getMessages: () =>
    apiClient.get(API_ENDPOINTS.GET_MESSAGES),
  sendMessage: (data) =>
    apiClient.post(API_ENDPOINTS.SEND_MESSAGE, data),
  getConversations: () =>
    apiClient.get(API_ENDPOINTS.GET_CONVERSATIONS),
};

// Notification API
export const notificationAPI = {
  getNotifications: () =>
    apiClient.get(API_ENDPOINTS.GET_NOTIFICATIONS),
  markAsRead: (id) =>
    apiClient.post(API_ENDPOINTS.MARK_NOTIFICATION_READ.replace(':id', id), {}),
};

export default apiClient;
