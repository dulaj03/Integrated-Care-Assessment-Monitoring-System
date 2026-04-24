const PlatformReviewModel = require('../models/platformReviewModel');

// Public: Get 6 featured reviews for Home Page
const getFeaturedReviews = async (req, res) => {
  try {
    const reviews = await PlatformReviewModel.getFeatured();
    res.json(reviews);
  } catch (error) {
    console.error('getFeaturedReviews error:', error);
    res.status(500).json({ error: 'Failed to fetch featured reviews' });
  }
};

// Protected: Get all reviews (Admin only)
const getAllReviews = async (req, res) => {
  try {
    const reviews = await PlatformReviewModel.getAll();
    res.json(reviews);
  } catch (error) {
    console.error('getAllReviews error:', error);
    res.status(500).json({ error: 'Failed to fetch platform reviews' });
  }
};

// Protected: Submit a new review
const submitReview = async (req, res) => {
  const { rating, review_text } = req.body;
  const user = req.user; // populated by verifyToken middleware

  if (!rating || !review_text) {
    return res.status(400).json({ error: 'Rating and review text are required' });
  }

  try {
    // We already have user id and role from token. Let's fetch the full name and avatar from DB.
    // However, it might be simpler to fetch user details. Since authController.js `getMe` does this, we can query it directly here or rely on the frontend sending it, but fetching it securely is better.
    const pool = require('../config/db');
    let user_name = 'User';
    let user_avatar = null;

    let table = 'patients';
    if (user.role === 'admin') {
      table = 'admin_users';
    } else if (user.role === 'doctor') {
      table = 'doctors';
    } else if (user.role === 'nurse') {
      table = 'nurses';
    } else if (user.role === 'hospital') {
      table = 'hospitals';
    }

    let queryStr = `SELECT full_name FROM ${table} WHERE id = $1`;
    if (table === 'admin_users') {
      queryStr = `SELECT full_name as name FROM ${table} WHERE id = $1`;
    }
    if (table === 'hospitals') {
      queryStr = `SELECT name FROM ${table} WHERE id = $1`;
    }
    // For avatars
    if (['doctors', 'nurses'].includes(table)) {
      queryStr = `SELECT full_name, avatar FROM ${table} WHERE id = $1`;
    } else if (table === 'patients') {
      queryStr = `SELECT full_name, profile_picture as avatar FROM ${table} WHERE id = $1`;
    }

    const userRes = await pool.query(queryStr, [user.id]);
    if (userRes.rows.length > 0) {
      user_name = userRes.rows[0].full_name || userRes.rows[0].name || 'User';
      user_avatar = userRes.rows[0].avatar || null;
    }

    const review = await PlatformReviewModel.create({
      user_id: user.id,
      user_role: user.role,
      user_name,
      user_avatar,
      rating,
      review_text
    });

    res.status(201).json({ message: 'Review submitted successfully', review });
  } catch (error) {
    console.error('submitReview error:', error);
    res.status(500).json({ error: 'Failed to submit review' });
  }
};

// Protected: Admin toggle featured
const toggleFeatured = async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await PlatformReviewModel.toggleFeature(id);
    res.json({ message: 'Review feature status toggled', review: updated });
  } catch (error) {
    console.error('toggleFeatured error:', error);
    res.status(400).json({ error: error.message || 'Failed to toggle featured status' });
  }
};

// Protected: Admin delete review
const deleteReview = async (req, res) => {
  const { id } = req.params;
  try {
    await PlatformReviewModel.delete(id);
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('deleteReview error:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
};

module.exports = {
  getFeaturedReviews,
  getAllReviews,
  submitReview,
  toggleFeatured,
  deleteReview
};
