import React from 'react';
import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ userType }) => {
  const patientMenu = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/health-update', label: 'Health Update', icon: '📝' },
    { path: '/appointments', label: 'Appointments', icon: '📅' },
    { path: '/reports', label: 'Health Reports', icon: '📈' },
    { path: '/messages', label: 'Messages', icon: '💬' },
    { path: '/profile', label: 'My Profile', icon: '👤' },
  ];

  const healthcareMenu = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/patients', label: 'Patient List', icon: '👥' },
    { path: '/monitoring', label: 'Monitoring', icon: '👁️' },
    { path: '/instructions', label: 'Medical Instructions', icon: '💊' },
    { path: '/reports', label: 'Reports', icon: '📋' },
    { path: '/alerts', label: 'Alerts', icon: '⚠️' },
  ];

  const menuItems = userType === 'patient' ? patientMenu : healthcareMenu;

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <ul>
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'active' : ''}`
                }
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button className="btn btn-secondary">🆘 Emergency Help</button>
        <button className="btn btn-logout">🚪 Logout</button>
      </div>
    </aside>
  );
};

export default Sidebar;