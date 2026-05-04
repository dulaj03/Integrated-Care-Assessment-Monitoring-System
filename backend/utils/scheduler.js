/**
 * Scheduler utility — runs background jobs like Sunday availability reminders
 * Uses native setInterval so no extra dependencies needed
 */

const pool = require('../config/db');
const NotificationModel = require('../models/notificationModel');

function getMillisUntilNextSunday9AM() {
  const now = new Date();
  // Sunday = 0
  const daysUntilSunday = (7 - now.getDay()) % 7 || 7; // always target NEXT Sunday
  const nextSunday = new Date(now);
  nextSunday.setDate(now.getDate() + daysUntilSunday);
  nextSunday.setHours(9, 0, 0, 0);
  return nextSunday - now;
}

async function notifyDoctorsToUpdateSchedule() {
  try {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diffToMonday = (dayOfWeek === 0) ? -6 : 1 - dayOfWeek;
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() + diffToMonday);
    const weekStartDate = weekStart.toISOString().split('T')[0];

    // Find active doctors who haven't updated this week
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

function scheduleWeeklySundayNotification() {
  const msUntilFirst = getMillisUntilNextSunday9AM();
  const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

  console.log(`[Scheduler] Doctor schedule reminder set — first run in ${Math.round(msUntilFirst / 3600000)}h`);

  setTimeout(() => {
    notifyDoctorsToUpdateSchedule();
    // Then run every week
    setInterval(notifyDoctorsToUpdateSchedule, ONE_WEEK_MS);
  }, msUntilFirst);
}

module.exports = { scheduleWeeklySundayNotification, notifyDoctorsToUpdateSchedule };
