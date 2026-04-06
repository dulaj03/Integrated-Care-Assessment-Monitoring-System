import { Link } from 'react-router';
import {
  ArrowLeft, Activity, Building2, FlaskConical, Pill, MessageSquare, BellRing,
  Stethoscope, Heart, Clipboard, ShieldCheck, Smartphone, Clock, Globe,
  ArrowRight, Zap, FileText, Users,
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

const TABS = ['All Features', 'Patient', 'Nurse', 'Doctor', 'Hospital Admin'] as const;
type Tab = typeof TABS[number];

const ALL_FEATURES = [
  // Patient
  {
    tab: 'Patient',
    name: 'Health Vitals Dashboard',
    icon: Activity,
    color: 'blue',
    desc: 'Log blood pressure, heart rate, SpO2, temperature, and weight from anywhere. View trends over time and get flagged when values go out of range.',
    tags: ['Daily Logging', 'Trend Charts', 'Alerts'],
  },
  {
    tab: 'Patient',
    name: 'Hospital Appointment Booking',
    icon: Building2,
    color: 'blue',
    desc: 'Browse 6+ Sri Lankan hospitals, filter by city, specialization, or type (Government/Private), choose a doctor, and book a time slot — all from the app.',
    tags: ['6+ Hospitals', 'Doctor Selection', '4-Step Booking'],
  },
  {
    tab: 'Patient',
    name: 'Live Lab Test Tracker',
    icon: FlaskConical,
    color: 'blue',
    desc: 'See every stage of your lab test in real time: Ordered → Sample Scheduled → Collected → Processing → Results Ready → Reviewed. Never wonder "where are my results?" again.',
    tags: ['Step-by-step', 'Timestamps', 'Real-time'],
  },
  {
    tab: 'Patient',
    name: 'Lab Result Viewer',
    icon: FileText,
    color: 'blue',
    desc: 'View detailed lab results with each value flagged as High 🔴, Low 🔵, or Normal ✅ against reference ranges. Doctor\'s review notes are displayed inline.',
    tags: ['Flagged Values', 'Reference Ranges', "Doctor's Notes"],
  },
  {
    tab: 'Patient',
    name: 'Care Orders Panel',
    icon: Pill,
    color: 'blue',
    desc: 'See all active orders from your doctor — medications, scans, lab tests, and referrals — clearly listed on your dashboard so you always know what to do next.',
    tags: ['Medications', 'Lab Orders', 'Referrals'],
  },
  {
    tab: 'Patient',
    name: 'Secure Patient Messaging',
    icon: MessageSquare,
    color: 'blue',
    desc: 'Communicate directly with your assigned doctor or nurse through the built-in secure messaging system. No external apps needed.',
    tags: ['Real-time Chat', 'Secure', 'Multi-role'],
  },
  // Nurse
  {
    tab: 'Nurse',
    name: 'Patient Care Dashboard',
    icon: Clipboard,
    color: 'green',
    desc: 'Select any assigned patient and instantly see their current status, active orders, flagged observations, and care notes — all in one clean interface.',
    tags: ['Patient Selection', 'Status View', 'Priority Alerts'],
  },
  {
    tab: 'Nurse',
    name: 'Symptom Logging Form',
    icon: Activity,
    color: 'green',
    desc: 'Log full vital signs (BP, HR, SpO2, temperature, resp. rate, weight), a pain level slider (0–10), mood picker, symptom chip selector, and free-text notes — all in one form.',
    tags: ['Full Vitals', 'Pain Score', 'Symptom Chips'],
  },
  {
    tab: 'Nurse',
    name: 'Flag Urgent to Doctor',
    icon: BellRing,
    color: 'green',
    desc: 'Mark any symptom log as urgent and it immediately appears as a flagged alert at the top of the doctor\'s patient workspace — ensuring critical concerns are never missed.',
    tags: ['One-tap Flag', 'Doctor Alert', 'Priority'],
  },
  {
    tab: 'Nurse',
    name: 'View Doctor Orders',
    icon: FileText,
    color: 'green',
    desc: 'See all active clinical orders from the doctor — including medications to administer, lab tests scheduled, and any specific care instructions. Updated in real time.',
    tags: ['Live Orders', 'Lab Statuses', 'Instructions'],
  },
  {
    tab: 'Nurse',
    name: 'Care Note Thread',
    icon: MessageSquare,
    color: 'green',
    desc: 'Read clinical notes and requests left by the doctor and reply directly in a threaded format — creating a complete record of nurse-doctor communication per patient.',
    tags: ['Threaded Replies', 'Per-patient', 'Clinical Record'],
  },
  // Doctor
  {
    tab: 'Doctor',
    name: '5-Tab Patient Workspace',
    icon: Stethoscope,
    color: 'purple',
    desc: 'A comprehensive workspace for each patient: Overview, Nurse Logs, Lab Tests, Orders, and Clinical Notes — everything you need without switching systems.',
    tags: ['5 Tabs', 'Full History', 'Quick Access'],
  },
  {
    tab: 'Doctor',
    name: 'Nurse Alert Viewer',
    icon: BellRing,
    color: 'purple',
    desc: 'Flagged nurse observations appear prominently at the top of the patient overview with vitals, timestamp, and a text field to reply directly — closing the care loop instantly.',
    tags: ['Instant Alerts', 'In-line Reply', 'Vitals Context'],
  },
  {
    tab: 'Doctor',
    name: 'Quick Order Placement',
    icon: Pill,
    color: 'purple',
    desc: 'Order lab tests, scans, medications, referrals, or physiotherapy sessions with a single click. Orders are immediately visible to the patient and the hospital.',
    tags: ['Lab/Scan/Meds', '1-Click Order', 'Multi-type'],
  },
  {
    tab: 'Doctor',
    name: 'Lab Result Review',
    icon: FlaskConical,
    color: 'purple',
    desc: 'View all ordered lab tests with their progress. When results are uploaded by the hospital, you can review values and save a note that the patient will also see.',
    tags: ['Inline Review', 'Save Notes', 'Patient Visible'],
  },
  {
    tab: 'Doctor',
    name: 'Clinical Notes System',
    icon: FileText,
    color: 'purple',
    desc: 'Write structured clinical notes with assessment, plan, and requests to the nurse. Nurse replies are shown in a thread — creating a complete audit trail of care decisions.',
    tags: ['Structured Notes', 'Nurse Thread', 'Audit Trail'],
  },
  // Hospital
  {
    tab: 'Hospital Admin',
    name: 'Hospital Dashboard',
    icon: Building2,
    color: 'orange',
    desc: 'See all of today\'s appointments, pending lab tests, results ready, and active doctors — at a glance. Priority badges (STAT/Urgent/Routine) highlight critical cases.',
    tags: ["Today's View", 'Priority Badges', 'Stats Overview'],
  },
  {
    tab: 'Hospital Admin',
    name: 'Lab Queue Management',
    icon: FlaskConical,
    color: 'orange',
    desc: 'Advance any test through the pipeline one step at a time: Ordered → Sample Scheduled → Sample Collected → Processing → Results Ready. Add optional notes at each step.',
    tags: ['Step-by-step', 'Add Notes', 'Pipeline View'],
  },
  {
    tab: 'Hospital Admin',
    name: 'Result Upload System',
    icon: FileText,
    color: 'orange',
    desc: 'Upload a result summary with a single click. The moment you upload, the patient\'s dashboard shows a green "Lab Results Ready!" notification — no delay, no manual notification.',
    tags: ['Instant Notify', 'Patient Visible', '1-Click Upload'],
  },
  {
    tab: 'Hospital Admin',
    name: 'Appointment Management',
    icon: Clock,
    color: 'orange',
    desc: 'View the full daily appointment schedule, sorted by time. See the patient name, assigned doctor and specialization, and confirmation status for each slot.',
    tags: ['Daily Schedule', 'Doctor View', 'Confirmed Status'],
  },
  {
    tab: 'Hospital Admin',
    name: 'Doctor Roster',
    icon: Users,
    color: 'orange',
    desc: 'Manage your hospital\'s doctor directory — including specializations, consultation fees, availability, and language preferences — to help patients make informed booking choices.',
    tags: ['Directory', 'Specializations', 'Fees & Availability'],
  },
  // General
  {
    tab: 'All Features',
    name: 'Multi-language Support',
    icon: Globe,
    color: 'teal',
    desc: 'I-CAMS fully supports English, Sinhala, and Tamil — ensuring every Sri Lankan patient can use it in their native language.',
    tags: ['English', 'Sinhala', 'Tamil'],
  },
  {
    tab: 'All Features',
    name: 'Dark / Light Mode',
    icon: Smartphone,
    color: 'slate',
    desc: 'A carefully crafted dark mode (default) and light mode ensure comfortable viewing in any environment — from bright clinics to dim home settings.',
    tags: ['Dark Mode', 'Light Mode', 'Auto Toggle'],
  },
  {
    tab: 'All Features',
    name: 'Mobile Responsive',
    icon: Smartphone,
    color: 'slate',
    desc: 'Every page is fully optimized for mobile. Nurses can log symptoms during ward rounds, and patients can check results from their phones.',
    tags: ['Mobile First', 'Tablet Ready', 'All Devices'],
  },
  {
    tab: 'All Features',
    name: 'Role-based Access',
    icon: ShieldCheck,
    color: 'slate',
    desc: 'Each of the 4 roles (Patient, Nurse, Doctor, Hospital) has a completely separate login, separate dashboard, and separate data access — ensuring privacy and clarity.',
    tags: ['4 Roles', 'Separate Logins', 'Data Privacy'],
  },
];

const ROLE_COLORS: Record<Tab, string> = {
  'All Features': 'blue',
  'Patient': 'blue',
  'Nurse': 'green',
  'Doctor': 'purple',
  'Hospital Admin': 'orange',
};

const ROLE_ICONS: Record<Tab, React.ElementType> = {
  'All Features': Zap,
  'Patient': Heart,
  'Nurse': Clipboard,
  'Doctor': Stethoscope,
  'Hospital Admin': Building2,
};

export function Features() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('All Features');

  const displayed = activeTab === 'All Features'
    ? ALL_FEATURES
    : ALL_FEATURES.filter(f => f.tab === activeTab || f.tab === 'All Features');

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />

      {/* ─── Hero ─── */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-full px-4 py-1.5 mb-6">
            <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">25+ Features across 4 roles</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-6xl mb-6">
            {t('features_page.title')} <span className="text-blue-600 dark:text-blue-400">{t('features_page.titleHighlight')}</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto font-light leading-relaxed">
            From booking a hospital appointment to receiving lab results in real time — I-CAMS covers the full care journey for patients, nurses, doctors, and hospital admins across Sri Lanka.
          </motion.p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        {/* ─── Role Tabs ─── */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {TABS.map(tab => {
            const Icon = ROLE_ICONS[tab];
            const color = ROLE_COLORS[tab];
            const isActive = activeTab === tab;

            const tabStyles: Record<string, string> = {
              blue: isActive
                ? 'bg-blue-600 border-blue-600 text-white shadow-lg'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-blue-400 hover:text-blue-600 bg-white dark:bg-slate-900',
              green: isActive
                ? 'bg-green-600 border-green-600 text-white shadow-lg'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-green-400 hover:text-green-600 bg-white dark:bg-slate-900',
              purple: isActive
                ? 'bg-purple-600 border-purple-600 text-white shadow-lg'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-purple-400 hover:text-purple-600 bg-white dark:bg-slate-900',
              orange: isActive
                ? 'bg-orange-600 border-orange-600 text-white shadow-lg'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-orange-400 hover:text-orange-600 bg-white dark:bg-slate-900',
            };

            return (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 border-2 ${tabStyles[color]}`}>
                <Icon className="h-4 w-4" />
                {tab}
              </button>
            );
          })}
        </div>

        {/* ─── Feature Cards ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayed.map((feature, index) => {
            const featureStyles: Record<string, string> = {
              blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
              green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
              purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
              orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
              teal: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400',
              slate: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
            };
            const colorClass = featureStyles[feature.color];

            return (
              <motion.div key={`${feature.name}-${activeTab}`}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
                className="bg-white dark:bg-slate-900 p-7 rounded-2xl border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:border-blue-500/30 dark:hover:border-blue-500/30 transition-all duration-300 group flex flex-col">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${colorClass.split(' ').slice(0, 2).join(' ')} ${colorClass.split(' ').slice(2).join(' ')} group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${colorClass.split(' ').slice(0, 2).join(' ')} ${colorClass.split(' ').slice(2).join(' ')}`}>
                    {feature.tab === 'All Features' ? 'Platform' : feature.tab}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{feature.name}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4 flex-1">{feature.desc}</p>
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
                  {feature.tags.map(tag => (
                    <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ─── Workflow Highlight ─── */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }}
          className="mt-20 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-10 py-8">
            <h2 className="text-2xl font-bold text-white mb-2">The Complete Care Journey</h2>
            <p className="text-blue-100">See how every feature connects — from appointment to results.</p>
          </div>
          <div className="p-10">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4 flex-wrap">
              {[
                { step: '1', label: 'Patient books hospital appointment', color: 'blue', role: 'Patient' },
                { step: '2', label: 'Doctor places lab order in workspace', color: 'purple', role: 'Doctor' },
                { step: '3', label: 'Hospital lab advances test pipeline', color: 'orange', role: 'Hospital' },
                { step: '4', label: 'Result uploaded → patient notified', color: 'teal', role: 'Hospital' },
                { step: '5', label: 'Nurse logs daily vitals & flags concerns', color: 'green', role: 'Nurse' },
                { step: '6', label: 'Doctor reviews flag & responds in-thread', color: 'purple', role: 'Doctor' },
              ].map((s, i) => (
                <div key={s.step} className="flex items-center gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full bg-${s.color}-100 dark:bg-${s.color}-900/30 border-2 border-${s.color}-400 flex items-center justify-center font-bold text-${s.color}-700 dark:text-${s.color}-300 text-sm flex-shrink-0`}>
                      {s.step}
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500">{s.role}</p>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{s.label}</p>
                    </div>
                  </div>
                  {i < 5 && <ArrowRight className="h-5 w-5 text-slate-300 dark:text-slate-600 hidden md:block flex-shrink-0" />}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ─── Simplicity Banner ─── */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} viewport={{ once: true }}
          className="mt-12 p-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-3xl text-center text-white shadow-2xl overflow-hidden relative">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4">Engineered for Simplicity. Built for Impact.</h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto font-light mb-8">
              I-CAMS replaces fragmented paper records, phone calls, and delayed results with a single connected platform — improving outcomes for every Sri Lankan involved in a care journey.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/login" className="px-8 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors shadow-lg">
                Get Started Free →
              </Link>
              <Link to="/about" className="px-8 py-3 border-2 border-white/50 text-white rounded-xl font-semibold hover:bg-white/10 transition-colors">
                Learn About I-CAMS
              </Link>
            </div>
          </div>
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl" />
        </motion.div>

        <div className="mt-16 text-center">
          <Link to="/" className="inline-flex items-center px-6 py-3 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 font-medium transition-all duration-200 shadow-sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('navigation.returnHome')}
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
