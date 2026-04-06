const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'frontend', 'src', 'locales');

const homeTranslations = {
  landing: {
    workflow: {
      badge: "Live Tracking",
      badgeDesc: "Lab results visible in real time",
      heading: "From Doctor's Order to Lab Result — All in One App",
      subHeading: "New — Hospital Integration",
      desc: "I-CAMS now connects you directly to hospitals in Sri Lanka. Book doctor appointments, track your lab tests step-by-step, and receive results on your dashboard the moment the hospital uploads them.",
      point0: "Browse & book appointments at 6+ Sri Lankan hospitals",
      point1: "Doctor places lab or scan orders directly from the platform",
      point2: "Hospital lab updates progress: Ordered → Collected → Processing → Results ready",
      point3: "Patient sees the result the instant it's uploaded — with flagged values highlighted",
      point4: "Nurse logs daily symptoms; doctor reviews and responds in-app",
      findHospital: "Find a Hospital"
    },
    portals: {
      heading: "One Platform. Four Powerful Portals.",
      desc: "Every role gets a dedicated, intelligent workspace — designed specifically for how they interact with healthcare."
    },
    portal_cards: {
      patient_title: 'Patient Portal',
      patient_f0: 'Health vitals & trend dashboard',
      patient_f1: 'Book hospital appointments',
      patient_f2: 'Track lab tests in real time',
      patient_f3: 'View results with flagged values',
      patient_f4: 'Medications & care plan',
      patient_f5: 'Secure chat with care team',
      nurse_title: 'Nurse Dashboard',
      nurse_f0: 'Log vitals, symptoms & pain level',
      nurse_f1: 'Symptom chip selection + mood tracker',
      nurse_f2: 'Flag urgent concerns to doctor',
      nurse_f3: 'View & action doctor\'s orders',
      nurse_f4: 'Reply to care notes in-thread',
      nurse_f5: 'Patient status at a glance',
      doctor_title: 'Doctor Workspace',
      doctor_f0: 'Full patient 5-tab workspace',
      doctor_f1: 'See nurse-flagged alerts instantly',
      doctor_f2: 'Order labs, scans & medications',
      doctor_f3: 'Review lab results & add notes',
      doctor_f4: 'Write & view clinical notes',
      doctor_f5: 'Direct reply to nurse observations',
      admin_title: 'Hospital Admin',
      admin_f0: 'View today\'s appointment queue',
      admin_f1: 'Manage lab test pipeline',
      admin_f2: 'Advance test status step-by-step',
      admin_f3: 'Upload result summaries',
      admin_f4: 'Auto-notifies patient when ready',
      admin_f5: 'Doctor roster management',
      getStarted: 'Get Started'
    },
    community: {
      badge: "Community & Home Care",
      heading: "Extending Quality Care Beyond the Hospital Walls",
      desc: "I-CAMS bridges the gap between hospital-based clinical teams and community care workers. Home-based nurses can submit assessments, log daily observations, and flag urgent needs — keeping the entire care team in sync while the patient recovers at home.",
      f1Title: "Digital Care Logs",
      f1Desc: "Replace paper-based records with secure digital logs",
      f2Title: "Smart Alerts",
      f2Desc: "Instant notifications when a patient's status changes",
      f3Title: "Team Coordination",
      f3Desc: "Nurses, doctors & carers on one platform",
      f4Title: "Progress Tracking",
      f4Desc: "Chart recovery milestones and follow-up targets",
      link: "Learn about I-CAMS",
      imageBadgeTop: "Patient-Centred",
      imageBadgeBottom: "Care delivered anywhere"
    },
    innovation: {
      badge: "Why We're Different",
      heading: "Built for Sri Lanka. Built for the Future.",
      desc: "No other system in Sri Lanka connects patients, nurses, doctors, and hospitals in a single real-time workflow.",
      i1Title: "Sri Lanka–First",
      i1Desc: "Designed specifically for the Sri Lankan healthcare landscape — government and private hospitals, local specializations, multilingual support (English, Sinhala, Tamil).",
      i2Title: "End-to-End Connected",
      i2Desc: "From booking a hospital appointment to receiving lab results on your phone — the entire care journey is digitized and visible to every authorized role in real time.",
      i3Title: "Clinical-Grade Security",
      i3Desc: "Patient data is protected with clinical-grade security standards. Role-based access ensures that only authorized personnel see sensitive information.",
      i4Title: "In-App Care Communication",
      i4Desc: "Nurses flag concerns to doctors. Doctors reply with instructions. Patients receive updates. All within the app — no external messaging tools needed.",
      i5Title: "Live Lab Test Tracker",
      i5Desc: "Patients can track every step of their lab test — from being ordered, sample collected, processing, to results ready — with timestamps at every stage.",
      i6Title: "Mobile-First Design",
      i6Desc: "Fully responsive and optimized for mobile. Elderly patients can log vitals from home, and nurses can submit assessments during ward rounds on any device."
    },
    cta: {
      heading: "Ready to Experience Smarter Healthcare?",
      desc: "Join patients, nurses, doctors, and hospital admins across Sri Lanka already benefiting from I-CAMS — the connected care platform.",
      button: "Get Started — It's Free",
      link: "See All Features →"
    },
    footer: {
      quote: "\"Bridging the clinical gap through technology, one log at a time.\"",
      brand: "I-CAMS Sri Lanka • Integrated Care & Monitoring System"
    }
  }
};

const languages = ['en', 'si', 'ta'];

languages.forEach(lang => {
  const jsonPath = path.join(localesDir, lang, 'common.json');
  if (fs.existsSync(jsonPath)) {
    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    
    // Assign translations
    data.landing = homeTranslations.landing;
    
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
    console.log(`Updated ${jsonPath}`);
  }
});
