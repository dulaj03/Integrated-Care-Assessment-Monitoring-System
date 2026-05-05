const nodemailer = require('nodemailer');

// Configure the transporter with provided Gmail credentials
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send Contact Message Email to I-CAMS Team
 */
exports.sendToAdmin = async (name, email, message) => {
  const mailOptions = {
    from: `"I-CAMS Contact" <${process.env.EMAIL_USER}>`,
    to: process.env.CONTACT_RECIPIENT || 'infoicams123@gmail.com',
    subject: `New Contact Message from ${name}`,
    html: `
      <h2>New Message Received</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `,
  };

  return transporter.sendMail(mailOptions);
};

/**
 * Send Professional Auto-Reply Email to the User
 */
exports.sendToUser = async (name, email) => {
  const mailOptions = {
    from: `"I-CAMS Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'We Received Your Message - I-CAMS Support',
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #2563eb; margin-bottom: 5px;">I-CAMS</h2>
          <p style="color: #64748b; font-size: 14px; margin-top: 0;">Integrated Clinical & Administrative Management System</p>
        </div>
        
        <p>Dear <strong>${name}</strong>,</p>
        
        <p>Thank you for reaching out to us. We have successfully received your message sent through our contact form.</p>
        
        <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; font-weight: bold; color: #1e293b;">
            "I-CAMS will contact you within 24 hours."
          </p>
        </div>
        
        <p>Our team is currently reviewing your inquiry and will provide a detailed response as soon as possible.</p>
        
        <p style="margin-top: 30px;">Best regards,<br><strong>The I-CAMS Team</strong></p>
        
        <div style="margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 12px; color: #94a3b8; text-align: center;">
          <p>© 2026 I-CAMS Sri Lanka. All rights reserved.</p>
          <p>Please do not reply to this automated email.</p>
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

/**
 * Send Hospital Verification Form Email (In-Body Form for easy reply)
 */
exports.sendHospitalVerification = async (hospitalName, contactPerson, email) => {
  const mailOptions = {
    from: `"I-CAMS Institutional" <${process.env.EMAIL_USER}>`,
    to: email,
    replyTo: process.env.CONTACT_RECIPIENT || 'infoicams123@gmail.com',
    subject: `Institutional Verification Request: Hospital Registration for ${hospitalName}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #334155; max-width: 650px; margin: 0 auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 1px solid #f1f5f9;">
          <h2 style="color: #2563eb; margin: 0; font-size: 28px; font-weight: 800;">I-CAMS</h2>
          <p style="color: #64748b; font-size: 14px; margin: 5px 0 0; text-transform: uppercase; tracking: 0.1em;">Institutional Verification Portal</p>
        </div>
        
        <p>Dear <strong>${contactPerson}</strong>,</p>
        
        <p>Thank you for initiating the registration request for <strong>${hospitalName}</strong> on the I-CAMS platform.</p>
        
        <div style="background-color: #f8fafc; border-left: 5px solid #2563eb; padding: 25px; margin: 30px 0; border-radius: 4px;">
          <h3 style="color: #1e40af; margin-top: 0; font-size: 18px;">How to Complete Your Verification</h3>
          <p style="margin-bottom: 15px;">To ensure the clinical integrity of our network, please <strong>reply directly to this email</strong> with the information requested below. Our team will use these details to authorize your account in the I-CAMS Admin Panel.</p>
          
          <div style="background-color: #ffffff; padding: 20px; border: 1px dashed #cbd5e1; border-radius: 8px;">
            <p style="margin-top: 0; font-weight: bold; color: #475569;">PLEASE PROVIDE THE FOLLOWING DETAILS IN YOUR REPLY:</p>
            <ul style="padding-left: 20px; margin-bottom: 0;">
              <li style="margin-bottom: 8px;"><strong>Official Registered Name:</strong> [Provide Full Legal Name]</li>
              <li style="margin-bottom: 8px;"><strong>Facility Address:</strong> [Full Physical Address in Sri Lanka]</li>
              <li style="margin-bottom: 8px;"><strong>Registration Number:</strong> [Ministry of Health / PHSRC Registration #]</li>
              <li style="margin-bottom: 8px;"><strong>Number of Clinical Staff:</strong> [Total Doctors & Nurses]</li>
              <li style="margin-bottom: 8px;"><strong>Primary Specializations:</strong> [e.g., General Medicine, Pediatrics, etc.]</li>
              <li><strong>Authorizing Officer:</strong> [Name and Title of the person authorizing I-CAMS integration]</li>
            </ul>
          </div>
        </div>
        
        <p>Once we receive your reply, the I-CAMS Onboarding Team will review the credentials and finalize the registration within the <strong>Admin Control Center</strong>. You will receive a separate email containing your hospital's secure dashboard login credentials once verified.</p>
        
        <p style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #f1f5f9;">Best regards,<br><span style="color: #2563eb; font-weight: bold;">Institutional Onboarding Team</span><br>Integrated Care & Monitoring System (I-CAMS)</p>
        
        <div style="margin-top: 40px; font-size: 11px; color: #94a3b8; text-align: center;">
          <p>© 2026 I-CAMS. Integrated Healthcare & Clinical Administrative Management Solution.</p>
          <p>Please reply to this email directly to submit your verification details.</p>
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};


/**
 * Notify Admin of New Hospital Request
 */
exports.notifyAdminOfHospitalRequest = async (hospitalName, contactPerson, email, requirements) => {
  const mailOptions = {
    from: `"I-CAMS Alerts" <${process.env.EMAIL_USER}>`,
    to: process.env.CONTACT_RECIPIENT || 'infoicams123@gmail.com',
    subject: `ACTION REQUIRED: New Hospital Partner Request - ${hospitalName}`,
    html: `
      <div style="font-family: sans-serif; color: #1e293b;">
        <h2 style="color: #ef4444;">New Institutional Request Received</h2>
        <p>A new hospital has requested to join the I-CAMS network and has been sent the verification form.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p><strong>Hospital:</strong> ${hospitalName}</p>
        <p><strong>Contact:</strong> ${contactPerson}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Requirements:</strong></p>
        <blockquote style="background: #f1f5f9; padding: 15px; border-radius: 5px;">${requirements}</blockquote>
        <p style="font-size: 12px; color: #64748b; margin-top: 30px;">Logged via I-CAMS Public Gateway</p>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

/**
 * Send Critical Health Alert to Patient & Care Team
 */
exports.sendCriticalAlert = async (recipients, patientName, vitalsData, reasons) => {
  if (!recipients || recipients.length === 0) return;

  const { systolic, diastolic, heartRate, temperature, oxygen } = vitalsData;
  
  const mailOptions = {
    from: `"I-CAMS CRITICAL ALERT" <${process.env.EMAIL_USER}>`,
    to: recipients.join(', '),
    priority: 'high',
    subject: `URGENT: Critical Health Alert for ${patientName}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; border: 2px solid #ef4444; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #ef4444; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 800;">CRITICAL VITALS ALERT</h1>
          <p style="margin: 5px 0 0; opacity: 0.9; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em;">Immediate Attention Required</p>
        </div>
        
        <div style="padding: 30px; background-color: #ffffff;">
          <p style="font-size: 16px; margin-top: 0;">This is an automated clinical alert for patient <strong>${patientName}</strong>. Vitals have exceeded safety thresholds:</p>
          
          <div style="background-color: #fef2f2; border: 1px solid #fee2e2; border-radius: 8px; padding: 20px; margin: 25px 0;">
            <p style="margin-top: 0; font-weight: bold; color: #991b1b; font-size: 14px; text-transform: uppercase;">Alert Reasons:</p>
            <p style="color: #b91c1c; font-weight: bold; margin-bottom: 20px;">${reasons.join(', ')}</p>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #fee2e2; color: #64748b;">Blood Pressure</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #fee2e2; text-align: right; font-weight: bold; color: ${systolic > 150 ? '#ef4444' : '#1e293b'}">${systolic}/${diastolic} mmHg</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #fee2e2; color: #64748b;">Heart Rate</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #fee2e2; text-align: right; font-weight: bold; color: ${heartRate > 110 ? '#ef4444' : '#1e293b'}">${heartRate} BPM</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #fee2e2; color: #64748b;">Oxygen Level (SpO2)</td>
                <td style="padding: 8px 0; border-bottom: 1px solid #fee2e2; text-align: right; font-weight: bold; color: ${oxygen < 92 ? '#ef4444' : '#1e293b'}">${oxygen}%</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Core Temperature</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold; color: ${temperature > 38.5 ? '#ef4444' : '#1e293b'}">${temperature}°C</td>
              </tr>
            </table>
          </div>
          
          <p style="font-size: 14px; color: #475569; background-color: #f8fafc; padding: 15px; border-radius: 6px; border-left: 4px solid #64748b;">
            <strong>Clinical Protocol:</strong> Please review the patient's record immediately and initiate secondary verification or emergency response procedures as per hospital guidelines.
          </p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #f1f5f9; text-align: center;">
            <p style="margin: 0; color: #94a3b8; font-size: 12px;">© 2026 I-CAMS Sri Lanka. Real-time Clinical Monitoring.</p>
          </div>
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

/**
 * Urgent Payment Reminder — 24 hours after doctor approval, payment still pending
 */
exports.sendPaymentReminder = async (email, patientName, doctorName, date, time, hospitalName) => {
  const FRONTEND_URL = process.env.FRONTEND_URL || 'https://icams.pandanlabs.net';
  const loginUrl = `${FRONTEND_URL}/login/patient`;
  const formatDate = (d) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
  };
  const mailOptions = {
    from: `"I-CAMS Appointments" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '⚠️ URGENT: Complete Your Payment in 12 Hours or Appointment Will Be Cancelled',
    html: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#fff7ed;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<div style="max-width:650px;margin:40px auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,0.12);border:2px solid #fed7aa;">

  <!-- Urgent Header -->
  <div style="background:linear-gradient(135deg,#ea580c 0%,#f97316 60%,#fb923c 100%);padding:45px 40px;text-align:center;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin:0 auto 20px;">
      <tr>
        <td align="center" style="background:rgba(255,255,255,0.2);border-radius:50%;width:70px;height:70px;vertical-align:middle;">
          <span style="font-size:36px;line-height:70px;">⚠️</span>
        </td>
      </tr>
    </table>
    <h1 style="margin:0;color:white;font-size:24px;font-weight:800;">Action Required!</h1>
    <p style="margin:10px 0 0;color:rgba(255,255,255,0.9);font-size:15px;font-weight:600;">Your appointment payment is overdue — 12 hours remaining</p>
  </div>

  <!-- Body -->
  <div style="padding:40px;">
    <p style="font-size:16px;color:#1e293b;margin-top:0;">Dear <strong>${patientName}</strong>,</p>
    <p style="font-size:15px;color:#475569;line-height:1.7;">
      This is an urgent reminder that your approved appointment with <strong>Dr. ${doctorName}</strong> at
      <strong>${hospitalName}</strong> has <strong style="color:#ea580c;">not yet been paid for</strong>.
    </p>

    <!-- Warning Box -->
    <div style="background:#fff7ed;border:2px solid #fed7aa;border-radius:16px;padding:20px;margin:25px 0;">
      <p style="margin:0 0 10px;font-size:14px;font-weight:800;color:#9a3412;">⏰ Time is running out:</p>
      <ul style="margin:0;padding-left:20px;color:#7c2d12;font-size:14px;line-height:2;">
        <li>You have <strong>12 hours remaining</strong> to complete payment</li>
        <li>If not paid, your appointment will be <strong>automatically cancelled</strong></li>
        <li>You will need to make a new booking at a different date/time</li>
      </ul>
    </div>

    <!-- Appointment Details -->
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:16px;padding:20px;margin-bottom:30px;">
      <p style="margin:0 0 12px;font-size:11px;color:#64748b;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;">📅 Your Appointment</p>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:5px 0;font-size:13px;color:#64748b;">Physician</td>
          <td style="padding:5px 0;text-align:right;font-weight:800;color:#1e293b;">Dr. ${doctorName}</td>
        </tr>
        <tr>
          <td style="padding:5px 0;font-size:13px;color:#64748b;">Facility</td>
          <td style="padding:5px 0;text-align:right;font-weight:800;color:#1e293b;">${hospitalName}</td>
        </tr>
        <tr>
          <td style="padding:5px 0;font-size:13px;color:#64748b;">Date</td>
          <td style="padding:5px 0;text-align:right;font-weight:800;color:#1e293b;">${formatDate(date)}</td>
        </tr>
        <tr>
          <td style="padding:5px 0;font-size:13px;color:#64748b;">Time</td>
          <td style="padding:5px 0;text-align:right;font-weight:800;color:#1e293b;">${time}</td>
        </tr>
      </table>
    </div>

    <!-- CTA Button -->
    <div style="text-align:center;margin:30px 0;">
      <a href="${loginUrl}" style="
        display:inline-block;
        background:linear-gradient(135deg,#ea580c,#f97316);
        color:#ffffff;
        text-decoration:none;
        font-size:17px;
        font-weight:800;
        padding:18px 48px;
        border-radius:14px;
        box-shadow:0 8px 25px rgba(234,88,12,0.4);
      ">💳 Login &amp; Pay Now</a>
    </div>
    <p style="text-align:center;font-size:13px;color:#94a3b8;">Or go to: <span style="color:#ea580c;">${loginUrl}</span></p>

    <p style="font-size:15px;color:#1e293b;margin-top:35px;">Regards,<br>
      <strong style="color:#ea580c;">I-CAMS Appointment Team</strong>
    </p>
  </div>

  <!-- Footer -->
  <div style="background:#fff7ed;padding:20px 40px;text-align:center;border-top:1px solid #fed7aa;">
    <p style="margin:0;color:#94a3b8;font-size:11px;">© 2026 I-CAMS Sri Lanka · This is an automated reminder. Please do not reply.</p>
  </div>
</div>
</body>
</html>`
  };
  return transporter.sendMail(mailOptions);
};

/**
 * Auto-Cancellation Notice — appointment cancelled after 36 hours without payment
 */
exports.sendAppointmentCancelledUnpaid = async (email, patientName, doctorName, date, hospitalName) => {
  const FRONTEND_URL = process.env.FRONTEND_URL || 'https://icams.pandanlabs.net';
  const loginUrl = `${FRONTEND_URL}/login`;
  const formatDate = (d) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
  };
  const mailOptions = {
    from: `"I-CAMS Appointments" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '❌ Appointment Cancelled — Payment Not Received | I-CAMS',
    html: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#fef2f2;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<div style="max-width:650px;margin:40px auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,0.1);border:2px solid #fecaca;">

  <!-- Red Header -->
  <div style="background:linear-gradient(135deg,#b91c1c 0%,#dc2626 60%,#ef4444 100%);padding:45px 40px;text-align:center;">
    <div style="background:rgba(255,255,255,0.2);border-radius:50%;width:70px;height:70px;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;">
      <span style="font-size:36px;">❌</span>
    </div>
    <h1 style="margin:0;color:white;font-size:24px;font-weight:800;">Appointment Cancelled</h1>
    <p style="margin:10px 0 0;color:rgba(255,255,255,0.9);font-size:15px;">Payment was not received within 36 hours of approval</p>
  </div>

  <!-- Body -->
  <div style="padding:40px;">
    <p style="font-size:16px;color:#1e293b;margin-top:0;">Dear <strong>${patientName}</strong>,</p>
    <p style="font-size:15px;color:#475569;line-height:1.7;">
      Unfortunately, your appointment with <strong>Dr. ${doctorName}</strong> at <strong>${hospitalName}</strong>
      scheduled for <strong>${formatDate(date)}</strong> has been <strong style="color:#dc2626;">automatically cancelled</strong>
      because the payment was not completed within the 36-hour window.
    </p>

    <!-- Info Box -->
    <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:16px;padding:20px;margin:25px 0;">
      <p style="margin:0 0 8px;font-size:14px;font-weight:800;color:#991b1b;">Why was it cancelled?</p>
      <p style="margin:0;font-size:14px;color:#7f1d1d;line-height:1.7;">
        To ensure fair access for all patients, appointment slots that are not confirmed by payment within
        <strong>36 hours</strong> of doctor approval are automatically released back to the system.
      </p>
    </div>

    <!-- What to do next -->
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:16px;padding:20px;margin-bottom:30px;">
      <p style="margin:0 0 10px;font-size:13px;font-weight:800;color:#15803d;">✅ What you can do:</p>
      <ul style="margin:0;padding-left:20px;color:#166534;font-size:14px;line-height:2;">
        <li>Book a new appointment at your preferred date and time</li>
        <li>Complete payment immediately after doctor approval next time</li>
        <li>Contact the hospital if you need urgent assistance</li>
      </ul>
    </div>

    <!-- CTA Button -->
    <div style="text-align:center;margin:30px 0;">
      <a href="${loginUrl}" style="
        display:inline-block;
        background:linear-gradient(135deg,#2563eb,#3b82f6);
        color:#ffffff;
        text-decoration:none;
        font-size:17px;
        font-weight:800;
        padding:18px 48px;
        border-radius:14px;
        box-shadow:0 8px 25px rgba(37,99,235,0.4);
      ">📅 Login to Book Again</a>
    </div>

    <p style="font-size:15px;color:#1e293b;margin-top:35px;">We apologise for the inconvenience.<br>
      <strong style="color:#2563eb;">I-CAMS Appointment Team</strong>
    </p>
  </div>

  <!-- Footer -->
  <div style="background:#fef2f2;padding:20px 40px;text-align:center;border-top:1px solid #fecaca;">
    <p style="margin:0;color:#94a3b8;font-size:11px;">© 2026 I-CAMS Sri Lanka · This is an automated system notification.</p>
  </div>
</div>
</body>
</html>`
  };
  return transporter.sendMail(mailOptions);
};

/**
 * Notify Patient of Appointment Approval — Ready to Pay
 */
exports.sendAppointmentApproval = async (email, patientName, doctorName, date, time, hospitalName) => {
  const FRONTEND_URL = process.env.FRONTEND_URL || 'https://icams.pandanlabs.net';
  const loginUrl = `${FRONTEND_URL}/login/patient`;

  const formatDate = (d) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const mailOptions = {
    from: `"I-CAMS Appointments" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '✅ Appointment Approved — Complete Your Payment | I-CAMS',
    html: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<div style="max-width:650px;margin:40px auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,0.1);border:1px solid #e2e8f0;">

  <!-- Header -->
  <div style="background:linear-gradient(135deg,#059669 0%,#10b981 60%,#34d399 100%);padding:50px 40px;text-align:center;">
    <div style="display:inline-block;background:rgba(255,255,255,0.2);border-radius:16px;padding:12px 24px;margin-bottom:20px;">
      <span style="color:white;font-size:28px;font-weight:900;letter-spacing:-1px;">I-CAMS</span>
    </div>
    <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin:0 auto 20px;">
      <tr>
        <td align="center" style="background:rgba(255,255,255,0.25);border-radius:50%;width:70px;height:70px;vertical-align:middle;">
          <span style="font-size:36px;line-height:70px;">✅</span>
        </td>
      </tr>
    </table>
    <h1 style="margin:0;color:white;font-size:26px;font-weight:800;">Appointment Approved!</h1>
    <p style="margin:10px 0 0;color:rgba(255,255,255,0.9);font-size:15px;">Your appointment is confirmed — complete your payment to secure your slot.</p>
  </div>

  <!-- Body -->
  <div style="padding:40px;">
    <p style="font-size:16px;color:#1e293b;margin-top:0;">Dear <strong>${patientName}</strong>,</p>
    <p style="font-size:15px;color:#475569;line-height:1.7;">
      Great news! Both <strong>${hospitalName}</strong> and <strong>Dr. ${doctorName}</strong> have reviewed and approved your appointment request.
      Your slot is reserved — please complete the payment on I-CAMS to fully confirm your booking.
    </p>

    <!-- Appointment Card -->
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:20px;padding:25px;margin:30px 0;">
      <p style="margin:0 0 15px;font-size:11px;color:#15803d;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;">📅 Your Appointment Details</p>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:8px 0;width:50%;vertical-align:top;">
            <p style="margin:0;font-size:12px;color:#6b7280;font-weight:700;text-transform:uppercase;">Physician</p>
            <p style="margin:4px 0 0;font-size:16px;font-weight:800;color:#1e293b;">Dr. ${doctorName}</p>
          </td>
          <td style="padding:8px 0;text-align:right;vertical-align:top;">
            <p style="margin:0;font-size:12px;color:#6b7280;font-weight:700;text-transform:uppercase;">Healthcare Facility</p>
            <p style="margin:4px 0 0;font-size:16px;font-weight:800;color:#1e293b;">${hospitalName}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:15px 0 0;">
            <p style="margin:0;font-size:12px;color:#6b7280;font-weight:700;text-transform:uppercase;">Date</p>
            <p style="margin:4px 0 0;font-size:15px;font-weight:800;color:#1e293b;">${formatDate(date)}</p>
          </td>
          <td style="padding:15px 0 0;text-align:right;">
            <p style="margin:0;font-size:12px;color:#6b7280;font-weight:700;text-transform:uppercase;">Time</p>
            <p style="margin:4px 0 0;font-size:15px;font-weight:800;color:#1e293b;">${time}</p>
          </td>
        </tr>
      </table>
    </div>

    <!-- Next Step Instructions -->
    <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:16px;padding:20px;margin-bottom:30px;">
      <p style="margin:0 0 8px;font-size:13px;font-weight:800;color:#92400e;">⚡ What you need to do next:</p>
      <ol style="margin:0;padding-left:20px;color:#78350f;font-size:14px;line-height:1.8;">
        <li>Click the button below to log in to I-CAMS</li>
        <li>Go to <strong>My Appointments</strong></li>
        <li>Click <strong>"Pay Now — Confirm Appointment"</strong> on your approved appointment</li>
        <li>Complete the secure payment via PayHere</li>
        <li>You will receive your invoice by email — <strong>show it at the hospital reception</strong></li>
      </ol>
    </div>

    <!-- CTA Button -->
    <div style="text-align:center;margin:35px 0;">
      <a href="${loginUrl}" style="
        display:inline-block;
        background:linear-gradient(135deg,#059669,#10b981);
        color:#ffffff;
        text-decoration:none;
        font-size:17px;
        font-weight:800;
        padding:18px 48px;
        border-radius:14px;
        letter-spacing:0.02em;
        box-shadow:0 8px 25px rgba(16,185,129,0.45);
      ">💳 Login to Pay &amp; Confirm</a>
    </div>
    <p style="text-align:center;font-size:13px;color:#94a3b8;margin-top:8px;">Or paste this link: <span style="color:#059669;">${loginUrl}</span></p>

    <!-- Arrival Note -->
    <div style="background:#f0fdf4;border-left:4px solid #10b981;border-radius:8px;padding:16px 20px;margin-top:30px;">
      <p style="margin:0;font-size:14px;color:#065f46;">
        📌 <strong>At the hospital:</strong> Present your I-CAMS invoice (email or app) at the reception desk upon arrival. The hospital team will guide you from there.
      </p>
    </div>

    <p style="font-size:15px;color:#1e293b;margin-top:40px;">Warm regards,<br>
      <strong style="color:#059669;">I-CAMS Appointment Team</strong><br>
      <span style="font-size:12px;color:#94a3b8;">Sri Lanka's Premier Clinical Network</span>
    </p>
  </div>

  <!-- Footer -->
  <div style="background:#f1f5f9;padding:25px 40px;text-align:center;border-top:1px solid #e2e8f0;">
    <p style="margin:0;color:#94a3b8;font-size:11px;line-height:1.8;">
      &copy; 2026 I-CAMS Sri Lanka · Integrated Care &amp; Monitoring System<br>
      Support: infoicams123@gmail.com<br>
      <span style="color:#cbd5e1;">This is an automated notification. Please do not reply directly.</span>
    </p>
  </div>

</div>
</body>
</html>`
  };
  return transporter.sendMail(mailOptions);
};

/**
 * Notify Patient of Nurse Assignment
 */
exports.sendNurseAssignment = async (email, patientName, nurseName, doctorName) => {
  const mailOptions = {
    from: `"I-CAMS Care Team" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `New Care Team Member Assigned: ${nurseName}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
        <div style="background-color: #0d9488; color: white; padding: 30px; text-align: center;">
          <h2 style="margin: 0; font-weight: 800;">Care Team Update</h2>
          <p style="margin: 5px 0 0; opacity: 0.9;">A personal nurse has been assigned to your care</p>
        </div>
        <div style="padding: 30px; background-color: #ffffff;">
          <p>Dear <strong>${patientName}</strong>,</p>
          <p>To ensure you receive the highest quality of continuous monitoring, <strong>Dr. ${doctorName}</strong> has expanded your clinical care team.</p>
          <div style="background-color: #f0fdfa; border-left: 4px solid #0d9488; padding: 20px; margin: 25px 0;">
            <p style="margin: 0; font-size: 16px;"><strong>Assigned Nurse:</strong> ${nurseName}</p>
            <p style="margin: 5px 0 0; color: #0f766e; font-size: 14px;">This nurse will be responsible for reviewing your daily health logs and performing clinical rounds.</p>
          </div>
          <p style="font-size: 14px; color: #475569;">You can now communicate with your assigned nurse through the I-CAMS Messaging Portal.</p>
          <div style="margin-top: 40px; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 20px;">
            <p style="margin: 0; color: #94a3b8; font-size: 11px;">© 2026 I-CAMS. Integrated Patient Care.</p>
          </div>
        </div>
      </div>
    `
  };
  return transporter.sendMail(mailOptions);
};

/**
 * Notify Patient & Doctor of Lab Result Upload
 */
exports.sendLabResultNotification = async (recipients, patientName, testName, hospitalName) => {
  if (!recipients || recipients.length === 0) return;
  const mailOptions = {
    from: `"I-CAMS Lab Portal" <${process.env.EMAIL_USER}>`,
    to: recipients.join(', '),
    subject: `LAB READY: ${testName} Results for ${patientName}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
        <div style="background-color: #7c3aed; color: white; padding: 30px; text-align: center;">
          <h2 style="margin: 0; font-weight: 800;">Laboratory Results Ready</h2>
          <p style="margin: 5px 0 0; opacity: 0.9;">Clinical data has been officially published</p>
        </div>
        <div style="padding: 30px; background-color: #ffffff;">
          <p>This is an automated clinical notification from <strong>${hospitalName}</strong>.</p>
          <div style="background-color: #f5f3ff; border: 1px solid #ddd6fe; border-radius: 12px; padding: 20px; margin: 25px 0;">
             <p style="margin: 0; font-size: 14px; color: #6d28d9; text-transform: uppercase; font-weight: 900; letter-spacing: 0.05em;">Published Report</p>
             <h3 style="margin: 5px 0 0; color: #1e293b;">${testName}</h3>
             <p style="margin: 10px 0 0; font-size: 14px;"><strong>Patient:</strong> ${patientName}</p>
          </div>
          <p style="font-size: 14px; color: #475569;">The full report and summarized clinical findings are now available for review within the I-CAMS Patient Dashboard and Physician Portal.</p>
          <div style="margin-top: 40px; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 20px;">
            <p style="margin: 0; color: #94a3b8; font-size: 11px;">© 2026 I-CAMS. Diagnostic Laboratory Management.</p>
          </div>
        </div>
      </div>
    `
  };
  return transporter.sendMail(mailOptions);
};

/**
 * Send OTP Email for Password Reset
 */
exports.sendOTPEmail = async (email, name, otp) => {
  const mailOptions = {
    from: `"I-CAMS Security" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Your I-CAMS Password Reset OTP: ${otp}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); color: white; padding: 30px; text-align: center;">
          <h2 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">🔐 Password Reset Request</h2>
          <p style="margin: 8px 0 0; opacity: 0.85; font-size: 14px;">I-CAMS Integrated Clinical Management System</p>
        </div>
        <div style="padding: 35px 30px; background-color: #ffffff;">
          <p style="font-size: 16px; margin-top: 0;">Dear <strong>${name}</strong>,</p>
          <p style="color: #475569;">We received a request to reset your I-CAMS account password. Use the one-time password (OTP) below to proceed. This code is valid for <strong>10 minutes</strong> only.</p>

          <div style="text-align: center; margin: 35px 0;">
            <div style="display: inline-block; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 2px dashed #2563eb; border-radius: 16px; padding: 25px 40px;">
              <p style="margin: 0 0 8px; font-size: 12px; font-weight: 700; color: #2563eb; text-transform: uppercase; letter-spacing: 0.15em;">Your OTP Code</p>
              <p style="margin: 0; font-size: 48px; font-weight: 900; color: #1e3a8a; letter-spacing: 12px; font-family: 'Courier New', monospace;">${otp}</p>
              <p style="margin: 10px 0 0; font-size: 12px; color: #64748b;">Valid for 10 minutes</p>
            </div>
          </div>

          <div style="background-color: #fef9c3; border-left: 4px solid #f59e0b; border-radius: 4px; padding: 15px 20px; margin: 25px 0;">
            <p style="margin: 0; font-size: 13px; color: #78350f;"><strong>⚠️ Security Notice:</strong> Never share this OTP with anyone. I-CAMS staff will NEVER ask for your OTP. If you did not request this reset, please ignore this email — your password will remain unchanged.</p>
          </div>

          <p style="font-size: 14px; color: #64748b;">If you did not request a password reset, no action is required. Your account remains secure.</p>

          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #f1f5f9; text-align: center;">
            <p style="margin: 0; color: #94a3b8; font-size: 11px;">© 2026 I-CAMS Sri Lanka. Integrated Healthcare Management.</p>
            <p style="margin: 4px 0 0; color: #cbd5e1; font-size: 11px;">This is an automated security email. Please do not reply.</p>
          </div>
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

/**
 * Send Patient Email Verification Link
 */
exports.sendEmailVerification = async (email, name, verificationToken) => {
  const verifyUrl = `${process.env.FRONTEND_URL || 'https://icams.pandanlabs.net'}/verify-email?token=${verificationToken}`;

  const mailOptions = {
    from: `"I-CAMS Accounts" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify Your Email Address – I-CAMS Patient Registration',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
        <div style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #3b82f6 100%); padding: 40px 30px; text-align: center;">
          <div style="display: inline-block; background: rgba(255,255,255,0.15); border-radius: 16px; padding: 12px 24px; margin-bottom: 16px;">
            <span style="color: white; font-size: 26px; font-weight: 900; letter-spacing: -1px;">I-CAMS</span>
          </div>
          <h1 style="margin: 0; color: white; font-size: 22px; font-weight: 700;">Confirm Your Email Address</h1>
          <p style="margin: 8px 0 0; color: rgba(255,255,255,0.8); font-size: 14px;">Sri Lanka's Integrated Clinical & Administrative Management System</p>
        </div>

        <div style="padding: 40px 35px; background: #ffffff;">
          <p style="font-size: 16px; margin-top: 0; color: #1e293b;">Hello <strong>${name}</strong> 👋</p>
          <p style="color: #475569; line-height: 1.7; margin-bottom: 30px;">
            You're almost ready to access your I-CAMS Patient Portal. To complete your registration and secure your account, please verify your email address by clicking the button below.
          </p>

          <div style="text-align: center; margin: 35px 0;">
            <a href="${verifyUrl}" style="
              display: inline-block;
              background: linear-gradient(135deg, #1e3a8a, #2563eb);
              color: #ffffff;
              text-decoration: none;
              font-size: 16px;
              font-weight: 700;
              padding: 16px 42px;
              border-radius: 12px;
              letter-spacing: 0.02em;
              box-shadow: 0 4px 20px rgba(37,99,235,0.45);
            ">✅ Verify Email Address</a>
          </div>

          <p style="font-size: 13px; color: #94a3b8; text-align: center; margin: 0 0 6px;">Or copy and paste this link into your browser:</p>
          <p style="font-size: 12px; color: #2563eb; text-align: center; word-break: break-all; margin: 0 0 30px;">${verifyUrl}</p>

          <div style="background: #fef9c3; border-left: 4px solid #f59e0b; border-radius: 6px; padding: 14px 18px; margin: 25px 0;">
            <p style="margin: 0; font-size: 13px; color: #78350f;">
              <strong>⚠️ Important:</strong> This verification link expires in <strong>30 minutes</strong>. If you did not create an I-CAMS account, please ignore this email.
            </p>
          </div>

          <p style="font-size: 14px; color: #64748b; line-height: 1.6;">Once verified, you will be prompted to set your password and gain access to your personalised Patient Dashboard.</p>
        </div>

        <div style="background: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; color: #94a3b8; font-size: 11px;">© 2026 I-CAMS Sri Lanka · Integrated Healthcare Management</p>
          <p style="margin: 4px 0 0; color: #cbd5e1; font-size: 11px;">This is an automated email. Please do not reply directly.</p>
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

/**
 * Send Professional Welcome & Guideline Email to New Patients
 */
exports.sendPatientWelcomeEmail = async (email, name) => {
  const mailOptions = {
    from: `"I-CAMS Welcome Team" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Welcome to I-CAMS! 🚀 Your Journey to Integrated Healthcare Starts Here',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; max-width: 650px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #3b82f6 100%); padding: 50px 40px; text-align: center;">
          <div style="display: inline-block; background: rgba(255,255,255,0.2); border-radius: 20px; padding: 12px 24px; margin-bottom: 20px; backdrop-filter: blur(10px);">
             <span style="color: white; font-size: 32px; font-weight: 900; letter-spacing: -1px;">I-CAMS</span>
          </div>
          <h1 style="margin: 0; color: white; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">Welcome to the Future of Care!</h1>
          <p style="margin: 10px 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">We're thrilled to have you as part of our integrated healthcare community.</p>
        </div>

        <!-- Body -->
        <div style="padding: 45px 40px; background: #ffffff;">
          <h2 style="font-size: 20px; color: #1e3a8a; margin-top: 0;">Hello ${name},</h2>
          <p style="color: #475569; line-height: 1.8; font-size: 15px; margin-bottom: 30px;">
            Your I-CAMS account is now active. Whether you're at home or on the go, your health data is now at your fingertips. Here is your comprehensive guide to mastering the <strong>Patient Dashboard</strong>:
          </p>

          <!-- Feature List -->
          <div style="margin-bottom: 20px;">
            
            <!-- Vitals -->
            <div style="background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 16px; padding: 20px; margin-bottom: 15px; display: flex; align-items: flex-start;">
              <div style="font-size: 24px; margin-right: 15px;">📊</div>
              <div>
                <h3 style="margin: 0 0 5px; font-size: 16px; color: #1e293b;">Precision Health Monitoring</h3>
                <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5;">Track your vitals (BP, Heart Rate, Oxygen) with high-fidelity charts. Always stay informed about your health trends with real-time data synchronization directly from clinical sources.</p>
              </div>
            </div>

            <!-- Care Team -->
            <div style="background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 16px; padding: 20px; margin-bottom: 15px; display: flex; align-items: flex-start;">
              <div style="font-size: 24px; margin-right: 15px;">👨‍⚕️</div>
              <div>
                <h3 style="margin: 0 0 5px; font-size: 16px; color: #1e293b;">Interactive Care Team Access</h3>
                <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5;">Your dashboard lists every <strong>Doctor</strong> and <strong>Nurse</strong> within your care circle. You can view their professional credentials, real-time availability, and clinical reports written specifically for you.</p>
              </div>
            </div>

            <!-- Messaging -->
            <div style="background: #eff6ff; border: 1px solid #dbeafe; border-radius: 16px; padding: 20px; margin-bottom: 15px; display: flex; align-items: flex-start;">
              <div style="font-size: 24px; margin-right: 15px;">💬</div>
              <div>
                <h3 style="margin: 0 0 5px; font-size: 16px; color: #1e3a8a;">Direct Secure Messaging</h3>
                <p style="margin: 0; font-size: 13px; color: #3b82f6; line-height: 1.5;">No more waiting on hold! Use the <strong>Integrated Messaging</strong> section to send secure, encrypted messages to your care team. Get updates on your treatments or ask health queries with confidence.</p>
              </div>
            </div>

            <!-- AI Assistant -->
            <div style="background: #fdf4ff; border: 1px solid #fae8ff; border-radius: 16px; padding: 20px; margin-bottom: 15px; display: flex; align-items: flex-start;">
              <div style="font-size: 24px; margin-right: 15px;">🤖</div>
              <div>
                <h3 style="margin: 0 0 5px; font-size: 16px; color: #86198f;">Dr. I-CAMS: AI Assistant</h3>
                <p style="margin: 0; font-size: 13px; color: #a21caf; line-height: 1.5;">Meet your 24/7 AI health companion. Use the floating chat assistant for instant first-aid guidance, medicine reminders, and answers to common medical questions tailored to your history.</p>
              </div>
            </div>

            <!-- Lab Results -->
            <div style="background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 16px; padding: 20px; margin-bottom: 15px; display: flex; align-items: flex-start;">
              <div style="font-size: 24px; margin-right: 15px;">🧪</div>
              <div>
                <h3 style="margin: 0 0 5px; font-size: 16px; color: #1e293b;">Digital Diagnostics & Reports</h3>
                <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5;">View and download your <strong>Lab Reports</strong> and <strong>Clinical Orders</strong> the moment they are released by the hospital. Keep a portable digital history of your medical journey.</p>
              </div>
            </div>

            <!-- Logs -->
            <div style="background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 16px; padding: 20px; margin-bottom: 15px; display: flex; align-items: flex-start;">
              <div style="font-size: 24px; margin-right: 15px;">📝</div>
              <div>
                <h3 style="margin: 0 0 5px; font-size: 16px; color: #1e293b;">Proactive Health Logging</h3>
                <p style="margin: 0; font-size: 13px; color: #64748b; line-height: 1.5;">Use the "Log Health Vitals" button to store your daily well-being. These records are instantly visible to your care team, enabling them to provide faster, more accurate medical interventions.</p>
              </div>
            </div>

          </div>

          <!-- Closing -->
          <p style="font-size: 14px; color: #64748b; line-height: 1.6; border-top: 1px solid #f1f5f9; padding-top: 25px;">
            We are committed to providing you with the highest level of care through technology. Your dashboard is more than just a page—it's your dedicated health command center.
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #f1f5f9; padding: 35px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; color: #94a3b8; font-size: 12px; line-height: 1.6;">
            © 2026 I-CAMS Sri Lanka. All rights reserved.<br>
            Sri Lanka's First Integrated Clinical & Administrative Management System.
          </p>
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

/**
 * Send Professional Rejection Email (Doctors/Nurses)
 */
exports.sendProfessionalRejectionEmail = async (email, name, role, reason) => {
  const mailOptions = {
    from: `"I-CAMS Admissions" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Update regarding your I-CAMS ${role} registration`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.05);">
        <div style="background: #f8fafc; padding: 40px; text-align: center; border-bottom: 2px solid #f1f5f9;">
          <div style="display: inline-block; background: #e2e8f0; border-radius: 12px; padding: 10px 20px; margin-bottom: 20px;">
             <span style="color: #1e3a8a; font-size: 24px; font-weight: 800; letter-spacing: -1px;">I-CAMS</span>
          </div>
          <h1 style="margin: 0; color: #1e293b; font-size: 22px; font-weight: 700;">Registration Status Update</h1>
        </div>

        <div style="padding: 40px; background: #ffffff;">
          <p style="font-size: 16px; color: #475569; margin-top: 0;">Dear ${name},</p>
          <p style="font-size: 15px; color: #475569; line-height: 1.6;">
            Thank you for your interest in joining the I-CAMS clinical network as a <strong>${role}</strong>. 
            Our administrative team has completed the formal review of your application and supporting documentation.
          </p>

          <p style="font-size: 15px; color: #475569; line-height: 1.6;">
            At this time, we are unable to approve your registration for the following reason(s):
          </p>

          <div style="background: #fff1f2; border: 1px solid #ffe4e6; border-radius: 12px; padding: 20px; margin: 25px 0;">
            <p style="margin: 0; color: #be123c; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Reason for Rejection:</p>
            <p style="margin: 0; color: #9f1239; font-size: 15px; line-height: 1.6; font-style: italic;">"${reason}"</p>
          </div>

          <p style="font-size: 15px; color: #475569; line-height: 1.6; margin-bottom: 30px;">
            We appreciate the time you took to apply. If you believe this decision was made in error or if you have updated information to provide, you are welcome to submit a new registration with the necessary corrections.
          </p>

          <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #f1f5f9; text-align: center;">
            <p style="margin: 0; color: #94a3b8; font-size: 13px;">Best regards,<br><strong>I-CAMS Administration Team</strong></p>
          </div>
        </div>

        <div style="background: #f8fafc; padding: 25px; text-align: center; color: #94a3b8; font-size: 12px;">
          © 2026 I-CAMS Clinical Operations. All rights reserved.
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

/**
 * Send Invoice Email to Patient after successful PayHere payment
 */
exports.sendInvoiceEmail = async (email, patientName, invoiceData) => {
  const {
    invoiceNumber, doctorName, hospitalName, appointmentDate,
    appointmentTime, reason, doctorFee, hospitalFee, icamsFee,
    totalAmount, paidAt, paymentId
  } = invoiceData;

  const formatCurrency = (amount) =>
    `LKR ${parseFloat(amount || 0).toLocaleString('en-LK', { minimumFractionDigits: 2 })}`;

  const formatDate = (d) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatTime = (t) => {
    if (!t) return 'N/A';
    if (t.includes('T')) return new Date(t).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const [h, m] = t.split(':').map(Number);
    const d = new Date();
    d.setHours(h, m);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const mailOptions = {
    from: `"I-CAMS Billing" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `✅ Payment Confirmed — Invoice ${invoiceNumber} | I-CAMS`,
    html: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
<div style="max-width:650px;margin:40px auto;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 20px 50px rgba(0,0,0,0.1);border:1px solid #e2e8f0;">

  <!-- Header Section -->
  <div style="background:linear-gradient(135deg,#1e3a8a 0%,#2563eb 60%,#3b82f6 100%);padding:50px 40px;text-align:center;">
    <div style="display:inline-block;background:rgba(255,255,255,0.2);border-radius:16px;padding:12px 24px;margin-bottom:20px;backdrop-filter:blur(10px);">
       <span style="color:white;font-size:28px;font-weight:900;letter-spacing:-1px;">I-CAMS</span>
    </div>
    <table align="center" border="0" cellpadding="0" cellspacing="0" style="margin:0 auto 20px;">
      <tr>
        <td align="center" style="background:rgba(255,255,255,0.25);border-radius:50%;width:70px;height:70px;vertical-align:middle;">
          <span style="font-size:36px;line-height:70px;">✅</span>
        </td>
      </tr>
    </table>
    <h1 style="margin:0;color:white;font-size:26px;font-weight:800;letter-spacing:-0.5px;">Payment Confirmed</h1>
    <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:15px;font-weight:500;">Your consultation booking is now officially secured.</p>
    <div style="margin-top:25px;background:#10b981;border-radius:12px;padding:10px 24px;display:inline-block;border:1px solid rgba(255,255,255,0.2);box-shadow:0 4px 15px rgba(16,185,129,0.3);">
      <span style="color:white;font-size:13px;font-weight:900;letter-spacing:0.05em;">PAID &middot; INVOICE ${invoiceNumber}</span>
    </div>
  </div>

  <!-- Content Section -->
  <div style="padding:40px;">
    <p style="font-size:17px;color:#1e293b;margin-top:0;">Dear <strong>${patientName}</strong>,</p>
    <p style="font-size:15px;color:#475569;line-height:1.7;">
      Success! Your payment has been processed and your appointment is now confirmed. 
      Below are your official booking details and financial receipt.
    </p>

    <!-- Appointment Card -->
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:24px;padding:30px;margin:30px 0;position:relative;">
      <div style="position:absolute;top:20px;right:25px;color:#cbd5e1;font-size:11px;font-weight:900;text-transform:uppercase;">Booking Confirmed</div>
      <p style="margin:0 0 20px;font-size:11px;color:#64748b;font-weight:900;text-transform:uppercase;letter-spacing:0.1em;">📅 Appointment Summary</p>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:0 0 20px;width:50%;vertical-align:top;">
            <p style="margin:0;font-size:12px;color:#94a3b8;font-weight:700;text-transform:uppercase;">Physician</p>
            <p style="margin:4px 0 0;font-size:16px;font-weight:800;color:#1e293b;">Dr. ${doctorName}</p>
          </td>
          <td style="padding:0 0 20px;text-align:right;vertical-align:top;">
            <p style="margin:0;font-size:12px;color:#94a3b8;font-weight:700;text-transform:uppercase;">Healthcare Facility</p>
            <p style="margin:4px 0 0;font-size:16px;font-weight:800;color:#1e293b;">${hospitalName}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:0;width:50%;vertical-align:top;">
            <p style="margin:0;font-size:12px;color:#94a3b8;font-weight:700;text-transform:uppercase;">Date</p>
            <p style="margin:4px 0 0;font-size:16px;font-weight:800;color:#1e293b;">${formatDate(appointmentDate)}</p>
          </td>
          <td style="padding:0;text-align:right;vertical-align:top;">
            <p style="margin:0;font-size:12px;color:#94a3b8;font-weight:700;text-transform:uppercase;">Time</p>
            <p style="margin:4px 0 0;font-size:16px;font-weight:800;color:#1e293b;">${formatTime(appointmentTime)}</p>
          </td>
        </tr>
      </table>
    </div>

    <!-- Financial Breakdown -->
    <div style="background:#ffffff;border:1px solid #e2e8f0;border-radius:24px;overflow:hidden;margin-bottom:35px;box-shadow:0 10px 30px rgba(0,0,0,0.02);">
      <div style="background:#0f172a;padding:18px 30px;">
        <span style="color:white;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:0.15em;">💳 Financial breakdown</span>
      </div>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:20px 30px;font-size:14px;color:#475569;border-bottom:1px solid #f1f5f9;">Doctor Consultation Fee</td>
          <td style="padding:20px 30px;text-align:right;font-weight:700;color:#1e293b;font-size:14px;border-bottom:1px solid #f1f5f9;">${formatCurrency(doctorFee)}</td>
        </tr>
        <tr>
          <td style="padding:20px 30px;font-size:14px;color:#475569;border-bottom:1px solid #f1f5f9;">Hospital Facility Charge</td>
          <td style="padding:20px 30px;text-align:right;font-weight:700;color:#1e293b;font-size:14px;border-bottom:1px solid #f1f5f9;">${formatCurrency(hospitalFee)}</td>
        </tr>
        <tr>
          <td style="padding:20px 30px;font-size:14px;color:#475569;border-bottom:1px solid #f1f5f9;">I-CAMS Service Fee</td>
          <td style="padding:20px 30px;text-align:right;font-weight:700;color:#1e293b;font-size:14px;border-bottom:1px solid #f1f5f9;">${formatCurrency(icamsFee)}</td>
        </tr>
        <tr style="background:#f0f9ff;">
          <td style="padding:25px 30px;font-size:16px;font-weight:900;color:#1e3a8a;">Total Amount Paid</td>
          <td style="padding:25px 30px;text-align:right;font-size:24px;font-weight:900;color:#1e3a8a;">${formatCurrency(totalAmount)}</td>
        </tr>
      </table>
    </div>

    <!-- Transaction Bar -->
    <div style="border-top:2px solid #f1f5f9;border-bottom:2px solid #f1f5f9;padding:20px 0;margin-bottom:35px;display:flex;justify-content:space-between;">
      <div style="width:50%;">
        <p style="margin:0;font-size:10px;color:#94a3b8;font-weight:800;text-transform:uppercase;letter-spacing:0.05em;">Transaction Reference</p>
        <p style="margin:4px 0 0;font-size:12px;font-weight:700;color:#475569;font-family:monospace;">${paymentId || 'I-CAMS-PX-'+invoiceNumber}</p>
      </div>
      <div style="width:50%;text-align:right;">
        <p style="margin:0;font-size:10px;color:#94a3b8;font-weight:800;text-transform:uppercase;letter-spacing:0.05em;">Settlement Date</p>
        <p style="margin:4px 0 0;font-size:12px;font-weight:700;color:#475569;">${formatDate(paidAt || new Date())}</p>
      </div>
    </div>

    <!-- Instructions & Preparation -->
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:24px;padding:30px;margin-bottom:35px;">
      <h3 style="margin:0 0 15px;font-size:15px;color:#166534;font-weight:800;">🏥 Preparing for your visit</h3>
      <ul style="margin:0;padding-left:20px;color:#14532d;font-size:14px;line-height:1.9;">
        <li>Please arrive at <strong>${hospitalName}</strong> at least <strong>15 minutes</strong> early.</li>
        <li>Present a <strong>digital copy</strong> of this invoice at the reception.</li>
        <li>Bring any relevant medical history or previous prescriptions.</li>
        <li>Follow any specific preparation instructions given by the doctor.</li>
      </ul>
    </div>

    <!-- Dashboard CTA -->
    <div style="text-align:center;margin:40px 0;">
      <a href="${process.env.FRONTEND_URL || 'https://icams.pandanlabs.net'}/login" style="
        display:inline-block;
        background:linear-gradient(135deg,#2563eb,#3b82f6);
        color:#ffffff;
        text-decoration:none;
        font-size:16px;
        font-weight:800;
        padding:18px 45px;
        border-radius:14px;
        box-shadow:0 8px 25px rgba(37,99,235,0.3);
      ">🖥️ Open My Patient Dashboard</a>
    </div>

    <p style="font-size:15px;color:#1e293b;margin-top:45px;">Wishing you a speedy recovery,<br>
      <strong style="color:#2563eb;">I-CAMS Billing & Care Team</strong><br>
      <span style="font-size:12px;color:#94a3b8;">Sri Lanka's Premier Digital Healthcare Network</span>
    </p>
  </div>

  <!-- Footer Section -->
  <div style="background:#f8fafc;padding:30px 40px;text-align:center;border-top:1px solid #e2e8f0;">
    <p style="margin:0;color:#94a3b8;font-size:11px;line-height:1.8;">
      &copy; 2026 I-CAMS Sri Lanka · Integrated Care & Monitoring System<br>
      Colombo, Sri Lanka · Support: infoicams123@gmail.com<br>
      <span style="color:#cbd5e1;">This is an automated clinical notification. Please do not reply directly.</span>
    </p>
  </div>

</div>
</body>
</html>`
  };

  return transporter.sendMail(mailOptions);
};
