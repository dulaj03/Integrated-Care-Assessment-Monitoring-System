/**
 * I-CAMS Main App Component
 * Root component with all providers and configuration
 */

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { I18nProvider } from './i18n';
import { NotificationProvider } from './context/NotificationContext';
import NotificationDisplay from './modules/notifications';
import ProtectedRoute from './context/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// Modules
import PatientDashboard from './modules/patient';
import HealthcareDashboard from './modules/healthcare';
import MessagingHub from './modules/communication';

// Styles
import './styles/main.css';
import './styles/theme.css';
import './styles/components.css';

// Constants
import { ROUTES, LANGUAGES } from './constants';

function App() {
  useEffect(() => {
    // Initialize app
    console.log('I-CAMS Application Initialized');

    // Set up response interceptors and global error handling
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled Promise Rejection:', event.reason);
    });

    // Check session validity
    const sessionCheckInterval = setInterval(() => {
      const session = localStorage.getItem('icams_session');
      if (session) {
        try {
          const parsedSession = JSON.parse(session);
          if (Date.now() > parsedSession.expiresAt) {
            localStorage.removeItem('icams_session');
            localStorage.removeItem('icams_auth_token');
          }
        } catch (error) {
          console.error('Session check error:', error);
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(sessionCheckInterval);
  }, []);

  return (
    <Router>
      <I18nProvider defaultLanguage={LANGUAGES.EN}>
        <AuthProvider>
          <NotificationProvider>
            <NotificationDisplay />

            <Routes>
              {/* Public Routes */}
              <Route path={ROUTES.HOME} element={<HomePage />} />
              <Route path={ROUTES.LOGIN} element={<Login />} />
              <Route path={ROUTES.REGISTER} element={<Register />} />

              {/* Patient Routes */}
              <Route
                path={ROUTES.PATIENT_DASHBOARD}
                element={
                  <ProtectedRoute requiredRole="patient">
                    <PatientDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Healthcare Routes */}
              <Route
                path={ROUTES.HEALTHCARE_DASHBOARD}
                element={
                  <ProtectedRoute requiredRole={['doctor', 'nurse']}>
                    <HealthcareDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Common Routes */}
              <Route
                path={ROUTES.MESSAGES}
                element={
                  <ProtectedRoute>
                    <MessagingHub />
                  </ProtectedRoute>
                }
              />

              {/* Error Routes */}
              <Route path={ROUTES.UNAUTHORIZED} element={<div>Unauthorized Access</div>} />
              <Route path={ROUTES.NOT_FOUND} element={<div>Page Not Found</div>} />

              {/* Catch-all Route */}
              <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
            </Routes>
          </NotificationProvider>
        </AuthProvider>
      </I18nProvider>
    </Router>
  );
}

export default App;