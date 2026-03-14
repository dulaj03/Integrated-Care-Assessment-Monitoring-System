const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  updateProfessionalStatus,
  createHospital,
  deactivateUser,
  deleteUser
} = require('../controllers/adminController');
const { verifyAdminToken } = require('../middleware/authMiddleware');

// All routes here should be protected by admin verifyAdminToken
router.use(verifyAdminToken);

router.get('/users', getAllUsers);
router.post('/users/update-status', updateProfessionalStatus);
router.post('/users/deactivate', deactivateUser);
router.delete('/users/delete', deleteUser);
router.post('/hospitals', createHospital);

module.exports = router;
