const pool = require('../config/db');
const NotificationModel = require('../models/notificationModel');

const availabilityController = {

  // ─── Doctor: Get own availability (all hospitals) ─────────────────────────
  getMyAvailability: async (req, res) => {
    const doctorId = req.user.id;
    try {
      const result = await pool.query(
        `SELECT da.*, h.name as hospital_name
         FROM doctor_availability da
         JOIN hospitals h ON da.hospital_id = h.id
         WHERE da.doctor_id = $1
         ORDER BY da.hospital_id, da.day_of_week`,
        [doctorId]
      );
      res.json(result.rows);
    } catch (error) {
      console.error('[getMyAvailability Error]', error);
      res.status(500).json({ error: 'Failed to fetch availability' });
    }
  },

  // ─── Doctor: Save/update availability for a hospital ─────────────────────
  saveAvailability: async (req, res) => {
    const doctorId = req.user.id;
    const { hospital_id, slots } = req.body;
    // slots: [{ day_of_week, start_time, end_time, slot_duration_minutes }]

    if (!hospital_id || !Array.isArray(slots)) {
      return res.status(400).json({ error: 'hospital_id and slots array are required' });
    }

    try {
      // Delete existing availability for this doctor+hospital
      await pool.query(
        'DELETE FROM doctor_availability WHERE doctor_id = $1 AND hospital_id = $2',
        [doctorId, hospital_id]
      );

      // Insert new slots
      if (slots.length > 0) {
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0=Sun
        const diffToMonday = (dayOfWeek === 0) ? -6 : 1 - dayOfWeek;
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() + diffToMonday);
        const weekStartDate = weekStart.toISOString().split('T')[0];

        for (const slot of slots) {
          await pool.query(
            `INSERT INTO doctor_availability
               (doctor_id, hospital_id, day_of_week, start_time, end_time, slot_duration_minutes, week_start_date)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (doctor_id, hospital_id, day_of_week)
             DO UPDATE SET
               start_time = EXCLUDED.start_time,
               end_time = EXCLUDED.end_time,
               slot_duration_minutes = EXCLUDED.slot_duration_minutes,
               week_start_date = EXCLUDED.week_start_date,
               is_active = TRUE,
               updated_at = CURRENT_TIMESTAMP`,
            [doctorId, hospital_id, slot.day_of_week, slot.start_time, slot.end_time,
              slot.slot_duration_minutes || 30, weekStartDate]
          );
        }
      }

      res.json({ message: 'Availability updated successfully' });
    } catch (error) {
      console.error('[saveAvailability Error]', error);
      res.status(500).json({ error: 'Failed to save availability' });
    }
  },

  // ─── Public: Get doctor availability for a specific hospital ──────────────
  getDoctorAvailabilityForHospital: async (req, res) => {
    const { doctorId, hospitalId } = req.params;
    try {
      const result = await pool.query(
        `SELECT * FROM doctor_availability
         WHERE doctor_id = $1 AND hospital_id = $2 AND is_active = TRUE
         ORDER BY
           CASE day_of_week
             WHEN 'Monday' THEN 1 WHEN 'Tuesday' THEN 2 WHEN 'Wednesday' THEN 3
             WHEN 'Thursday' THEN 4 WHEN 'Friday' THEN 5 WHEN 'Saturday' THEN 6
             WHEN 'Sunday' THEN 7 END`,
        [doctorId, hospitalId]
      );
      res.json(result.rows);
    } catch (error) {
      console.error('[getDoctorAvailabilityForHospital Error]', error);
      res.status(500).json({ error: 'Failed to fetch availability' });
    }
  },

  // ─── Doctor: Get own consultation fees ────────────────────────────────────
  getMyFees: async (req, res) => {
    const doctorId = req.user.id;
    try {
      const result = await pool.query(
        `SELECT df.*, h.name as hospital_name
         FROM doctor_fees df
         JOIN hospitals h ON df.hospital_id = h.id
         WHERE df.doctor_id = $1`,
        [doctorId]
      );
      res.json(result.rows);
    } catch (error) {
      console.error('[getMyFees Error]', error);
      res.status(500).json({ error: 'Failed to fetch fees' });
    }
  },

  // ─── Doctor: Set consultation fee for a hospital ──────────────────────────
  setFee: async (req, res) => {
    const doctorId = req.user.id;
    const { hospital_id, consultation_fee } = req.body;

    if (!hospital_id || consultation_fee === undefined) {
      return res.status(400).json({ error: 'hospital_id and consultation_fee are required' });
    }

    try {
      await pool.query(
        `INSERT INTO doctor_fees (doctor_id, hospital_id, consultation_fee)
         VALUES ($1, $2, $3)
         ON CONFLICT (doctor_id, hospital_id)
         DO UPDATE SET consultation_fee = $3, updated_at = CURRENT_TIMESTAMP`,
        [doctorId, hospital_id, consultation_fee]
      );
      res.json({ message: 'Fee updated successfully' });
    } catch (error) {
      console.error('[setFee Error]', error);
      res.status(500).json({ error: 'Failed to update fee' });
    }
  },

  // ─── Public: Get fee breakdown for a doctor+hospital combo ───────────────
  getFeeBreakdown: async (req, res) => {
    const { doctorId, hospitalId } = req.params;
    try {
      const [doctorFeeRes, hospitalFeeRes, platformFeeRes] = await Promise.all([
        pool.query(
          'SELECT consultation_fee FROM doctor_fees WHERE doctor_id = $1 AND hospital_id = $2',
          [doctorId, hospitalId]
        ),
        pool.query('SELECT appointment_fee FROM hospitals WHERE id = $1', [hospitalId]),
        pool.query('SELECT setting_value FROM platform_settings WHERE setting_key = \'icams_appointment_fee\'')
      ]);

      const doctorFee = parseFloat(doctorFeeRes.rows[0]?.consultation_fee || 0);
      const hospitalFee = parseFloat(hospitalFeeRes.rows[0]?.appointment_fee || 0);
      const icamsFee = parseFloat(platformFeeRes.rows[0]?.setting_value || 0);
      const totalFee = doctorFee + hospitalFee + icamsFee;

      res.json({ doctorFee, hospitalFee, icamsFee, totalFee });
    } catch (error) {
      console.error('[getFeeBreakdown Error]', error);
      res.status(500).json({ error: 'Failed to fetch fee breakdown' });
    }
  },

  // ─── Hospital: Set appointment facility fee ───────────────────────────────
  setHospitalFee: async (req, res) => {
    const hospitalId = req.user.id;
    const { appointment_fee } = req.body;

    if (appointment_fee === undefined) {
      return res.status(400).json({ error: 'appointment_fee is required' });
    }

    try {
      await pool.query(
        'UPDATE hospitals SET appointment_fee = $1 WHERE id = $2',
        [appointment_fee, hospitalId]
      );
      res.json({ message: 'Hospital fee updated successfully' });
    } catch (error) {
      console.error('[setHospitalFee Error]', error);
      res.status(500).json({ error: 'Failed to update hospital fee' });
    }
  },

  getHospitalFee: async (req, res) => {
    const { hospitalId } = req.params;
    try {
      const result = await pool.query('SELECT appointment_fee FROM hospitals WHERE id = $1', [hospitalId]);
      res.json({ appointment_fee: parseFloat(result.rows[0]?.appointment_fee || 0) });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch hospital fee' });
    }
  },

  // ─── Admin: Get/set platform fee ──────────────────────────────────────────
  getPlatformFee: async (req, res) => {
    try {
      const result = await pool.query(
        'SELECT setting_value FROM platform_settings WHERE setting_key = \'icams_appointment_fee\''
      );
      res.json({ icams_appointment_fee: parseFloat(result.rows[0]?.setting_value || 0) });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch platform fee' });
    }
  },

  setPlatformFee: async (req, res) => {
    const { icams_appointment_fee } = req.body;
    if (icams_appointment_fee === undefined) {
      return res.status(400).json({ error: 'icams_appointment_fee is required' });
    }
    try {
      await pool.query(
        `INSERT INTO platform_settings (setting_key, setting_value)
         VALUES ('icams_appointment_fee', $1)
         ON CONFLICT (setting_key) DO UPDATE SET setting_value = $1, updated_at = CURRENT_TIMESTAMP`,
        [icams_appointment_fee.toString()]
      );
      res.json({ message: 'Platform fee updated successfully' });
    } catch (error) {
      console.error('[setPlatformFee Error]', error);
      res.status(500).json({ error: 'Failed to update platform fee' });
    }
  },

  // ─── Cron-style: Notify doctors who haven't updated this week ─────────────
  notifyDoctorsToUpdateSchedule: async (req, res) => {
    try {
      // Find active doctors whose availability hasn't been updated this week
      const today = new Date();
      const dayOfWeek = today.getDay();
      const diffToMonday = (dayOfWeek === 0) ? -6 : 1 - dayOfWeek;
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() + diffToMonday);
      const weekStartDate = weekStart.toISOString().split('T')[0];

      const result = await pool.query(
        `SELECT DISTINCT d.id, d.full_name
         FROM doctors d
         WHERE d.status = 'ACTIVE'
         AND d.id NOT IN (
           SELECT DISTINCT doctor_id FROM doctor_availability
           WHERE week_start_date >= $1
         )`,
        [weekStartDate]
      );

      for (const doctor of result.rows) {
        await NotificationModel.create({
          user_id: doctor.id,
          user_role: 'doctor',
          title: '⚠️ Schedule Update Required',
          message: 'You have not updated your availability schedule for this week. Please update your available dates and times so patients can book appointments.',
          type: 'warning'
        });
      }

      res.json({ message: `Notified ${result.rows.length} doctors` });
    } catch (error) {
      console.error('[notifyDoctors Error]', error);
      res.status(500).json({ error: 'Failed to send notifications' });
    }
  }
};

module.exports = availabilityController;
