import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import PatientDashboard from './components/patient/PatientDashboard';
import HealthcareDashboard from './components/healthcare/HealthcareDashboard';
import HealthUpdate from './components/patient/HealthUpdate';
import PatientProfile from './components/patient/PatientProfile';
import './styles/main.css';

function App() {
  const [userType, setUserType] = React.useState(null); // 'patient', 'nurse', 'doctor'

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage setUserType={setUserType} />} />
        <Route path="/login" element={<Login setUserType={setUserType} />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={
          userType === 'patient' ?
            <Layout><PatientDashboard /></Layout> :
            <Layout><HealthcareDashboard userType={userType} /></Layout>
        } />

        <Route path="/health-update" element={<Layout><HealthUpdate /></Layout>} />
        <Route path="/profile" element={<Layout><PatientProfile /></Layout>} />
      </Routes>
    </Router>
  );
}

export default App;