const pool = require('../config/db');
const { sendToUser } = require('../utils/socket');

const messageController = {
    // Helper to check if two users can communicate
    canCommunicate: async (user1_id, user1_role, user2_id, user2_role) => {
        // Patient <-> Hospital: Always allowed (patients can message any hospital)
        if ((user1_role === 'patient' && user2_role === 'hospital') ||
            (user1_role === 'hospital' && user2_role === 'patient')) {
            return true;
        }

        // Patient <-> Doctor: Allowed if there's an approved or confirmed appointment
        if ((user1_role === 'patient' && user2_role === 'doctor') ||
            (user1_role === 'doctor' && user2_role === 'patient')) {
            const pId = user1_role === 'patient' ? user1_id : user2_id;
            const dId = user1_role === 'doctor' ? user1_id : user2_id;
            
            const result = await pool.query(
                "SELECT id FROM appointments WHERE patient_id = $1 AND doctor_id = $2 AND status IN ('hospital_approved', 'confirmed')",
                [pId, dId]
            );
            return result.rows.length > 0;
        }

        // Patient <-> Nurse: Allowed if nurse is assigned to the patient or via doctor appointment
        // Simplest check: if there's an appointment at the same hospital or active connection
        if ((user1_role === 'patient' && user2_role === 'nurse') ||
            (user1_role === 'nurse' && user2_role === 'patient')) {
            // For now, let's assume they can message if they are in the same hospital's active list
            // Or better: if nurse's hospital matches patient's current appointment hospital
            const pId = user1_role === 'patient' ? user1_id : user2_id;
            const nId = user1_role === 'nurse' ? user1_id : user2_id;

            const result = await pool.query(
                `SELECT a.id FROM appointments a
                 JOIN nurses n ON n.hospital_id = a.hospital_id
                 WHERE a.patient_id = $1 AND n.id = $2 AND a.status IN ('hospital_approved', 'confirmed')`,
                [pId, nId]
            );
            return result.rows.length > 0;
        }

        // Doctor <-> Nurse: Allowed if they belong to the same hospital
        if ((user1_role === 'doctor' && user2_role === 'nurse') ||
            (user1_role === 'nurse' && user2_role === 'doctor')) {
            const dId = user1_role === 'doctor' ? user1_id : user2_id;
            const nId = user1_role === 'nurse' ? user1_id : user2_id;

            const result = await pool.query(
                `SELECT d.id FROM doctors d
                 JOIN nurses n ON n.hospital_id = d.hospital_id
                 WHERE d.id = $1 AND n.id = $2`,
                [dId, nId]
            );
            return result.rows.length > 0;
        }

        return false;
    },

    // Send a message
    sendMessage: async (req, res) => {
        try {
            const { receiver_id, receiver_role, message_text } = req.body;
            const sender_id = req.user.id;
            const sender_role = req.user.role;

            // Check permission
            const allowed = await messageController.canCommunicate(sender_id, sender_role, receiver_id, receiver_role);
            if (!allowed) {
                return res.status(403).json({ error: 'You are not connected to this user yet.' });
            }

            const results = await pool.query(
                `INSERT INTO messages (sender_id, sender_role, receiver_id, receiver_role, message_text)
                 VALUES ($1, $2, $3, $4, $5) RETURNING *`,
                [sender_id, sender_role, receiver_id, receiver_role, message_text]
            );

            const newMessage = results.rows[0];

            // Real-time notify receiver
            sendToUser(receiver_id, receiver_role, 'new_message', newMessage);

            res.status(201).json(newMessage);
        } catch (error) {
            console.error('Send failed:', error);
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

            const results = await pool.query(
                `SELECT DISTINCT ON (m.other_id, m.other_role) 
                        m.other_id,
                        m.other_role,
                        m.message_text,
                        m.is_read,
                        m.created_at,
                        COALESCE(p.full_name, h.name, d.full_name, n.full_name) as other_name
                 FROM (
                    SELECT 
                        CASE WHEN sender_id = $1 AND sender_role = $2 THEN receiver_id ELSE sender_id END as other_id,
                        CASE WHEN sender_id = $1 AND sender_role = $2 THEN receiver_role ELSE sender_role END as other_role,
                        message_text, is_read, created_at
                    FROM messages 
                    WHERE (sender_id = $1 AND sender_role = $2) OR (receiver_id = $1 AND receiver_role = $2)
                    ORDER BY created_at DESC
                 ) m
                 LEFT JOIN patients p ON m.other_role = 'patient' AND m.other_id = p.id
                 LEFT JOIN hospitals h ON m.other_role = 'hospital' AND m.other_id = h.id
                 LEFT JOIN doctors d ON m.other_role = 'doctor' AND m.other_id = d.id
                 LEFT JOIN nurses n ON m.other_role = 'nurse' AND m.other_id = n.id
                 ORDER BY m.other_id, m.other_role, m.created_at DESC`,
                [my_id, my_role]
            );

            res.json(results.rows);
        } catch (error) {
            console.error('Fetch conversations error:', error);
            res.status(500).json({ error: 'Fetch failed' });
        }
    }
};

module.exports = messageController;

