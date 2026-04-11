const DoctorModel = require('../models/doctorModel');
const NurseModel = require('../models/nurseModel');
const HospitalModel = require('../models/hospitalModel');
const PatientModel = require('../models/patientModel');
const bcrypt = require('bcryptjs');
const { sendProfessionalRejectionEmail } = require('../utils/emailService');

// Get all users across all categories for admin overview
const getAllUsers = async (req, res) => {
  try {

    const doctors = await DoctorModel.findAll().catch(err => {
      throw new Error(`Doctors query failed: ${err.message}`);
    });

    const nurses = await NurseModel.findAll().catch(err => {
      throw new Error(`Nurses query failed: ${err.message}`);
    });

    const patients = await PatientModel.findAll().catch(err => {
      throw new Error(`Patients query failed: ${err.message}`);
    });

    const hospitals = await HospitalModel.findAll().catch(err => {
      throw new Error(`Hospitals query failed: ${err.message}`);
    });

    res.json({
      doctors: doctors.map(d => ({ ...d, role: 'doctor' })),
      nurses: nurses.map(n => ({ ...n, role: 'nurse' })),
      patients: patients.map(p => ({ ...p, role: 'patient' })),
      hospitals: hospitals.map(h => ({ ...h, role: 'hospital' }))
    });
  } catch (err) {
    res.status(500).json({ error: `Server error fetching user data: ${err.message}` });
  }
};

const updateProfessionalStatus = async (req, res) => {
  const { id, role, status, reason } = req.body;
  try {
    if (!id || !role || !status) {
      return res.status(400).json({ error: 'ID, role, and status are required' });
    }

    let updated;
    if (role === 'doctor') {
      updated = await DoctorModel.updateStatus(id, status);
    } else if (role === 'nurse') {
      updated = await NurseModel.updateStatus(id, status);
    } else if (role === 'patient') {
      updated = await PatientModel.updateStatus(id, status);
    } else if (role === 'hospital') {
      updated = await HospitalModel.updateStatus(id, status);
    } else {
      return res.status(400).json({ error: 'Invalid role for status update' });
    }

    if (!updated) return res.status(404).json({ error: 'User not found' });

    console.log(`Professional ${role} status updated to ${status}. Reason provided: ${reason}. Email: ${updated?.email}`);

    // If rejected, send email with reason
    if (status === 'REJECTED' && reason) {
      console.log(`Triggering Rejection Email for ${updated.full_name} (${updated.email})`);
      sendProfessionalRejectionEmail(updated.email, updated.full_name, role.toUpperCase(), reason).then(() => {
        console.log('Rejection email sent successfully!');
      }).catch(err => {
        console.error('Failed to send rejection email:', err);
      });
    }

    res.json({ message: `User ${status} successfully`, user: updated });
  } catch (err) {
    console.error('updateProfessionalStatus error:', err);
    res.status(500).json({ error: 'Server error updating status' });
  }
};

// Create a new hospital (Admin only)
const createHospital = async (req, res) => {
  const { name, email, password, registration_number, address, phone, type, specialties } = req.body;
  try {
    const existing = await HospitalModel.findByEmail(email);
    if (existing) return res.status(400).json({ error: 'Hospital email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const hospital = await HospitalModel.create({
      name, email, password: hashedPassword, registration_number, address, phone, type, specialties
    });

    res.status(201).json({ message: 'Hospital created successfully', hospital });
  } catch (err) {
    res.status(500).json({ error: 'Server error creating hospital' });
  }
};

const deactivateUser = async (req, res) => {
  const { id, role } = req.body;
  const userId = parseInt(id);
  try {
    if (!id || !role) {
      return res.status(400).json({ error: 'ID and role are required' });
    }

    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    let updated;
    try {
      if (role === 'doctor') {
        updated = await DoctorModel.updateStatus(userId, 'INACTIVE');
      } else if (role === 'nurse') {
        updated = await NurseModel.updateStatus(userId, 'INACTIVE');
      } else if (role === 'patient') {
        updated = await PatientModel.updateStatus(userId, 'INACTIVE');
      } else if (role === 'hospital') {
        updated = await HospitalModel.updateStatus(userId, 'INACTIVE');
      } else {
        return res.status(400).json({ error: 'Invalid role' });
      }
    } catch (modelErr) {
      return res.status(500).json({ error: `Error updating user status for role ${role}: ${modelErr.message}` });
    }

    if (!updated) return res.status(404).json({ error: 'User not found' });

    res.json({ message: 'User deactivated successfully', user: updated });
  } catch (err) {
    res.status(500).json({ error: 'Server error deactivating user: ' + err.message });
  }
};

const deleteUser = async (req, res) => {
  const { id, role } = req.body;
  const userId = parseInt(id);
  try {
    if (!id || !role) {
      return res.status(400).json({ error: 'ID and role are required' });
    }

    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    let deleted;
    try {
      if (role === 'doctor') {
        deleted = await DoctorModel.delete(userId);
      } else if (role === 'nurse') {
        deleted = await NurseModel.delete(userId);
      } else if (role === 'patient') {
        deleted = await PatientModel.delete(userId);
      } else if (role === 'hospital') {
        deleted = await HospitalModel.delete(userId);
      } else {
        return res.status(400).json({ error: 'Invalid role' });
      }
    } catch (modelErr) {
      return res.status(500).json({ error: `Error deleting user for role ${role}: ${modelErr.message}` });
    }

    if (!deleted) return res.status(404).json({ error: 'User not found' });

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error deleting user: ' + err.message });
  }
};

module.exports = {
  getAllUsers,
  updateProfessionalStatus,
  createHospital,
  deactivateUser,
  deleteUser
};
