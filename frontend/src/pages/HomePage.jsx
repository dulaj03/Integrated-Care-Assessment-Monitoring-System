import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = ({ setUserType }) => {
  return (
    <div className="homepage">
      <nav className="navbar">
        <div className="logo">I-CAMS</div>
        <div className="nav-links">
          <Link to="/login">Login</Link>
          <Link to="/register" className="btn btn-primary">Sign Up</Link>
        </div>
      </nav>

      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Integrated Care Assessment & Monitoring System</h1>
            <p>
              A unified digital platform connecting patients and healthcare providers
              for real-time monitoring, communication, and coordinated care management.
            </p>
            <div className="hero-buttons">
              <Link to="/login" className="btn btn-primary">Get Started</Link>
              <Link to="/register" className="btn btn-secondary">Learn More</Link>
            </div>
          </div>
          <div className="hero-image">
            {/* Placeholder for healthcare illustration */}
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2>Key Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📱</div>
              <h3>Real-time Monitoring</h3>
              <p>Continuous health tracking with instant updates</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h3>Seamless Communication</h3>
              <p>Direct messaging between patients and care team</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Health Analytics</h3>
              <p>Visual trends and predictive insights</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔔</div>
              <h3>Smart Notifications</h3>
              <p>Timely alerts for medications and appointments</p>
            </div>
          </div>
        </div>
      </section>

      <section className="user-types">
        <div className="container">
          <h2>Choose Your Role</h2>
          <div className="role-cards">
            <div className="role-card" onClick={() => setUserType('patient')}>
              <div className="role-icon">👤</div>
              <h3>Patient</h3>
              <p>Update health status, track progress, communicate with care team</p>
              <Link to="/login" className="btn">Access as Patient</Link>
            </div>

            <div className="role-card" onClick={() => setUserType('nurse')}>
              <div className="role-icon">👩‍⚕️</div>
              <h3>Nurse</h3>
              <p>Monitor patients, provide care instructions, manage updates</p>
              <Link to="/login" className="btn">Access as Nurse</Link>
            </div>

            <div className="role-card" onClick={() => setUserType('doctor')}>
              <div className="role-icon">👨‍⚕️</div>
              <h3>Doctor</h3>
              <p>Review patient data, prescribe treatments, coordinate care</p>
              <Link to="/login" className="btn">Access as Doctor</Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <p>© 2024 I-CAMS. Integrated Care Assessment & Monitoring System</p>
          <p>BSc (hons) in Software Engineering Project - Plymouth University</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;