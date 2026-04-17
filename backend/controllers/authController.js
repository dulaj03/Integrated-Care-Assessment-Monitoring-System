const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const AdminModel = require('../models/adminModel');
const PatientModel = require('../models/patientModel');
const DoctorModel = require('../models/doctorModel');
const NurseModel = require('../models/nurseModel');
const HospitalModel = require('../models/hospitalModel');
const { sendOTPEmail, sendEmailVerification, sendPatientWelcomeEmail } = require('../utils/emailService');

// ─── In-Memory OTP Store ─────────────────────────────────────────
// Map key: email → { otp, expiresAt, role, name }
const otpStore = new Map();

// ─── In-Memory Email Verification Store ──────────────────────────
// Map key: token → { email, name, expiresAt }
const emailVerifyStore = new Map();

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
    const models = [AdminModel, PatientModel, DoctorModel, NurseModel, HospitalModel];
    for (const m of models) {
      if (await m.findByEmail(email)) return res.status(400).json({ error: 'This email address is already registered on our system. Please use a different email or log in.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const patient = await PatientModel.create({
      full_name, email, password: hashedPassword, hospital_id, doctor_id
    });

    res.status(201).json({ 
      message: 'Registration successful! You can now log in to the dashboard.', 
      user: { ...patient, status: 'ACTIVE' } 
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
    const models = [AdminModel, PatientModel, DoctorModel, NurseModel, HospitalModel];
    for (const m of models) {
      if (await m.findByEmail(email)) return res.status(400).json({ error: 'This email address is already registered on our system. Please use a different email or log in.' });
    }

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
    const models = [AdminModel, PatientModel, DoctorModel, NurseModel, HospitalModel];
    for (const m of models) {
      if (await m.findByEmail(email)) return res.status(400).json({ error: 'This email address is already registered on our system. Please use a different email or log in.' });
    }

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
    const models = [AdminModel, PatientModel, DoctorModel, NurseModel, HospitalModel];
    for (const m of models) {
      if (await m.findByEmail(email)) return res.status(400).json({ error: 'This email address is already registered on our system. Please use a different email or log in.' });
    }

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

const updateAdminProfile = async (req, res) => {
  const { username, email, full_name, password } = req.body;
  const { id } = req.user;

  try {
    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const updated = await AdminModel.update(id, {
      username,
      email,
      fullName: full_name,
      password: hashedPassword,
    });

    if (!updated) return res.status(404).json({ error: 'User not found' });

    res.json({ message: 'Profile updated successfully', user: { ...updated, role: 'admin' } });
  } catch (err) {
    res.status(500).json({ error: 'Server error updating profile' });
  }
};

const updatePatientProfile = async (req, res) => {
  const { id } = req.user;
  const { full_name, email, phone, age, gender, address } = req.body;
  const profile_picture = req.file ? `http://localhost:5000/${req.file.path.replace(/\\/g, '/')}` : req.body.profile_picture;

  try {
    const updated = await PatientModel.updateProfile(id, {
      full_name,
      email,
      phone,
      age: age ? parseInt(age) : null,
      gender,
      address,
      profile_picture
    });

    if (!updated) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'Profile updated successfully', user: { ...updated, role: 'patient' } });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Server error updating profile' });
  }
};

const updateProfessionalProfile = async (req, res) => {
  const { id, role } = req.user;
  const { 
    full_name, email, specialization, license_number, 
    years_of_experience, institution_name, registration_number, 
    avatar: existingAvatar
  } = req.body;
  
  const avatar = req.file ? `http://localhost:5000/${req.file.path.replace(/\\/g, '/')}` : existingAvatar;

  try {
    let model;
    if (role === 'doctor') model = DoctorModel;
    else if (role === 'nurse') model = NurseModel;
    else return res.status(403).json({ error: 'Access denied: Role not authorized for professional updates' });

    // Secure numeric parsing (Preventing NaN-related SQL failure)
    let experienceVal = parseInt(years_of_experience);
    if (isNaN(experienceVal)) experienceVal = null;
    
    const updateData = { 
      full_name: full_name || null, 
      email: email || null, 
      license_number: license_number || null, 
      years_of_experience: experienceVal, 
      institution_name: institution_name || null, 
      registration_number: registration_number || null,
      avatar: avatar || null
    };
    
    if (role === 'doctor') updateData.specialization = specialization || null;
    else updateData.qualification = specialization || null;

    const updated = await model.updateProfile(id, updateData);
    if (!updated) return res.status(404).json({ error: 'Professional record not found' });

    res.json({ message: 'Professional profile updated successfully', user: { ...updated, role } });
  } catch (err) {
    console.error(`[AUTH_ERROR] Role: ${role}, ID: ${id}, Error:`, err);
    res.status(500).json({ error: 'Internal server error during professional profile update' });
  }
};

const changePassword = async (req, res) => {
  const { id, role } = req.user;
  const { oldPassword, newPassword } = req.body;

  try {
    let model;
    switch (role) {
    case 'patient': model = PatientModel; break;
    case 'doctor': model = DoctorModel; break;
    case 'nurse': model = NurseModel; break;
    case 'hospital': model = HospitalModel; break;
    default: return res.status(400).json({ error: 'Invalid role' });
    }

    // Get current user (with password)
    const user = await pool.query(`SELECT password FROM ${role}s WHERE id = $1`, [id]);
    if (user.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(oldPassword, user.rows[0].password);
    if (!isMatch) return res.status(400).json({ error: 'Current password is incorrect' });

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await pool.query(`UPDATE ${role}s SET password = $1 WHERE id = $2`, [hashedNewPassword, id]);

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Server error changing password' });
  }
};

// ─── POST /api/auth/forgot-password ──────────────────────────────
const requestPasswordReset = async (req, res) => {
  const { email, role } = req.body;
  if (!email || !role) return res.status(400).json({ error: 'Email and role are required' });

  const models = { patient: PatientModel, doctor: DoctorModel, nurse: NurseModel, hospital: HospitalModel };
  const model = models[role];
  if (!model) return res.status(400).json({ error: 'Invalid role' });

  try {
    const user = await model.findByEmail(email);
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email address. Please check and try again.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    otpStore.set(`${role}:${email}`, { otp, expiresAt, name: user.full_name || user.name || 'User' });

    await sendOTPEmail(email, user.full_name || user.name || 'User', otp);
    res.json({ message: 'If this email is registered, an OTP has been sent.' });
  } catch (err) {
    console.error('requestPasswordReset error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
};

// ─── POST /api/auth/verify-otp ────────────────────────────────────
const verifyOtp = async (req, res) => {
  const { email, role, otp } = req.body;
  if (!email || !role || !otp) return res.status(400).json({ error: 'Email, role and OTP are required' });

  const entry = otpStore.get(`${role}:${email}`);
  if (!entry) return res.status(400).json({ error: 'No OTP request found for this email. Please request a new OTP.' });
  if (Date.now() > entry.expiresAt) {
    otpStore.delete(`${role}:${email}`);
    return res.status(400).json({ error: 'OTP has expired. Please request a new one.' });
  }
  if (entry.otp !== otp.trim()) return res.status(400).json({ error: 'Invalid OTP. Please check and try again.' });

  // Mark as verified (keep entry for the reset step, but mark it)
  entry.verified = true;
  otpStore.set(`${role}:${email}`, entry);

  res.json({ message: 'OTP verified successfully.' });
};

// ─── POST /api/auth/reset-password ───────────────────────────────
const resetPassword = async (req, res) => {
  const { email, role, newPassword } = req.body;
  if (!email || !role || !newPassword) return res.status(400).json({ error: 'Email, role and new password are required' });
  if (newPassword.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters long.' });

  const entry = otpStore.get(`${role}:${email}`);
  if (!entry || !entry.verified) return res.status(400).json({ error: 'OTP not verified. Please complete verification first.' });

  const tableMap = { patient: 'patients', doctor: 'doctors', nurse: 'nurses', hospital: 'hospitals' };
  const table = tableMap[role];
  if (!table) return res.status(400).json({ error: 'Invalid role' });

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const result = await pool.query(`UPDATE ${table} SET password = $1 WHERE email = $2 RETURNING id`, [hashedPassword, email]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    otpStore.delete(`${role}:${email}`);
    res.json({ message: 'Password reset successfully. You can now log in with your new password.' });
  } catch (err) {
    console.error('resetPassword error:', err);
    res.status(500).json({ error: 'Server error. Please try again.' });
  }
};

// ─── POST /api/auth/patient/initiate-registration ─────────────────
// Step 1: Receive name + email, send verification link
const initiatePatientRegistration = async (req, res) => {
  const { full_name, email } = req.body;
  if (!full_name || !email) return res.status(400).json({ error: 'Full name and email are required' });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return res.status(400).json({ error: 'Please enter a valid email address' });

  try {
    // Check if email is registered in ANY user type
    const models = [AdminModel, PatientModel, DoctorModel, NurseModel, HospitalModel];
    for (const m of models) {
      const exists = await m.findByEmail(email);
      if (exists) {
        return res.status(400).json({ error: 'This email address is already registered on our system. Please use a different email or log in.' });
      }
    }

    // Generate a secure random token
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 30 * 60 * 1000; // 30 minutes

    emailVerifyStore.set(token, { email, name: full_name, expiresAt });

    await sendEmailVerification(email, full_name, token);
    res.json({ message: 'Verification email sent. Please check your inbox.' });
  } catch (err) {
    console.error('initiatePatientRegistration error:', err);
    res.status(500).json({ error: 'Failed to send verification email. Please try again.' });
  }
};

// ─── GET /api/auth/patient/verify-email?token=xxx ─────────────────
// Step 2: Validate the token from the email link
const verifyEmailToken = async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ error: 'No verification token provided' });

  const entry = emailVerifyStore.get(token);
  if (!entry) return res.status(400).json({ error: 'Invalid or expired verification link. Please register again.' });
  if (Date.now() > entry.expiresAt) {
    emailVerifyStore.delete(token);
    return res.status(400).json({ error: 'This verification link has expired. Please register again.' });
  }

  res.json({ valid: true, email: entry.email, name: entry.name, token });
};

// ─── POST /api/auth/patient/complete-registration ─────────────────
// Step 3: Token verified — set password, create account, return JWT
const completePatientRegistration = async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) return res.status(400).json({ error: 'Token and password are required' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

  const entry = emailVerifyStore.get(token);
  if (!entry) return res.status(400).json({ error: 'Invalid or expired verification token. Please register again.' });
  if (Date.now() > entry.expiresAt) {
    emailVerifyStore.delete(token);
    return res.status(400).json({ error: 'Verification link expired. Please register again.' });
  }

  try {
    // Double-check email not already registered
    const existing = await PatientModel.findByEmail(entry.email);
    if (existing) return res.status(400).json({ error: 'This email is already registered. Please log in.' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const patient = await PatientModel.create({
      full_name: entry.name,
      email: entry.email,
      password: hashedPassword,
    });

    emailVerifyStore.delete(token);

    // Auto-login: generate token
    const jwtToken = generateToken(patient.id, 'patient', { email: patient.email });
    const { password: _, ...userData } = patient;
    userData.role = 'patient';

    res.status(201).json({
      message: `Welcome to I-CAMS, ${entry.name}! Your account has been created successfully.`,
      token: jwtToken,
      user: userData,
    });

    // Send Welcome Email in background (don't block response)
    sendPatientWelcomeEmail(patient.email, entry.name).catch(err => {
      console.error('Failed to send welcome email:', err);
    });
  } catch (err) {
    console.error('completePatientRegistration error:', err);
    res.status(500).json({ error: 'Server error during registration. Please try again.' });
  }
};

module.exports = {
  adminLogin,
  login,
  registerPatient,
  registerDoctor,
  registerNurse,
  registerHospital,
  getMe,
  updateAdminProfile,
  updatePatientProfile,
  updateProfessionalProfile,
  changePassword,
  requestPasswordReset,
  verifyOtp,
  resetPassword,
  initiatePatientRegistration,
  verifyEmailToken,
  completePatientRegistration,
};

