const pool = require('../config/db');
const crypto = require('crypto');
const emailService = require('../utils/emailService');
const PatientModel = require('../models/patientModel');
const DoctorModel = require('../models/doctorModel');
const HospitalModel = require('../models/hospitalModel');
const NotificationModel = require('../models/notificationModel');

const PAYHERE_MERCHANT_ID = process.env.PAYHERE_MERCHANT_ID || '1235580';
const PAYHERE_MERCHANT_SECRET = process.env.PAYHERE_MERCHANT_SECRET || '';

// Generate unique invoice number
function generateInvoiceNumber() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `ICAMS-${date}-${rand}`;
}

// MD5 hash helper
function md5(str) {
  return crypto.createHash('md5').update(str).digest('hex').toUpperCase();
}

// Verify PayHere notification signature
function verifyPayHereSignature({ merchant_id, order_id, payhere_amount, payhere_currency, status_code, md5sig }) {
  const localMd5Secret = md5(PAYHERE_MERCHANT_SECRET);
  const expectedSig = md5(
    `${merchant_id}${order_id}${payhere_amount}${payhere_currency}${status_code}${localMd5Secret}`
  );
  return expectedSig === md5sig;
}

const paymentController = {

  // ─── Step 1: Initiate payment — called before redirecting to PayHere ──────
  initiatePayment: async (req, res) => {
    try {
      const { appointment_id } = req.body;
      const patient_id = req.user.id;

      // Fetch appointment
      const apptRes = await pool.query(
        `SELECT a.*, d.full_name as doctor_name, h.name as hospital_name,
                p.full_name as patient_name, p.email as patient_email,
                p.phone as patient_phone
         FROM appointments a
         JOIN doctors d ON a.doctor_id = d.id
         JOIN hospitals h ON a.hospital_id = h.id
         JOIN patients p ON a.patient_id = p.id
         WHERE a.id = $1 AND a.patient_id = $2`,
        [appointment_id, patient_id]
      );

      if (apptRes.rows.length === 0) {
        return res.status(404).json({ error: 'Appointment not found' });
      }

      const appt = apptRes.rows[0];

      // Check if already paid
      if (appt.payment_status === 'completed') {
        return res.status(400).json({ error: 'Payment already completed for this appointment' });
      }

      // Fetch fee breakdown
      const [doctorFeeRes, hospitalFeeRes, platformFeeRes] = await Promise.all([
        pool.query(
          'SELECT consultation_fee FROM doctor_fees WHERE doctor_id = $1 AND hospital_id = $2',
          [appt.doctor_id, appt.hospital_id]
        ),
        pool.query('SELECT appointment_fee FROM hospitals WHERE id = $1', [appt.hospital_id]),
        pool.query("SELECT setting_value FROM platform_settings WHERE setting_key = 'icams_appointment_fee'")
      ]);

      const doctorFee = parseFloat(doctorFeeRes.rows[0]?.consultation_fee || 0);
      const hospitalFee = parseFloat(hospitalFeeRes.rows[0]?.appointment_fee || 0);
      const icamsFee = parseFloat(platformFeeRes.rows[0]?.setting_value || 0);
      const totalAmount = (doctorFee + hospitalFee + icamsFee).toFixed(2);

      const invoiceNumber = generateInvoiceNumber();
      const orderId = `${invoiceNumber}`;

      // Create payment record (pending)
      const paymentRes = await pool.query(
        `INSERT INTO payments 
           (appointment_id, patient_id, doctor_id, hospital_id, doctor_fee, hospital_fee, 
            icams_fee, total_amount, payment_status, payhere_order_id, invoice_number)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [appointment_id, patient_id, appt.doctor_id, appt.hospital_id, 
          doctorFee, hospitalFee, icamsFee, totalAmount, 'pending', orderId, invoiceNumber]
      );

      let paymentRecord = paymentRes.rows[0];

      // If already exists, fetch it
      if (!paymentRecord) {
        const existing = await pool.query(
          'SELECT * FROM payments WHERE appointment_id = $1 AND patient_id = $2',
          [appointment_id, patient_id]
        );
        paymentRecord = existing.rows[0];
      }

      const FRONTEND_URL = process.env.FRONTEND_URL || 'https://icams.pandanlabs.net';
      const BACKEND_URL = process.env.BACKEND_URL || 'https://api.icams.pandanlabs.net';

      const mId = String(PAYHERE_MERCHANT_ID || '').trim();
      const mSecret = String(PAYHERE_MERCHANT_SECRET || '').trim();

      const secretMd5 = md5(mSecret);
      const hashString = `${mId}${orderId}${totalAmount}LKR${secretMd5}`;
      const finalHash = md5(hashString);

      // Final cleaned data for the PayHere form
      const finalPayHereData = {
        merchant_id: mId,
        return_url: `${FRONTEND_URL}/patient/invoice/${appointment_id}`,
        cancel_url: `${FRONTEND_URL}/patient/appointments`,
        notify_url: `${BACKEND_URL}/api/payment/notify`,
        order_id: orderId,
        items: `Medical Appointment - ${appt.doctor_name} @ ${appt.hospital_name}`,
        currency: 'LKR',
        amount: totalAmount, // Keep .00 in form
        first_name: appt.patient_name.split(' ')[0] || appt.patient_name,
        last_name: appt.patient_name.split(' ').slice(1).join(' ') || 'Patient',
        email: appt.patient_email || '',
        phone: appt.patient_phone || '0000000000',
        address: appt.patient_address || 'N/A',
        city: 'Colombo',
        country: 'Sri Lanka',
        custom_1: appointment_id,
        hash: finalHash
      };

      res.json({
        payHereData: finalPayHereData,
        paymentId: paymentRecord?.id
      });
    } catch (error) {
      console.error('[initiatePayment Error]', error);
      res.status(500).json({ error: 'Failed to initiate payment' });
    }
  },

  // ─── Step 2: PayHere server-to-server notify callback ────────────────────
  paymentNotify: async (req, res) => {
    try {
      const {
        merchant_id, order_id, payment_id, payhere_amount,
        payhere_currency, status_code, md5sig, custom_1, custom_2
      } = req.body;

      console.log('[PayHere Notify] Received:', req.body);

      const mSecret = process.env.PAYHERE_MERCHANT_SECRET;
      
      // PayHere Signature format: UPPERCASE(MD5(merchant_id + order_id + payhere_amount + payhere_currency + status_code + UPPERCASE(MD5(merchant_secret))))
      const mSecretHash = md5(mSecret).toUpperCase();
      const localHash = md5(
        merchant_id + order_id + payhere_amount + payhere_currency + status_code + mSecretHash
      ).toUpperCase();

      console.log('[PayHere Notify] Signature Check:', {
        received: md5sig,
        calculated: localHash,
        match: md5sig === localHash
      });

      if (md5sig !== localHash) {
        console.error('[PayHere Notify] Invalid signature');
        return res.status(400).send('Invalid signature');
      }

      // status_code: 2 = success, 0 = pending, -1 = cancelled, -2 = failed, -3 = chargedback
      const statusMap = {
        '2': 'completed',
        '0': 'pending',
        '-1': 'cancelled',
        '-2': 'failed',
        '-3': 'chargedback'
      };
      const paymentStatus = statusMap[String(status_code)] || 'failed';

      // AGGRESSIVE UPDATE: Update appointment first based on custom_1 (Appointment ID)
      if (paymentStatus === 'completed' && custom_1) {
        await pool.query(
          'UPDATE appointments SET payment_status = $1 WHERE id = $2',
          ['completed', custom_1]
        );
        console.log(`[PayHere Notify] AGGRESSIVE UPDATE: Appointment ${custom_1} set to completed.`);
      }

      // Update payment record
      const paymentRes = await pool.query(
        `UPDATE payments
         SET payment_status = $1, payhere_payment_id = $2, payhere_status_code = $3,
             payhere_md5sig = $4, paid_at = $5, updated_at = CURRENT_TIMESTAMP
         WHERE payhere_order_id = $6
         RETURNING *`,
        [
          paymentStatus,
          payment_id,
          status_code,
          md5sig,
          paymentStatus === 'completed' ? new Date() : null,
          order_id
        ]
      );

      if (paymentRes.rows.length === 0) {
        console.warn('[PayHere Notify] Payment record not found for order_id:', order_id);
        // We still return 200 because the appointment was already updated above
        return res.status(200).send('Appointment updated, but payment record not found');
      }

      const payment = paymentRes.rows[0];

      if (paymentStatus === 'completed') {
        // Ensure the payment ID is linked if it wasn't already
        await pool.query(
          'UPDATE appointments SET payment_id = $1 WHERE id = $2',
          [payment.id, payment.appointment_id || custom_1]
        );

        // Notify patient
        await NotificationModel.create({
          user_id: payment.patient_id,
          user_role: 'patient',
          title: '✅ Payment Successful',
          message: `Your payment of LKR ${payment.total_amount} has been received. Invoice: ${payment.invoice_number}`,
          type: 'success'
        });

        // Notify doctor
        await NotificationModel.create({
          user_id: payment.doctor_id,
          user_role: 'doctor',
          title: '💳 Appointment Payment Confirmed',
          message: `Payment of LKR ${payment.total_amount} confirmed for appointment #${payment.appointment_id}`,
          type: 'info'
        });

        // Notify hospital
        await NotificationModel.create({
          user_id: payment.hospital_id,
          user_role: 'hospital',
          title: '💳 Appointment Payment Confirmed',
          message: `Facility fee of LKR ${payment.hospital_fee} received. Invoice: ${payment.invoice_number}`,
          type: 'info'
        });

        // Send invoice email
        try {
          const [patient, doctor, hospital] = await Promise.all([
            PatientModel.findById(payment.patient_id),
            DoctorModel.findById(payment.doctor_id),
            HospitalModel.findById(payment.hospital_id)
          ]);

          const apptRes = await pool.query('SELECT * FROM appointments WHERE id = $1', [payment.appointment_id]);
          const appt = apptRes.rows[0];

          if (patient && patient.email) {
            await emailService.sendInvoiceEmail(
              patient.email,
              patient.full_name,
              {
                invoiceNumber: payment.invoice_number,
                doctorName: doctor?.full_name || 'Your Doctor',
                hospitalName: hospital?.name || 'I-CAMS Network',
                appointmentDate: appt?.appointment_date,
                appointmentTime: appt?.appointment_time,
                reason: appt?.reason,
                doctorFee: payment.doctor_fee,
                hospitalFee: payment.hospital_fee,
                icamsFee: payment.icams_fee,
                totalAmount: payment.total_amount,
                paidAt: payment.paid_at,
                paymentId: payment.payhere_payment_id
              }
            );
          }
        } catch (emailErr) {
          console.error('[Invoice Email Error]', emailErr);
        }
      }

      res.send('OK');
    } catch (error) {
      console.error('[paymentNotify Error]', error);
      res.status(500).send('Error');
    }
  },

  // ─── Get invoice data for a specific appointment ───────────────────────────
  getInvoice: async (req, res) => {
    try {
      const { appointmentId } = req.params;
      const userId = req.user.id;
      const userRole = req.user.role;

      const result = await pool.query(
        `SELECT p.*,
                a.appointment_date, a.appointment_time, a.reason, a.status as appt_status,
                a.patient_id, a.doctor_id, a.hospital_id,
                pat.full_name as patient_name, pat.email as patient_email,
                pat.phone as patient_phone, pat.address as patient_address,
                pat.age as patient_age,
                doc.full_name as doctor_name, doc.specialization as doctor_specialization,
                doc.email as doctor_email, doc.registration_number as doctor_registration,
                h.name as hospital_name, h.address as hospital_address,
                h.phone as hospital_phone, h.type as hospital_type
         FROM payments p
         JOIN appointments a ON p.appointment_id = a.id
         JOIN patients pat ON a.patient_id = pat.id
         JOIN doctors doc ON a.doctor_id = doc.id
         JOIN hospitals h ON a.hospital_id = h.id
         WHERE p.appointment_id = $1`,
        [appointmentId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Invoice not found' });
      }

      const invoice = result.rows[0];

      // Authorization check
      const isOwner = (
        (userRole === 'patient' && String(invoice.patient_id) === String(userId)) ||
        (userRole === 'doctor' && String(invoice.doctor_id) === String(userId)) ||
        (userRole === 'hospital' && String(invoice.hospital_id) === String(userId)) ||
        userRole === 'admin'
      );

      if (!isOwner) {
        return res.status(403).json({ error: 'Access denied' });
      }

      res.json(invoice);
    } catch (error) {
      console.error('[getInvoice Error]', error);
      res.status(500).json({ error: 'Failed to fetch invoice' });
    }
  },

  // ─── Get all payments (admin) ──────────────────────────────────────────────
  getAllPayments: async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT p.*,
                pat.full_name as patient_name,
                doc.full_name as doctor_name,
                h.name as hospital_name
         FROM payments p
         JOIN patients pat ON p.patient_id = pat.id
         JOIN doctors doc ON p.doctor_id = doc.id
         JOIN hospitals h ON p.hospital_id = h.id
         ORDER BY p.created_at DESC`
      );
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch payments' });
    }
  },

  // ─── Get payment stats (admin) ────────────────────────────────────────────
  getPaymentStats: async (req, res) => {
    try {
      const result = await pool.query(
        `SELECT
           COUNT(*) FILTER (WHERE payment_status = 'completed') as total_completed,
           COUNT(*) FILTER (WHERE payment_status = 'pending') as total_pending,
           COALESCE(SUM(total_amount) FILTER (WHERE payment_status = 'completed'), 0) as total_revenue,
           COALESCE(SUM(icams_fee) FILTER (WHERE payment_status = 'completed'), 0) as icams_revenue,
           COALESCE(SUM(doctor_fee) FILTER (WHERE payment_status = 'completed'), 0) as doctor_revenue,
           COALESCE(SUM(hospital_fee) FILTER (WHERE payment_status = 'completed'), 0) as hospital_revenue
         FROM payments`
      );
      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  }
};

module.exports = paymentController;
