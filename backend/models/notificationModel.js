const pool = require('../config/db');

class NotificationModel {
  static async create(data) {
    const { user_id, user_role, title, message, type } = data;
    const result = await pool.query(
      `INSERT INTO notifications (user_id, user_role, title, message, type)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [user_id, user_role, title, message, type || 'info']
    );

    // Real-time emission
    try {
      const { sendToUser } = require('../utils/socket');
      sendToUser(user_id, user_role, 'new_notification', result.rows[0]);
    } catch (e) {
      console.error('Socket emission failed for notification:', e.message);
    }

    return result.rows[0];
  }

  static async findByUser(userId, role) {
    const result = await pool.query(
      'SELECT * FROM notifications WHERE user_id = $1 AND user_role = $2 ORDER BY created_at DESC',
      [userId, role]
    );
    return result.rows;
  }

  static async markAsRead(id) {
    const result = await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  }
}

module.exports = NotificationModel;
