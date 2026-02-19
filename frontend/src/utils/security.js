/**
 * Security Utilities
 * Session management, encryption helpers, and data protection
 */

// Session Management
export const SessionManager = {
  STORAGE_KEY: 'icams_session',
  TOKEN_KEY: 'icams_auth_token',
  REFRESH_TOKEN_KEY: 'icams_refresh_token',
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes

  createSession: (user, token) => {
    const session = {
      user,
      token,
      createdAt: Date.now(),
      expiresAt: Date.now() + SessionManager.SESSION_TIMEOUT,
    };
    localStorage.setItem(SessionManager.STORAGE_KEY, JSON.stringify(session));
    localStorage.setItem(SessionManager.TOKEN_KEY, token);
    return session;
  },

  getSession: () => {
    const session = localStorage.getItem(SessionManager.STORAGE_KEY);
    return session ? JSON.parse(session) : null;
  },

  isSessionValid: () => {
    const session = SessionManager.getSession();
    if (!session) return false;
    return Date.now() < session.expiresAt;
  },

  clearSession: () => {
    localStorage.removeItem(SessionManager.STORAGE_KEY);
    localStorage.removeItem(SessionManager.TOKEN_KEY);
    localStorage.removeItem(SessionManager.REFRESH_TOKEN_KEY);
  },

  extendSession: () => {
    const session = SessionManager.getSession();
    if (session) {
      session.expiresAt = Date.now() + SessionManager.SESSION_TIMEOUT;
      localStorage.setItem(SessionManager.STORAGE_KEY, JSON.stringify(session));
    }
  },
};

// Data Privacy Headers
export const getSecurityHeaders = () => ({
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
});

// Secure data masking for sensitive information
export const maskSensitiveData = (data, type = 'general') => {
  const masks = {
    email: (email) => {
      const [name, domain] = email.split('@');
      return `${name.charAt(0)}***@${domain}`;
    },
    phone: (phone) => {
      return phone.replace(/\d(?=\d{4})/g, '*');
    },
    ssn: (ssn) => {
      return ssn.replace(/\d/g, '*').replace(/^\*+(?=\*{4})/, 'XXX-XX-');
    },
    general: (data) => {
      return data.substring(0, 2) + '***' + data.substring(data.length - 2);
    },
  };

  const maskFunc = masks[type] || masks.general;
  return maskFunc(data);
};

// Password strength validator
export const validatePassword = (password) => {
  const checks = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasLowerCase: /[a-z]/.test(password),
    hasNumbers: /\d/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const strength =
    Object.values(checks).filter(Boolean).length >= 4
      ? 'strong'
      : Object.values(checks).filter(Boolean).length >= 3
        ? 'medium'
        : 'weak';

  return {
    isValid: checks.minLength && checks.hasUpperCase && checks.hasLowerCase && checks.hasNumbers,
    strength,
    checks,
  };
};

// CSRF Token management
export const CSRFProtection = {
  TOKEN_NAME: 'X-CSRF-Token',
  getToken: () => {
    return document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  },
  setToken: (token) => {
    const meta = document.createElement('meta');
    meta.name = 'csrf-token';
    meta.content = token;
    document.head.appendChild(meta);
  },
};

// Audit logging for sensitive operations
export const AuditLog = {
  log: (action, details) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      action,
      details,
      userId: SessionManager.getSession()?.user?.id,
      userAgent: navigator.userAgent,
      ipAddress: null, // Would be set by backend
    };
    // TODO: Send to audit logging service
    console.log('Audit Log:', logEntry);
  },

  logDataAccess: (patientId, action) => {
    AuditLog.log(`DATA_ACCESS_${action}`, { patientId });
  },

  logAuthEvent: (action, result) => {
    AuditLog.log(`AUTH_${action}`, { result });
  },
};

export default {
  SessionManager,
  getSecurityHeaders,
  maskSensitiveData,
  validatePassword,
  CSRFProtection,
  AuditLog,
};
