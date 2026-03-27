const pool = require('../config/db');

const messageController = {
    // Send a message
    sendMessage: async (req, res) => {
        try {
            const { receiver_id, receiver_role, message_text } = req.body;
            const sender_id = req.user.id;
            const sender_role = req.user.role;

            const results = await pool.query(
                `INSERT INTO messages (sender_id, sender_role, receiver_id, receiver_role, message_text)
                 VALUES ($1, $2, $3, $4, $5) RETURNING *`,
                [sender_id, sender_role, receiver_id, receiver_role, message_text]
            );

            res.status(201).json(results.rows[0]);
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Send failed' });
        }
    },

    // Get conversation with another user
    getMessages: async (req, res) => {
        try {
            const { other_id, other_role } = req.params;
            const my_id = req.user.id;
            const my_role = req.user.role;

            const results = await pool.query(
                `SELECT * FROM messages 
                 WHERE ((sender_id = $1 AND sender_role = $2 AND receiver_id = $3 AND receiver_role = $4)
                 OR (sender_id = $3 AND sender_role = $4 AND receiver_id = $1 AND receiver_role = $2))
                 ORDER BY created_at ASC`,
                [my_id, my_role, other_id, other_role]
            );

            // Mark as read
            await pool.query(
                `UPDATE messages SET is_read = TRUE 
                 WHERE receiver_id = $1 AND receiver_role = $2 AND sender_id = $3 AND sender_role = $4`,
                [my_id, my_role, other_id, other_role]
            );

            res.json(results.rows);
        } catch (error) {
            res.status(500).json({ error: 'Fetch failed' });
        }
    },

    // Get list of active conversations
    getConversations: async (req, res) => {
        try {
            const my_id = req.user.id;
            const my_role = req.user.role;

            // Simple group by logic for recent messages.
            const results = await pool.query(
                `SELECT DISTINCT ON (other_id, other_role) 
                        CASE WHEN sender_id = $1 AND sender_role = $2 THEN receiver_id ELSE sender_id END as other_id,
                        CASE WHEN sender_id = $1 AND sender_role = $2 THEN receiver_role ELSE sender_role END as other_role,
                        message_text, is_read, created_at
                 FROM messages 
                 WHERE (sender_id = $1 AND sender_role = $2) OR (receiver_id = $1 AND receiver_role = $2)
                 ORDER BY other_id, other_role, created_at DESC`,
                [my_id, my_role]
            );

            res.json(results.rows);
        } catch (error) {
            res.status(500).json({ error: 'Fetch failed' });
        }
    }
};

module.exports = messageController;
