/**
 * Scheduler utility — background jobs for I-CAMS
 * - Weekly Sunday doctor schedule reminders
 * - 24-hour payment reminder (urgent email to patient)
 * - 36-hour auto-cancel unpaid confirmed appointments
 */

const pool = require('../config/db');
const NotificationModel = require('../models/notificationModel');
const emailService = require('./emailService');

// ─── Helper ───────────────────────────────────────────────────────────────────
function getMillisUntilNextSunday9AM() {
  const now = new Date();
  const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
  const nextSunday = new Date(now);
  nextSunday.setDate(now.getDate() + daysUntilSunday);
  nextSunday.setHours(9, 0, 0, 0);
  return nextSunday - now;
}

// ─── Job 1: Weekly doctor schedule reminder ───────────────────────────────────
async function notifyDoctorsToUpdateSchedule() {
  try {
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
        title: '⚠️ Weekly Schedule Update Required',
        message: 'It\'s Sunday! Please update your available dates and time slots for the coming week so patients can book appointments with you.',
        type: 'warning'
      });
    }
    console.log(`[Scheduler] Notified ${result.rows.length} doctor(s) to update their weekly schedule.`);
  } catch (error) {
    console.error('[Scheduler] Failed to notify doctors:', error.message);
  }
}

// ─── Job 2: Send urgent payment reminder at 24h after doctor confirmation ─────
async function sendPaymentReminders() {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const thirtyHoursAgo     = new Date(Date.now() - 30 * 60 * 60 * 1000);

    // Find confirmed appointments: updated_at is between 24h and 30h ago,
    // payment not completed, and reminder not yet sent
    const result = await pool.query(
      `SELECT a.id, a.appointment_date, a.appointment_time, a.patient_id, a.doctor_id, a.hospital_id,
              p.full_name as patient_name, p.email as patient_email,
              d.full_name as doctor_name,
              h.name as hospital_name
       FROM appointments a
       JOIN patients p ON a.patient_id = p.id
       JOIN doctors d ON a.doctor_id = d.id
       JOIN hospitals h ON a.hospital_id = h.id
       WHERE a.status = 'confirmed'
         AND (a.payment_status IS NULL OR a.payment_status != 'completed')
         AND a.updated_at <= $1
         AND a.updated_at > $2
         AND (a.reminder_sent IS NULL OR a.reminder_sent = false)`,
      [twentyFourHoursAgo, thirtyHoursAgo]
    );

    for (const appt of result.rows) {
      try {
        // Send urgent email
        await emailService.sendPaymentReminder(
          appt.patient_email,
          appt.patient_name,
          appt.doctor_name,
          appt.appointment_date,
          appt.appointment_time,
          appt.hospital_name
        );

        // In-app notification
        await NotificationModel.create({
          user_id: appt.patient_id,
          user_role: 'patient',
          title: '⚠️ Urgent: Complete Your Payment',
          message: `Your appointment with Dr. ${appt.doctor_name} will be cancelled in 12 hours if payment is not received.`,
          type: 'warning'
        });

        // Mark reminder as sent
        await pool.query(
          'UPDATE appointments SET reminder_sent = true WHERE id = $1',
          [appt.id]
        );

        console.log(`[Scheduler] Payment reminder sent for appointment #${appt.id}`);
      } catch (emailErr) {
        console.error(`[Scheduler] Failed reminder for appt #${appt.id}:`, emailErr.message);
      }
    }
  } catch (error) {
    console.error('[Scheduler] Payment reminder job failed:', error.message);
  }
}

// ─── Job 3: Auto-cancel unpaid appointments at 36h after confirmation ─────────
async function autoCancelUnpaidAppointments() {
  try {
    const thirtyFourHoursAgo = new Date(Date.now() - 34 * 60 * 60 * 1000);

    // Find confirmed appointments older than 36h with no payment
    const result = await pool.query(
      `SELECT a.id, a.appointment_date, a.appointment_time, a.patient_id, a.doctor_id,
              p.full_name as patient_name, p.email as patient_email,
              d.full_name as doctor_name,
              h.name as hospital_name
       FROM appointments a
       JOIN patients p ON a.patient_id = p.id
       JOIN doctors d ON a.doctor_id = d.id
       JOIN hospitals h ON a.hospital_id = h.id
       WHERE a.status = 'confirmed'
         AND (a.payment_status IS NULL OR a.payment_status != 'completed')
         AND a.updated_at <= $1`,
      [thirtyFourHoursAgo]
    );

    for (const appt of result.rows) {
      try {
        // Cancel the appointment
        await pool.query(
          `UPDATE appointments
           SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
           WHERE id = $1`,
          [appt.id]
        );

        // Cancel any pending payment records too
        await pool.query(
          `UPDATE payments SET payment_status = 'cancelled', updated_at = CURRENT_TIMESTAMP
           WHERE appointment_id = $1 AND payment_status = 'pending'`,
          [appt.id]
        );

        // Send cancellation email
        await emailService.sendAppointmentCancelledUnpaid(
          appt.patient_email,
          appt.patient_name,
          appt.doctor_name,
          appt.appointment_date,
          appt.hospital_name
        );

        // In-app notification
        await NotificationModel.create({
          user_id: appt.patient_id,
          user_role: 'patient',
          title: '❌ Appointment Cancelled',
          message: `Your appointment with Dr. ${appt.doctor_name} on ${appt.appointment_date} was cancelled due to non-payment. Please make a new booking.`,
          type: 'error'
        });

        console.log(`[Scheduler] Auto-cancelled appointment #${appt.id} — no payment after 36h.`);
      } catch (err) {
        console.error(`[Scheduler] Failed auto-cancel for appt #${appt.id}:`, err.message);
      }
    }
  } catch (error) {
    console.error('[Scheduler] Auto-cancel job failed:', error.message);
  }
}

// ─── Start Functions ──────────────────────────────────────────────────────────
function scheduleWeeklySundayNotification() {
  const msUntilFirst = getMillisUntilNextSunday9AM();
  const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  console.log(`[Scheduler] Doctor schedule reminder set — first run in ${Math.round(msUntilFirst / 3600000)}h`);
  setTimeout(() => {
    notifyDoctorsToUpdateSchedule();
    setInterval(notifyDoctorsToUpdateSchedule, ONE_WEEK_MS);
  }, msUntilFirst);
}

function schedulePaymentDeadlineJobs() {
  const THIRTY_MINUTES = 30 * 60 * 1000;
  console.log('[Scheduler] Payment deadline jobs active — checking every 30 minutes.');
  // Run immediately on startup, then every 30 minutes
  sendPaymentReminders();
  autoCancelUnpaidAppointments();
  setInterval(sendPaymentReminders, THIRTY_MINUTES);
  setInterval(autoCancelUnpaidAppointments, THIRTY_MINUTES);
}

module.exports = {
  scheduleWeeklySundayNotification,
  schedulePaymentDeadlineJobs,
  notifyDoctorsToUpdateSchedule
};
