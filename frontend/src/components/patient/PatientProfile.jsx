import React from "react";
import "./PatientProfile.css";

const PatientProfile = () => {
  const [profile, setProfile] = React.useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+94 77 123 4567",
    age: 45,
    gender: "Male",
    bloodType: "O+",
    allergies: "Penicillin, Peanuts",
    conditions: "Type 2 Diabetes, Hypertension",
    emergencyContact: "Jane Doe - +94 77 987 6543",
  });

  return (
    <div className="patient-profile">
      <div className="page-header">
        <h2>My Profile</h2>
        <p>View and update your personal health information</p>
      </div>

      <div className="profile-container">
        <div className="card">
          <div className="profile-header">
            <div className="avatar-large">
              {profile.name.charAt(0)}
            </div>
            <div className="profile-info">
              <h3>{profile.name}</h3>
              <p className="email">{profile.email}</p>
              <button className="btn">Edit Profile</button>
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Personal Information</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">Age</span>
              <span className="value">{profile.age} years</span>
            </div>
            <div className="info-item">
              <span className="label">Gender</span>
              <span className="value">{profile.gender}</span>
            </div>
            <div className="info-item">
              <span className="label">Blood Type</span>
              <span className="value">{profile.bloodType}</span>
            </div>
            <div className="info-item">
              <span className="label">Phone</span>
              <span className="value">{profile.phone}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3>Medical Information</h3>
          <div className="info-section">
            <div className="info-item">
              <span className="label">Chronic Conditions</span>
              <span className="value">{profile.conditions}</span>
            </div>
            <div className="info-item">
              <span className="label">Allergies</span>
              <span className="value">{profile.allergies}</span>
            </div>
            <div className="info-item">
              <span className="label">Emergency Contact</span>
              <span className="value">{profile.emergencyContact}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProfile;
