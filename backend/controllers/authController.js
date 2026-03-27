const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const AdminModel = require('../models/adminModel');
const PatientModel = require('../models/patientModel');
const DoctorModel = require('../models/doctorModel');
const NurseModel = require('../models/nurseModel');
const HospitalModel = require('../models/hospitalModel');

// ─── Generate JWT Token ─────────────────────────────────────────
const generateToken = (id, role, extra = {}) => {
  return jwt.sign(
    { id, role, ...extra },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// ─── POST /api/auth/admin/login ───────────────────────────────
const adminLogin = async (req, res) => {
  const { username, password } = req.body;
  try {
    if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });
    const admin = await AdminModel.findByUsername(username);
    if (!admin) return res.status(401).json({ error: 'Invalid username or password' });
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid username or password' });

    const token = generateToken(admin.id, 'admin', { username: admin.username });
    res.json({
      message: 'Login successful',
      token,
      user: { id: admin.id, username: admin.username, email: admin.email, full_name: admin.full_name, role: 'admin' },
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── Generic User Login ─────────────────────────────────────────
// POST /api/auth/login
const login = async (req, res) => {
  const { email, password, role } = req.body;

  try {
    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Email, password and role are required' });
    }

    let user;
    let model;

    switch (role) {
    case 'patient': model = PatientModel; break;
    case 'doctor': model = DoctorModel; break;
    case 'nurse': model = NurseModel; break;
    case 'hospital': model = HospitalModel; break;
    default: return res.status(400).json({ error: 'Invalid role' });
    }

    user = await model.findByEmail(email);
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

    // Status checks according to FR3, FR4, FR5
    const status = user.status?.toUpperCase();
    
    if (role === 'doctor' || role === 'nurse') {
      if (status === 'PENDINGADMINAPPROVAL') {
        return res.status(403).json({ error: 'Your account is pending administrator approval. Please wait for verification.' });
      }
      if (status !== 'ACTIVE') {
        return res.status(403).json({ error: 'Your account is not active. Please contact administrator.' });
      }
    } else if (role === 'patient') {
      if (status === 'PENDINGDOCTORAPPROVAL') {
        return res.status(403).json({ error: 'Your registration is pending approval from your selected doctor.' });
      }
      if (status !== 'ACTIVE' && status !== 'MONITORING' && status !== 'CRITICAL') {
        return res.status(403).json({ error: 'Your account is not active. Please contact support.' });
      }
    } else if (role === 'hospital') {
      if (status !== 'ACTIVE') {
        return res.status(403).json({ error: 'This hospital account is currently inactive.' });
      }
    }

    const token = generateToken(user.id, role, { email: user.email });

    // Clean user object (remove password)
    const { password: _, ...userData } = user;
    userData.role = role;

    res.json({ message: 'Login successful', token, user: userData });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// ─── Registration Handlers ─────────────────────────────────────

const registerPatient = async (req, res) => {
  const { full_name, email, password, hospital_id, doctor_id } = req.body;
  try {
    const existing = await PatientModel.findByEmail(email);
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const patient = await PatientModel.create({
      full_name, email, password: hashedPassword, hospital_id, doctor_id
    });

    res.status(201).json({ 
      message: 'Registration submitted! Your account is pending approval from Dr. ' + (doctor_id || 'your assigned doctor'), 
      user: { ...patient, status: 'pendingdoctorapproval' } 
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error during registration' });
  }
};

const registerDoctor = async (req, res) => {
  const {
    full_name, email, password, license_number, specialization,
    years_of_experience, institution_name, registration_number, hospital_ids
  } = req.body;

  let parsedHospitalIds = [];
  if (hospital_ids) {
    try {
      parsedHospitalIds = typeof hospital_ids === 'string' ? JSON.parse(hospital_ids) : hospital_ids;
    } catch (e) {
      if (typeof hospital_ids === 'string') {
        parsedHospitalIds = hospital_ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      }
    }
  }

  try {
    const existing = await DoctorModel.findByEmail(email);
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const doctor = await DoctorModel.create({
      full_name, email, password: hashedPassword, license_number, specialization,
      years_of_experience, institution_name, registration_number,
      hospital_ids: parsedHospitalIds,
      license_document: req.file ? req.file.path : null
    });

    res.status(201).json({ message: 'Registration submitted for verification', user: doctor });
  } catch (err) {
    res.status(500).json({ error: 'Server error during registration' });
  }
};

const registerNurse = async (req, res) => {
  const {
    full_name, email, password, license_number, specialization,
    years_of_experience, institution_name, registration_number, hospital_ids
  } = req.body;

  let parsedHospitalIds = [];
  if (hospital_ids) {
    try {
      parsedHospitalIds = typeof hospital_ids === 'string' ? JSON.parse(hospital_ids) : hospital_ids;
    } catch (e) {
      if (typeof hospital_ids === 'string') {
        parsedHospitalIds = hospital_ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
      }
    }
  }

  // Map specialization to qualification for nurses
  const qualification = specialization;

  try {
    const existing = await NurseModel.findByEmail(email);
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const nurse = await NurseModel.create({
      full_name, email, password: hashedPassword, license_number, qualification,
      years_of_experience, institution_name, registration_number,
      hospital_ids: parsedHospitalIds,
      license_document: req.file ? req.file.path : null
    });

    res.status(201).json({ message: 'Registration submitted for verification', user: nurse });
  } catch (err) {
    res.status(500).json({ error: 'Server error during registration' });
  }
};

const registerHospital = async (req, res) => {
  const { name, email, password, registration_number, address, phone, type, specialties } = req.body;
  try {
    const existing = await HospitalModel.findByEmail(email);
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const hospital = await HospitalModel.create({
      name, email, password: hashedPassword, registration_number, address, phone, type, specialties
    });

    res.status(201).json({ message: 'Hospital registered successfully', user: hospital });
  } catch (err) {
    res.status(500).json({ error: 'Server error during registration' });
  }
};

// ─── GET /api/auth/me ────────────────────────────────────
const getMe = async (req, res) => {
  try {
    const { id, role } = req.user; // Set by middleware
    let user;
    if (role === 'admin') user = await AdminModel.findById(id);
    else if (role === 'patient') user = await PatientModel.findById(id);
    else if (role === 'doctor') user = await DoctorModel.findById(id);
    else if (role === 'nurse') user = await NurseModel.findById(id);
    else if (role === 'hospital') user = await HospitalModel.findById(id);

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: { ...user, role } });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  adminLogin,
  login,
  registerPatient,
  registerDoctor,
  registerNurse,
  registerHospital,
  getMe
};
