const pool = require('../config/db');
const emailService = require('../utils/emailService');

/**
 * Get public system statistics
 * GET /api/public/stats
 */
exports.getStats = async (req, res) => {
  try {
    const patientsCount = await pool.query('SELECT COUNT(*) FROM patients');
    const doctorsCount = await pool.query('SELECT COUNT(*) FROM doctors');
    const hospitalsCount = await pool.query('SELECT COUNT(*) FROM hospitals');

    res.json({
      patients: parseInt(patientsCount.rows[0].count),
      doctors: parseInt(doctorsCount.rows[0].count),
      hospitals: parseInt(hospitalsCount.rows[0].count),
    });
  } catch (error) {
    console.error('Error fetching public stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
};

/**
 * Handle Contact Form Submission
 * POST /api/public/contact
 */
exports.submitContactForm = async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Please provide name, email, and message.' });
  }

  try {
    // Send email to admin
    await emailService.sendToAdmin(name, email, message);
    
    // Send auto-reply to user (async without blocking the response)
    emailService.sendToUser(name, email).catch(err => {
      console.error('Failed to send auto-reply:', err.message);
    });

    res.status(200).json({ message: 'Message sent successfully. Our team will contact you within 24 hours.' });
  } catch (error) {
    console.error('🔥 Contact form error:', error.message);
    res.status(500).json({ error: 'Failed to send message. Please try again later.' });
  }
};

/**
 * Handle Hospital Registration Request
 * POST /api/public/hospital-request
 */
exports.submitHospitalRequest = async (req, res) => {
  const { hospitalName, contactPerson, email, requirements } = req.body;

  if (!hospitalName || !contactPerson || !email || !requirements) {
    return res.status(400).json({ error: 'Please provide all required institutional details.' });
  }

  try {
    // 1. Send verification form to the hospital
    await emailService.sendHospitalVerification(hospitalName, contactPerson, email);

    // 2. Notify ICAMS Admin of the new request
    await emailService.notifyAdminOfHospitalRequest(hospitalName, contactPerson, email, requirements);

    res.status(200).json({ 
      message: 'Institutional request received. A verification form has been sent to your email.' 
    });
  } catch (error) {
    console.error('🔥 Hospital request error:', error.message);
    res.status(500).json({ error: 'Failed to submit request. Please try again later.' });
  }
};
