const pool = require('../config/db');

class PlatformReviewModel {
  static async create({ user_id, user_role, user_name, user_avatar, rating, review_text }) {
    const result = await pool.query(
      `INSERT INTO platform_reviews (user_id, user_role, user_name, user_avatar, rating, review_text)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [user_id, user_role, user_name, user_avatar, rating, review_text]
    );
    return result.rows[0];
  }

  static async getAll() {
    const result = await pool.query('SELECT * FROM platform_reviews ORDER BY created_at DESC');
    return result.rows;
  }

  static async getFeatured() {
    const result = await pool.query('SELECT * FROM platform_reviews WHERE is_featured = TRUE ORDER BY created_at DESC');
    return result.rows;
  }

  static async toggleFeature(id) {
    // First, verify how many are currently featured
    const countRes = await pool.query('SELECT COUNT(*) FROM platform_reviews WHERE is_featured = TRUE');
    const featuredCount = parseInt(countRes.rows[0].count);

    const currentRes = await pool.query('SELECT is_featured FROM platform_reviews WHERE id = $1', [id]);
    if (currentRes.rows.length === 0) throw new Error('Review not found');
    const isCurrentlyFeatured = currentRes.rows[0].is_featured;

    if (!isCurrentlyFeatured && featuredCount >= 6) {
      throw new Error('Maximum of 6 reviews can be featured at once.');
    }

    const result = await pool.query(
      'UPDATE platform_reviews SET is_featured = NOT is_featured WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }

  static async delete(id) {
    const result = await pool.query('DELETE FROM platform_reviews WHERE id = $1 RETURNING id', [id]);
    return result.rows[0];
  }
}

module.exports = PlatformReviewModel;
