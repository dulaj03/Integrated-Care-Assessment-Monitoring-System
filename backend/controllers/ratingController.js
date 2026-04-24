const pool = require('../config/db');

// Add or update a rating/review
const addRating = async (req, res) => {
  const { doctor_id, rating, review } = req.body;
  const patient_id = req.user.id;

  if (!doctor_id || !rating) {
    return res.status(400).json({ error: 'Doctor ID and rating are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO doctor_ratings (patient_id, doctor_id, rating, review, updated_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      ON CONFLICT (patient_id, doctor_id) 
      DO UPDATE SET rating = EXCLUDED.rating, review = EXCLUDED.review, updated_at = CURRENT_TIMESTAMP
      RETURNING *`,
      [patient_id, doctor_id, rating, review]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('[addRating Error]', error);
    res.status(500).json({ error: 'Failed to submit rating' });
  }
};

// Get all reviews for a specific doctor
const getDoctorReviews = async (req, res) => {
  const { doctorId } = req.params;

  try {
    const result = await pool.query(
      `SELECT r.*, p.full_name as patient_name
      FROM doctor_ratings r
      JOIN patients p ON r.patient_id = p.id
      WHERE r.doctor_id = $1 AND r.is_reported = FALSE
      ORDER BY r.created_at DESC`,
      [doctorId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('[getDoctorReviews Error]', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

// Get doctor's own reviews (including reported ones)
const getMyReviews = async (req, res) => {
  const doctorId = req.user.id;

  try {
    const result = await pool.query(
      `SELECT r.*, p.full_name as patient_name
      FROM doctor_ratings r
      JOIN patients p ON r.patient_id = p.id
      WHERE r.doctor_id = $1
      ORDER BY r.created_at DESC`,
      [doctorId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('[getMyReviews Error]', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
};

// Report a review
const reportReview = async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const doctorId = req.user.id;

  try {
    // Ensure the review belongs to the doctor reporting it
    const check = await pool.query('SELECT * FROM doctor_ratings WHERE id = $1 AND doctor_id = $2', [id, doctorId]);
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Review not found or unauthorized' });
    }

    const result = await pool.query(
      `UPDATE doctor_ratings SET is_reported = TRUE, report_reason = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2 RETURNING *`,
      [reason, id]
    );

    res.json({ message: 'Review reported successfully', review: result.rows[0] });
  } catch (error) {
    console.error('[reportReview Error]', error);
    res.status(500).json({ error: 'Failed to report review' });
  }
};

// Admin: Get all reported reviews
const getReportedReviews = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.*, p.full_name as patient_name, d.full_name as doctor_name
      FROM doctor_ratings r
      JOIN patients p ON r.patient_id = p.id
      JOIN doctors d ON r.doctor_id = d.id
      WHERE r.is_reported = TRUE
      ORDER BY r.updated_at DESC`
    );

    res.json(result.rows);
  } catch (error) {
    console.error('[getReportedReviews Error]', error);
    res.status(500).json({ error: 'Failed to fetch reported reviews' });
  }
};

// Admin: Delete a review
const deleteReview = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM doctor_ratings WHERE id = $1', [id]);
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('[deleteReview Error]', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
};

// Admin: Dismiss a report (keep the review)
const dismissReport = async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('UPDATE doctor_ratings SET is_reported = FALSE, report_reason = NULL WHERE id = $1', [id]);
    res.json({ message: 'Report dismissed' });
  } catch (error) {
    console.error('[dismissReport Error]', error);
    res.status(500).json({ error: 'Failed to dismiss report' });
  }
};

module.exports = {
  addRating,
  getDoctorReviews,
  getMyReviews,
  reportReview,
  getReportedReviews,
  deleteReview,
  dismissReport
};
