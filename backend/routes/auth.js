const express = require('express');
const router = express.Router();
const {
  adminLogin,
  login,
  registerPatient,
  registerDoctor,
  registerNurse,
  registerHospital,
  getMe,
  updateAdminProfile,
  updatePatientProfile,
  changePassword
} = require('../controllers/authController');
const { verifyToken, verifyAdminToken } = require('../middleware/authMiddleware');
const upload = require('../utils/upload');

// Public endpoints
router.post('/admin/login', adminLogin);
router.post('/login', login); // Generic login (patient, doctor, nurse, hospital)

// Registration endpoints
router.post('/register/patient', registerPatient);
router.post('/register/doctor', upload.single('licenseDocument'), registerDoctor);
router.post('/register/nurse', upload.single('licenseDocument'), registerNurse);

// Protected endpoints
router.get('/me', verifyToken, getMe);
router.post('/change-password', verifyToken, changePassword);
router.put('/profile', verifyToken, upload.single('profile_picture'), updatePatientProfile);
router.put('/admin/profile', verifyAdminToken, updateAdminProfile);

module.exports = router;
