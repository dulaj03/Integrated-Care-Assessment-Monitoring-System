const express = require('express');
const router = express.Router();
const {
  getFeaturedReviews,
  getAllReviews,
  submitReview,
  toggleFeatured,
  deleteReview
} = require('../controllers/platformReviewController');
const { verifyToken, verifyAdminToken } = require('../middleware/authMiddleware');

// Public
router.get('/featured', getFeaturedReviews);

// Protected (Any logged in user can submit a review)
router.post('/', verifyToken, submitReview);

// Admin Only
router.get('/', verifyAdminToken, getAllReviews);
router.put('/:id/feature', verifyAdminToken, toggleFeatured);
router.delete('/:id', verifyAdminToken, deleteReview);

module.exports = router;
