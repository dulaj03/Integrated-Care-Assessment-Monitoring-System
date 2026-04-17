const express = require('express');
const router = express.Router();
const {
  addRating,
  getDoctorReviews,
  getMyReviews,
  reportReview,
  getReportedReviews,
  deleteReview,
  dismissReport
} = require('../controllers/ratingController');
const { verifyPatientToken, verifyDoctorToken, verifyAdminToken } = require('../middleware/authMiddleware');

// Patient routes
router.post('/', verifyPatientToken, addRating);
router.get('/doctor/:doctorId', getDoctorReviews); // Public/Patient view

// Doctor routes
router.get('/my-reviews', verifyDoctorToken, getMyReviews);
router.post('/report/:id', verifyDoctorToken, reportReview);

// Admin routes
router.get('/reported', verifyAdminToken, getReportedReviews);
router.delete('/:id', verifyAdminToken, deleteReview);
router.post('/dismiss/:id', verifyAdminToken, dismissReport);

module.exports = router;
