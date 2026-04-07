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
 * Notify Patient of Appointment Approval
 */
exports.sendAppointmentApproval = async (email, patientName, doctorName, date, time, hospitalName) => {
  const mailOptions = {
    from: `"I-CAMS Appointments" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `CONFIRMED: Your Appointment with Dr. ${doctorName}`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden;">
        <div style="background-color: #2563eb; color: white; padding: 30px; text-align: center;">
          <h2 style="margin: 0; font-weight: 800;">Appointment Confirmed</h2>
          <p style="margin: 5px 0 0; opacity: 0.9;">Your healthcare visit has been approved</p>
        </div>
        <div style="padding: 30px; background-color: #ffffff;">
          <p>Dear <strong>${patientName}</strong>,</p>
          <p>This is to inform you that your appointment request has been reviewed and officially confirmed by your doctor.</p>
          <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; margin: 25px 0; border: 1px solid #e2e8f0;">
            <table style="width: 100%;">
              <tr>
                <td style="padding: 5px 0; color: #64748b; font-size: 13px;">Consultant</td>
                <td style="padding: 5px 0; text-align: right; font-weight: bold;">Dr. ${doctorName}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: #64748b; font-size: 13px;">Facility</td>
                <td style="padding: 5px 0; text-align: right; font-weight: bold;">${hospitalName}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: #64748b; font-size: 13px;">Date</td>
                <td style="padding: 5px 0; text-align: right; font-weight: bold;">${date}</td>
              </tr>
              <tr>
                <td style="padding: 5px 0; color: #64748b; font-size: 13px;">Time</td>
                <td style="padding: 5px 0; text-align: right; font-weight: bold;">${time}</td>
              </tr>
            </table>
          </div>
          <p style="font-size: 14px; color: #475569; text-align: center; margin-top: 30px;">Please arrive at <strong>${hospitalName}</strong> 15 minutes prior to your scheduled time.</p>
          <div style="margin-top: 40px; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 20px;">
            <p style="margin: 0; color: #94a3b8; font-size: 11px;">© 2026 I-CAMS. Professional Clinical Management.</p>
          </div>
        </div>
      </div>
    `
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
  const verifyUrl = `http://localhost:5173/verify-email?token=${verificationToken}`;

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
