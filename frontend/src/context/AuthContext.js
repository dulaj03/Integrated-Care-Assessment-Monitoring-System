/**
 * I-CAMS Role-Based Access Control (RBAC)
 * Context for managing user roles and permissions
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const AuthContext = createContext();

export const USER_ROLES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
  NURSE: 'nurse',
  ADMIN: 'admin',
};

export const PERMISSIONS = {
  // Patient permissions
  VIEW_OWN_HEALTH_DATA: 'view_own_health_data',
  UPDATE_OWN_HEALTH_DATA: 'update_own_health_data',
  VIEW_MEDICATIONS: 'view_medications',
  VIEW_APPOINTMENTS: 'view_appointments',
  MESSAGE_PROVIDERS: 'message_providers',

  // Healthcare provider permissions
  VIEW_PATIENT_DATA: 'view_patient_data',
  UPDATE_PATIENT_DATA: 'update_patient_data',
  MANAGE_MEDICATIONS: 'manage_medications',
  ADD_MEDICAL_INSTRUCTIONS: 'add_medical_instructions',
  VIEW_CRITICAL_ALERTS: 'view_critical_alerts',
  MANAGE_APPOINTMENTS: 'manage_appointments',
  MESSAGE_PATIENTS: 'message_patients',

  // Admin permissions
  MANAGE_USERS: 'manage_users',
  VIEW_ALL_DATA: 'view_all_data',
  SYSTEM_SETTINGS: 'system_settings',
};

const rolePermissions = {
  [USER_ROLES.PATIENT]: [
    PERMISSIONS.VIEW_OWN_HEALTH_DATA,
    PERMISSIONS.UPDATE_OWN_HEALTH_DATA,
    PERMISSIONS.VIEW_MEDICATIONS,
    PERMISSIONS.VIEW_APPOINTMENTS,
    PERMISSIONS.MESSAGE_PROVIDERS,
  ],
  [USER_ROLES.DOCTOR]: [
    PERMISSIONS.VIEW_PATIENT_DATA,
    PERMISSIONS.UPDATE_PATIENT_DATA,
    PERMISSIONS.MANAGE_MEDICATIONS,
    PERMISSIONS.ADD_MEDICAL_INSTRUCTIONS,
    PERMISSIONS.VIEW_CRITICAL_ALERTS,
    PERMISSIONS.MANAGE_APPOINTMENTS,
    PERMISSIONS.MESSAGE_PATIENTS,
  ],
  [USER_ROLES.NURSE]: [
    PERMISSIONS.VIEW_PATIENT_DATA,
    PERMISSIONS.UPDATE_PATIENT_DATA,
    PERMISSIONS.VIEW_MEDICATIONS,
    PERMISSIONS.ADD_MEDICAL_INSTRUCTIONS,
    PERMISSIONS.VIEW_CRITICAL_ALERTS,
    PERMISSIONS.MESSAGE_PATIENTS,
  ],
  [USER_ROLES.ADMIN]: Object.values(PERMISSIONS),
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('icams_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('icams_user');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      const mockUser = {
        id: Date.now().toString(),
        email,
        firstName: 'John',
        lastName: 'Doe',
        role: USER_ROLES.PATIENT,
        avatar: null,
        lastLogin: new Date(),
      };

      setUser(mockUser);
      setIsAuthenticated(true);
      localStorage.setItem('icams_user', JSON.stringify(mockUser));

      return { success: true, user: mockUser };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (userData) => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      const newUser = {
        id: Date.now().toString(),
        ...userData,
        avatar: null,
        createdAt: new Date(),
      };

      setUser(newUser);
      setIsAuthenticated(true);
      localStorage.setItem('icams_user', JSON.stringify(newUser));

      return { success: true, user: newUser };
    } catch (error) {
      console.error('Registration failed:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('icams_user');
  }, []);

  const hasPermission = useCallback(
    (permission) => {
      if (!user) return false;
      const userPermissions = rolePermissions[user.role] || [];
      return userPermissions.includes(permission);
    },
    [user]
  );

  const hasRole = useCallback(
    (role) => {
      if (!user) return false;
      if (Array.isArray(role)) {
        return role.includes(user.role);
      }
      return user.role === role;
    },
    [user]
  );

  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem('icams_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    hasPermission,
    hasRole,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;
