const fs = require('fs');
const path = require('path');

const ALL_FEATURES = [
  { tab: 'Patient', name: 'Health Vitals Dashboard', desc: 'Log blood pressure, heart rate, SpO2, temperature, and weight from anywhere. View trends over time and get flagged when values go out of range.', tags: ['Daily Logging', 'Trend Charts', 'Alerts'] },
  { tab: 'Patient', name: 'Hospital Appointment Booking', desc: 'Browse 6+ Sri Lankan hospitals, filter by city, specialization, or type (Government/Private), choose a doctor, and book a time slot — all from the app.', tags: ['6+ Hospitals', 'Doctor Selection', '4-Step Booking'] },
  { tab: 'Patient', name: 'Live Lab Test Tracker', desc: 'See every stage of your lab test in real time: Ordered → Sample Scheduled → Collected → Processing → Results Ready → Reviewed. Never wonder "where are my results?" again.', tags: ['Step-by-step', 'Timestamps', 'Real-time'] },
  { tab: 'Patient', name: 'Lab Result Viewer', desc: 'View detailed lab results with each value flagged as High 🔴, Low 🔵, or Normal ✅ against reference ranges. Doctor\'s review notes are displayed inline.', tags: ['Flagged Values', 'Reference Ranges', "Doctor\'s Notes"] },
  { tab: 'Patient', name: 'Care Orders Panel', desc: 'See all active orders from your doctor — medications, scans, lab tests, and referrals — clearly listed on your dashboard so you always know what to do next.', tags: ['Medications', 'Lab Orders', 'Referrals'] },
  { tab: 'Patient', name: 'Secure Patient Messaging', desc: 'Communicate directly with your assigned doctor or nurse through the built-in secure messaging system. No external apps needed.', tags: ['Real-time Chat', 'Secure', 'Multi-role'] },
  { tab: 'Nurse', name: 'Patient Care Dashboard', desc: 'Select any assigned patient and instantly see their current status, active orders, flagged observations, and care notes — all in one clean interface.', tags: ['Patient Selection', 'Status View', 'Priority Alerts'] },
  { tab: 'Nurse', name: 'Symptom Logging Form', desc: 'Log full vital signs (BP, HR, SpO2, temperature, resp. rate, weight), a pain level slider (0–10), mood picker, symptom chip selector, and free-text notes — all in one form.', tags: ['Full Vitals', 'Pain Score', 'Symptom Chips'] },
  { tab: 'Nurse', name: 'Flag Urgent to Doctor', desc: 'Mark any symptom log as urgent and it immediately appears as a flagged alert at the top of the doctor\'s patient workspace — ensuring critical concerns are never missed.', tags: ['One-tap Flag', 'Doctor Alert', 'Priority'] },
  { tab: 'Nurse', name: 'View Doctor Orders', desc: 'See all active clinical orders from the doctor — including medications to administer, lab tests scheduled, and any specific care instructions. Updated in real time.', tags: ['Live Orders', 'Lab Statuses', 'Instructions'] },
  { tab: 'Nurse', name: 'Care Note Thread', desc: 'Read clinical notes and requests left by the doctor and reply directly in a threaded format — creating a complete record of nurse-doctor communication per patient.', tags: ['Threaded Replies', 'Per-patient', 'Clinical Record'] },
  { tab: 'Doctor', name: '5-Tab Patient Workspace', desc: 'A comprehensive workspace for each patient: Overview, Nurse Logs, Lab Tests, Orders, and Clinical Notes — everything you need without switching systems.', tags: ['5 Tabs', 'Full History', 'Quick Access'] },
  { tab: 'Doctor', name: 'Nurse Alert Viewer', desc: 'Flagged nurse observations appear prominently at the top of the patient overview with vitals, timestamp, and a text field to reply directly — closing the care loop instantly.', tags: ['Instant Alerts', 'In-line Reply', 'Vitals Context'] },
  { tab: 'Doctor', name: 'Quick Order Placement', desc: 'Order lab tests, scans, medications, referrals, or physiotherapy sessions with a single click. Orders are immediately visible to the patient and the hospital.', tags: ['Lab/Scan/Meds', '1-Click Order', 'Multi-type'] },
  { tab: 'Doctor', name: 'Lab Result Review', desc: 'View all ordered lab tests with their progress. When results are uploaded by the hospital, you can review values and save a note that the patient will also see.', tags: ['Inline Review', 'Save Notes', 'Patient Visible'] },
  { tab: 'Doctor', name: 'Clinical Notes System', desc: 'Write structured clinical notes with assessment, plan, and requests to the nurse. Nurse replies are shown in a thread — creating a complete audit trail of care decisions.', tags: ['Structured Notes', 'Nurse Thread', 'Audit Trail'] },
  { tab: 'Hospital Admin', name: 'Hospital Dashboard', desc: 'See all of today\'s appointments, pending lab tests, results ready, and active doctors — at a glance. Priority badges (STAT/Urgent/Routine) highlight critical cases.', tags: ["Today's View", 'Priority Badges', 'Stats Overview'] },
  { tab: 'Hospital Admin', name: 'Lab Queue Management', desc: 'Advance any test through the pipeline one step at a time: Ordered → Sample Scheduled → Sample Collected → Processing → Results Ready. Add optional notes at each step.', tags: ['Step-by-step', 'Add Notes', 'Pipeline View'] },
  { tab: 'Hospital Admin', name: 'Result Upload System', desc: 'Upload a result summary with a single click. The moment you upload, the patient\'s dashboard shows a green "Lab Results Ready!" notification — no delay, no manual notification.', tags: ['Instant Notify', 'Patient Visible', '1-Click Upload'] },
  { tab: 'Hospital Admin', name: 'Appointment Management', desc: 'View the full daily appointment schedule, sorted by time. See the patient name, assigned doctor and specialization, and confirmation status for each slot.', tags: ['Daily Schedule', 'Doctor View', 'Confirmed Status'] },
  { tab: 'Hospital Admin', name: 'Doctor Roster', desc: 'Manage your hospital\'s doctor directory — including specializations, consultation fees, availability, and language preferences — to help patients make informed booking choices.', tags: ['Directory', 'Specializations', 'Fees & Availability'] },
  { tab: 'All Features', name: 'Multi-language Support', desc: 'I-CAMS fully supports English, Sinhala, and Tamil — ensuring every Sri Lankan patient can use it in their native language.', tags: ['English', 'Sinhala', 'Tamil'] },
  { tab: 'All Features', name: 'Dark / Light Mode', desc: 'A carefully crafted dark mode (default) and light mode ensure comfortable viewing in any environment — from bright clinics to dim home settings.', tags: ['Dark Mode', 'Light Mode', 'Auto Toggle'] },
  { tab: 'All Features', name: 'Mobile Responsive', desc: 'Every page is fully optimized for mobile. Nurses can log symptoms during ward rounds, and patients can check results from their phones.', tags: ['Mobile First', 'Tablet Ready', 'All Devices'] },
  { tab: 'All Features', name: 'Role-based Access', desc: 'Each of the 4 roles (Patient, Nurse, Doctor, Hospital) has a completely separate login, separate dashboard, and separate data access — ensuring privacy and clarity.', tags: ['4 Roles', 'Separate Logins', 'Data Privacy'] }
];

const locales = ['en', 'si', 'ta'];
const targetPaths = locales.map(l => path.join(__dirname, 'frontend/src/locales', l, 'common.json'));

targetPaths.forEach(p => {
    if (!fs.existsSync(p)) return;
    try {
        const data = JSON.parse(fs.readFileSync(p, 'utf8'));
        data.features_list = {};
        
        ALL_FEATURES.forEach((feat, i) => {
            const key = `feature_${i}`;
            data.features_list[`${key}_name`] = feat.name;
            data.features_list[`${key}_desc`] = feat.desc;
            data.features_list[`${key}_tags`] = feat.tags.join('||');
        });
        
        fs.writeFileSync(p, JSON.stringify(data, null, 2) + '\n');
        console.log(`Updated ${p}`);
    } catch (err) {
        console.error(`Error updating ${p}:`, err);
    }
});
