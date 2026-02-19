/**
 * Register Component
 * New user registration form
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n';
import { useNotification } from '../../context/NotificationContext';
import { validatePassword } from '../../utils/security';
import '../shared/Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'patient',
  });
  const [loading, setLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useI18n();
  const { error, success } = useNotification();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Real-time password validation
    if (name === 'password') {
      const validation = validatePassword(value);
      setPasswordError(validation.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate password
      const validation = validatePassword(formData.password);
      if (!validation.isValid) {
        error(validation.message);
        setLoading(false);
        return;
      }

      // Check passwords match
      if (formData.password !== formData.confirmPassword) {
        error('Passwords do not match');
        setLoading(false);
        return;
      }

      // Validate all fields
      if (!formData.name || !formData.email || !formData.password) {
        error('Please fill in all fields');
        setLoading(false);
        return;
      }

      // Mock registration - replace with actual API call
      const newUser = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        role: formData.role,
      };

      login(newUser, 'mock_token_' + Date.now());
      success('Registration successful! Welcome to I-CAMS');
      navigate(`/${formData.role}/dashboard`);
    } catch (err) {
      error('Registration failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>{t('app.name')}</h1>
        <h2>{t('auth.register')}</h2>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">{t('auth.fullName')}</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">{t('auth.email')}</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">{t('auth.role')}</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="nurse">Nurse</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="password">{t('auth.password')}</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
            {passwordError && <p className="error-text">{passwordError}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">{t('auth.confirmPassword')}</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !formData.password || passwordError}
            className="auth-button"
          >
            {loading ? `${t('auth.registering')}...` : t('auth.register')}
          </button>
        </form>

        <p className="auth-link">
          {t('auth.haveAccount')} <a href="/login">{t('auth.login')}</a>
        </p>

        <div className="password-requirements">
          <p><strong>{t('auth.passwordRequirements')}:</strong></p>
          <ul>
            <li>Min 8 characters</li>
            <li>Uppercase letter (A-Z)</li>
            <li>Lowercase letter (a-z)</li>
            <li>Number (0-9)</li>
            <li>Special character (!@#$%)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Register;
