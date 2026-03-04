const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  updateProfessionalStatus,
  createHospital
} = require('../controllers/adminController');
const { verifyAdminToken } = require('../middleware/authMiddleware');

// All routes here should be protected by admin verifyAdminToken
router.use(verifyAdminToken);

router.get('/users', getAllUsers);
router.post('/users/update-status', updateProfessionalStatus);
router.post('/hospitals', createHospital);

module.exports = router;
