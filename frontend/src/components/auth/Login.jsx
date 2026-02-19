/**
 * Login Component
 * User authentication form
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useI18n } from '../../i18n';
import { useNotification } from '../../context/NotificationContext';
import '../shared/Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useI18n();
  const { error, success } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Mock login - replace with actual API call
      if (email && password) {
        const mockUser = {
          id: '1',
          name: 'Demo User',
          email: email,
          role: 'patient',
        };

        login(mockUser, 'mock_token_' + Date.now());
        success('Login successful!');
        navigate('/patient/dashboard');
      } else {
        error('Please fill in all fields');
      }
    } catch (err) {
      error('Login failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>{t('app.name')}</h1>
        <h2>{t('auth.login')}</h2>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">{t('auth.email')}</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">{t('auth.password')}</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="auth-button"
          >
            {loading ? `${t('auth.logging')}...` : t('auth.login')}
          </button>
        </form>

        <p className="auth-link">
          {t('auth.noAccount')} <a href="/register">{t('auth.register')}</a>
        </p>

        <div className="demo-credentials">
          <p><strong>{t('auth.demo')}:</strong></p>
          <p>Email: demo@example.com</p>
          <p>Password: Demo@123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
