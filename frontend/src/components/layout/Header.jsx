import React from 'react';
import './Header.css';

const Header = ({ user }) => {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <h1>I-CAMS</h1>
            <span>Integrated Care Assessment & Monitoring System</span>
          </div>

          <div className="user-info">
            <div className="notification-bell">
              <span className="badge">3</span>
              🔔
            </div>
            <div className="user-profile">
              <div className="avatar">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="user-details">
                <span className="user-name">{user?.name || 'User'}</span>
                <span className="user-role">{user?.role || 'Patient'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;