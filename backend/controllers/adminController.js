const DoctorModel = require('../models/doctorModel');
const NurseModel = require('../models/nurseModel');
const HospitalModel = require('../models/hospitalModel');
const PatientModel = require('../models/patientModel');
const bcrypt = require('bcryptjs');

// Get all users across all categories for admin overview
const getAllUsers = async (req, res) => {
  try {
    const doctors = await DoctorModel.findAll();
    const nurses = await NurseModel.findAll();
    const patients = await PatientModel.findAll();
    const hospitals = await HospitalModel.findAll();

    res.json({
      doctors: doctors.map(d => ({ ...d, role: 'doctor' })),
      nurses: nurses.map(n => ({ ...n, role: 'nurse' })),
      patients: patients.map(p => ({ ...p, role: 'patient' })),
      hospitals: hospitals.map(h => ({ ...h, role: 'hospital' }))
    });
  } catch (err) {
    console.error('Get all users error:', err.message);
    res.status(500).json({ error: 'Server error fetching user data' });
  }
};

// Update status for Doctor or Nurse
const updateProfessionalStatus = async (req, res) => {
  const { id, role, status } = req.body; // status: 'active' or 'rejected'
  console.log(`[Admin] Updating Status - ID: ${id}, Role: ${role}, New Status: ${status}`);

  try {
    if (!id || !role || !status) {
      return res.status(400).json({ error: 'ID, role, and status are required' });
    }

    let updated;
    if (role === 'doctor') {
      updated = await DoctorModel.updateStatus(id, status);
    } else if (role === 'nurse') {
      updated = await NurseModel.updateStatus(id, status);
    } else {
      return res.status(400).json({ error: 'Invalid role for status update' });
    }

    if (!updated) return res.status(404).json({ error: 'User not found' });

    res.json({ message: `User ${status} successfully`, user: updated });
  } catch (err) {
    console.error('Update status error:', err.message);
    res.status(500).json({ error: 'Server error updating status' });
  }
};

// Create a new hospital (Admin only)
const createHospital = async (req, res) => {
  const { name, email, password, registration_number, address, phone } = req.body;
  try {
    const existing = await HospitalModel.findByEmail(email);
    if (existing) return res.status(400).json({ error: 'Hospital email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const hospital = await HospitalModel.create({
      name, email, password: hashedPassword, registration_number, address, phone
    });

    res.status(201).json({ message: 'Hospital created successfully', hospital });
  } catch (err) {
    console.error('Create hospital error:', err.message);
    res.status(500).json({ error: 'Server error creating hospital' });
  }
};

module.exports = {
  getAllUsers,
  updateProfessionalStatus,
  createHospital
};
