import { Link } from 'react-router';
import {
  ArrowLeft, Activity, ShieldCheck, HeartPulse, Building2, FlaskConical,
  CheckCircle2, Zap, Globe,
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

export function About() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />

      {/* ─── Hero ─── */}
      <div className="relative overflow-hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-full px-4 py-1.5 mb-6">
              <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Sri Lanka's First Hospital-Connected Care Platform</span>
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-6xl mb-6">
              {t('about.title')} <span className="text-blue-600 dark:text-blue-400">{t('about.titleHighlight')}</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed font-light">
              {t('about.description')} — designed to modernize chronic care management and hospital connectivity across Sri Lanka.
            </motion.p>
          </div>
        </main>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-24">

        {/* ─── The Problem ─── */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-12 items-center">
          <div className="order-2 md:order-1">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 mb-4">
              {t('about.challenge')}
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">{t('about.challengeHeading')}</h2>
            <div className="space-y-4 text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
              <p>{t('about.challengeContent1')}</p>
              <p>{t('about.challengeContent2')}</p>
              <p className="font-medium text-slate-700 dark:text-slate-300">
                Sri Lankan patients with chronic conditions — diabetes, hypertension, COPD — often struggle with fragmented care: visiting the doctor at one place, doing lab tests at another, and receiving no digital feedback on results. I-CAMS was built to solve exactly this.
              </p>
            </div>
          </div>
          <div className="order-1 md:order-2 bg-slate-100 dark:bg-slate-800 rounded-3xl p-8 flex flex-col items-center justify-center border border-slate-200 dark:border-slate-700 aspect-square gap-6">
            <div className="grid grid-cols-2 gap-4 w-full">
              {[
                { label: 'Fragmented Records', icon: '📄', color: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' },
                { label: 'No Lab Visibility', icon: '🔬', color: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' },
                { label: 'Delayed Results', icon: '⏳', color: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800' },
                { label: 'Disconnected Teams', icon: '💬', color: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' },
              ].map(p => (
                <div key={p.label} className={`p-4 rounded-xl border ${p.color} text-center`}>
                  <span className="text-2xl">{p.icon}</span>
                  <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-2">{p.label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* ─── The Solution ─── */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-12 items-center">
          <div className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-3xl p-8 flex flex-col items-center justify-center shadow-xl aspect-square gap-5">
            <ShieldCheck className="w-20 h-20 text-white" />
            <div className="grid grid-cols-2 gap-3 w-full">
              {[
                { label: '4 Roles', sub: 'Connected' },
                { label: '6+ Hospitals', sub: 'Sri Lanka' },
                { label: 'Real-time', sub: 'Lab Tracking' },
                { label: '24/7', sub: 'Access' },
              ].map(s => (
                <div key={s.label} className="bg-white/20 rounded-xl p-3 text-center">
                  <p className="font-extrabold text-white text-lg leading-tight">{s.label}</p>
                  <p className="text-blue-100 text-xs">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 mb-4">
              {t('about.framework')}
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">{t('about.solutionHeading')}</h2>
            <div className="space-y-4 text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
              <p>{t('about.solutionContent1')}</p>
              <p>{t('about.solutionContent2')}</p>
              <p>
                Patients can now book appointments with doctors at Sri Lankan hospitals, track their lab tests step-by-step, and receive results directly on their dashboard. Nurses log vitals during home visits and flag concerns to doctors — who respond in-app. Hospitals manage lab queues and upload results that are instantly visible to patients.
              </p>
            </div>
          </div>
        </motion.section>

        {/* ─── The 4 Roles ─── */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }}>
          <div className="text-center mb-10">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 mb-4">
              Who Uses I-CAMS
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Built for Every Member of the Care Team</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                role: 'Patients',
                icon: '👤',
                color: 'blue',
                description: 'Manage your health from home. Log vitals and symptoms, book hospital appointments, track lab test progress in real time, and stay connected with your care team — all from a single dashboard.',
                actions: ['Log daily vitals & symptoms', 'Book hospital appointments', 'Track lab tests step by step', 'View results with highlighted flags', 'Chat with doctor & nurse'],
              },
              {
                role: 'Nurses',
                icon: '👩‍⚕️',
                color: 'green',
                description: 'Deliver better care at the bedside or in the community. Log patient vitals using your phone during rounds, flag urgent concerns to doctors instantly, and track all active care orders.',
                actions: ['Log vitals, pain & mood', 'Select observed symptoms quickly', 'Flag concerns to doctor with 1 tap', 'View and act on doctor\'s orders', 'Reply to clinical care notes'],
              },
              {
                role: 'Doctors',
                icon: '👨‍⚕️',
                color: 'purple',
                description: 'A complete patient workspace at your fingertips. Review nurse observations, order lab tests or scans, write clinical notes, review results, and communicate with the care team — without switching systems.',
                actions: ['See nurse-flagged alerts instantly', 'Order labs, scans, medication', 'Review lab results & add notes', 'Write and share clinical notes', 'Respond to nurse observations in-thread'],
              },
              {
                role: 'Hospital Admins',
                icon: '🏥',
                color: 'emerald',
                description: 'Manage your hospital\'s patient pipeline efficiently. View today\'s appointment queue, update lab test statuses step by step, upload results, and oversee your doctor roster — all from one dashboard.',
                actions: ['View appointment queue by day', 'Update lab test progress pipeline', 'Upload results to patient dashboard', 'Manage doctor availability', 'Track routine vs STAT priorities'],
              },
            ].map((item, i) => {
              const styles: Record<string, string> = {
                blue: 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/10 text-blue-500',
                green: 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10 text-green-500',
                purple: 'border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/10 text-purple-500',
                emerald: 'border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-500',
              };
              const colorClass = styles[item.color];

              return (
                <motion.div key={item.role} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.1 }} viewport={{ once: true }}
                  className={`p-7 rounded-2xl border ${colorClass.split(' ').slice(0, 4).join(' ')}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{item.icon}</span>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{item.role}</h3>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">{item.description}</p>
                  <ul className="space-y-1.5">
                    {item.actions.map(a => (
                      <li key={a} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className={`h-4 w-4 ${colorClass.split(' ').slice(4).join(' ')} mt-0.5 flex-shrink-0`} />
                        {a}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* ─── Vision ─── */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto pb-4">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 mb-4">
            Our Vision
          </div>
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-8">Optimizing Sri Lankan Healthcare</h2>
          <div className="space-y-6 text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
            <p>
              Our vision is to redefine chronic disease management and proactive care within the Sri Lankan healthcare system. We are committed to optimizing patient outcomes through technological innovation that is both robust and accessible.
            </p>
            <p className="font-semibold text-slate-900 dark:text-white">
              I-CAMS is designed for every individual — transcending age demographics and care settings.
            </p>
            <p>
              Whether it is pediatric monitoring, adult chronic care, post-surgical recovery, or geriatric support, I-CAMS provides comprehensive tools for all stages of life. We envision a future where technology and clinical expertise converge to create a more resilient and responsive healthcare infrastructure for all Sri Lankans — whether they are in Colombo, Kandy, or Galle.
            </p>
          </div>
        </motion.section>

        {/* ─── Clinical Foundations ─── */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }}
          className="bg-white dark:bg-slate-900 rounded-3xl p-12 border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-2xl font-bold text-center mb-12 text-slate-900 dark:text-white">What Makes I-CAMS Clinically Strong</h3>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {[
              { icon: Activity, title: 'Real-time Monitoring', desc: 'Continuous tracking of vital signs and symptoms, with automated risk-flagging for deteriorating conditions.' },
              { icon: HeartPulse, title: 'Holistic Care', desc: 'Supports patients of all ages with specialized monitoring protocols and integrated care team communication.' },
              { icon: FlaskConical, title: 'Live Lab Integration', desc: 'Hospital lab tests are tracked step-by-step and results are instantly visible to patients and doctors.' },
              { icon: Building2, title: 'Hospital Connected', desc: 'Directly integrated with 6+ Sri Lankan hospitals for appointment booking and lab workflow management.' },
              { icon: ShieldCheck, title: 'Data Integrity', desc: 'Secure, clinical-grade data handling with role-based access for professional medical use.' },
              { icon: Globe, title: 'Multilingual', desc: 'Full support for English, Sinhala, and Tamil — ensuring every Sri Lankan patient can use it comfortably.' },
            ].map(item => (
              <div key={item.title} className="space-y-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto">
                  <item.icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="font-bold text-slate-900 dark:text-white">{item.title}</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ─── CTA ─── */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl p-12 text-center text-white shadow-2xl">
          <h2 className="text-3xl font-bold mb-4">Ready to Join I-CAMS?</h2>
          <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">Whether you're a patient, nurse, doctor, or hospital — your dedicated workspace is ready.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/login" className="px-8 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors shadow-lg">
              Sign In →
            </Link>
            <Link to="/features" className="px-8 py-3 border-2 border-white/50 text-white rounded-xl font-semibold hover:bg-white/10 transition-colors">
              See All Features
            </Link>
          </div>
        </motion.div>

        {/* ─── Back nav ─── */}
        <div className="text-center">
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
