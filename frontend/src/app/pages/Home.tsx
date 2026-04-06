import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ScrollToTop } from '../components/ScrollToTop';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import {
  ShieldCheck, Users, Clock, Heart, Stethoscope, Clipboard,
  CheckCircle2, ArrowRight, TrendingUp, FileText, Bell, Building2, FlaskConical,
  MessageSquare, Smartphone, Zap, Globe,
} from 'lucide-react';
import { motion, useSpring, useTransform, useInView } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface CounterProps {
  value: number;
  label: string;
  suffix?: string;
  icon?: LucideIcon;
}

function Counter({ value, label, suffix = '', icon: Icon }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  const springValue = useSpring(0, {
    mass: 1,
    stiffness: 50,
    damping: 25,
  });

  const displayValue = useTransform(springValue, (latest) =>
    Math.round(latest).toLocaleString()
  );

  useEffect(() => {
    if (isInView) {
      springValue.set(value);
    }
  }, [isInView, value, springValue]);

  return (
    <div className="flex flex-col items-center justify-center p-5 bg-white/15 backdrop-blur-lg rounded-2xl border border-white/25 shadow-2xl hover:bg-white/20 transition-all duration-300 group/counter">
      {Icon && (
        <div className="mb-3 p-2 bg-blue-500/20 rounded-xl group-hover/counter:scale-110 transition-transform duration-300">
          <Icon className="h-6 w-6 text-white" />
        </div>
      )}
      <div className="text-3xl md:text-4xl font-black text-white tracking-tighter flex items-baseline gap-1">
        <motion.span ref={ref}>{displayValue}</motion.span>
        <span className="text-xl md:text-2xl font-bold opacity-80">{suffix}</span>
      </div>
      <div className="text-[10px] md:text-xs font-black text-blue-50 uppercase tracking-[0.2em] mt-2 text-center">
        {label}
      </div>
    </div>
  );
}

export function Landing() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isLoggedIn = !!sessionStorage.getItem('token');
  const userRole = sessionStorage.getItem('userRole');
  const [stats, setStats] = useState({ patients: 1250, doctors: 380, hospitals: 18 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/public/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };
    fetchStats();
  }, []);

  const getDashboardPath = () => {
    switch (userRole) {
      case 'patient': return '/patient/dashboard';
      case 'doctor': return '/doctor/dashboard';
      case 'nurse': return '/nurse/dashboard';
      case 'hospital': return '/hospital/dashboard';
      default: return '/login';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white dark:bg-slate-900 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-6 inline-block sm:block">
                  <LanguageSwitcher />
                </motion.div>
                {/* Badge */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                  className="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-full px-4 py-1.5 mb-6">
                  <Zap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">Sri Lanka's First Integrated Care Platform</span>
                </motion.div>
                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
                  className="text-4xl tracking-tight font-extrabold text-slate-900 dark:text-white sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">{t('hero.title').split(' ')[0]} {t('hero.title').split(' ')[1]} {t('hero.title').split(' ')[2]}</span>{' '}
                  <span className="block text-blue-600 dark:text-blue-500 xl:inline">{t('hero.titleHighlight')}</span>
                </motion.h1>
                <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
                  className="mt-3 text-base text-slate-500 dark:text-slate-400 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  {t('hero.description')} — now with direct hospital connectivity, lab test tracking, and real-time care coordination across Sri Lanka.
                </motion.p>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}
                  className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start gap-3">
                  <Link to={isLoggedIn ? getDashboardPath() : "/login"}
                    className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 md:py-4 md:text-lg md:px-10 transition-colors duration-200 shadow-lg">
                    {isLoggedIn ? 'Go to Dashboard' : t('common.getStarted')}
                  </Link>
                  <Link to="/features"
                    className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 md:py-4 md:text-lg md:px-10 transition-colors duration-200">
                    Explore Features
                  </Link>
                </motion.div>
              </div>
            </main>
          </div>
        </div>

        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2 relative group">
          <img className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full transition-transform duration-700 group-hover:scale-105"
            src="/IMG_servicios-salud-ecliene-portal-digital-occident.jpg"
            alt="Digital health services portal" />

          {/* Stats Overlay on Image */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent lg:bg-gradient-to-l lg:from-slate-900/40 lg:to-transparent flex items-end lg:items-center justify-center lg:justify-end pb-8 lg:pb-0 lg:pr-12 px-4 shadow-inner">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5, ease: 'easeOut' }}
              viewport={{ once: true }}
              className="grid grid-cols-3 lg:grid-cols-1 gap-4 md:gap-6 w-full max-w-4xl lg:max-w-[280px]"
            >
              <Counter value={stats.patients} label="Patients" suffix="+" icon={Users} />
              <Counter value={stats.doctors} label="Doctors" suffix="+" icon={Stethoscope} />
              <Counter value={stats.hospitals} label="Hospitals" suffix="+" icon={Building2} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Stats / Trust Bar ─── */}
      <section className="py-12 bg-blue-600 dark:bg-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '4 Roles', label: 'User Portals', icon: Users },
              { value: `${stats.hospitals}+`, label: 'Sri Lankan Hospitals', icon: Building2 },
              { value: 'Real-time', label: 'Lab Tracking', icon: FlaskConical },
              { value: '24 / 7', label: 'System Access', icon: Clock },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }} viewport={{ once: true }}
                className="flex flex-col items-center">
                <stat.icon className="h-8 w-8 text-blue-100 mb-2" />
                <p className="text-3xl font-extrabold text-white">{stat.value}</p>
                <p className="text-blue-100 text-sm mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── What Is I-CAMS ─── */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
              {t('overview.heading')}
            </h2>
            <p className="max-w-3xl mx-auto text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
              {t('overview.content')} I-CAMS now connects patients directly with hospitals across Sri Lanka — enabling appointment booking, live lab test tracking, and seamless communication between every member of a care team.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── Hospital Workflow Highlight ─── */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Visual flow diagram */}
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}
              className="lg:w-1/2 w-full">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl dark:shadow-blue-900/30">
                <img src="/aged-care-assessment.jpg" alt="Hospital workflow in action"
                  className="w-full h-80 lg:h-[420px] object-cover" />
                <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-xl px-4 py-3 flex items-center gap-3 shadow-lg">
                  <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Live Tracking</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Lab results visible in real time</p>
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }} viewport={{ once: true }}
              className="lg:w-1/2 w-full">
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-4">
                New — Hospital Integration
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-5 leading-tight">
                From Doctor's Order to Lab Result — All in One App
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed mb-6">
                I-CAMS now connects you directly to hospitals in Sri Lanka. Book doctor appointments, track your lab tests step-by-step, and receive results on your dashboard the moment the hospital uploads them.
              </p>
              <ul className="space-y-3">
                {[
                  'Browse & book appointments at 6+ Sri Lankan hospitals',
                  'Doctor places lab or scan orders directly from the platform',
                  'Hospital lab updates progress: Ordered → Collected → Processing → Results ready',
                  'Patient sees the result the instant it\'s uploaded — with flagged values highlighted',
                  'Nurse logs daily symptoms; doctor reviews and responds in-app',
                ].map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-600 dark:text-slate-300">{point}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  const role = sessionStorage.getItem('userRole');
                  if (role === 'patient') {
                    navigate('/patient/dashboard');
                  } else {
                    navigate('/login/patient');
                  }
                }}
                className="mt-8 inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200">
                Find a Hospital <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Four Portals ─── */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }}
            className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">
              One Platform. Four Powerful Portals.
            </h2>
            <p className="mt-4 text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              Every role gets a dedicated, intelligent workspace — designed specifically for how they interact with healthcare.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Patient Portal',
                icon: Heart,
                gradient: 'from-blue-500 to-cyan-500',
                bg: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
                border: 'border-blue-200 dark:border-blue-800',
                link: 'text-blue-600 dark:text-blue-400',
                dot: 'bg-blue-500',
                features: [
                  'Health vitals & trend dashboard',
                  'Book hospital appointments',
                  'Track lab tests in real time',
                  'View results with flagged values',
                  'Medications & care plan',
                  'Secure chat with care team',
                ],
              },
              {
                title: 'Nurse Dashboard',
                icon: Clipboard,
                gradient: 'from-purple-500 to-pink-500',
                bg: 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
                border: 'border-purple-200 dark:border-purple-800',
                link: 'text-purple-600 dark:text-purple-400',
                dot: 'bg-purple-500',
                features: [
                  'Log vitals, symptoms & pain level',
                  'Symptom chip selection + mood tracker',
                  'Flag urgent concerns to doctor',
                  'View & action doctor\'s orders',
                  'Reply to care notes in-thread',
                  'Patient status at a glance',
                ],
              },
              {
                title: 'Doctor Workspace',
                icon: Stethoscope,
                gradient: 'from-emerald-500 to-teal-500',
                bg: 'from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20',
                border: 'border-emerald-200 dark:border-emerald-800',
                link: 'text-emerald-600 dark:text-emerald-400',
                dot: 'bg-emerald-500',
                features: [
                  'Full patient 5-tab workspace',
                  'See nurse-flagged alerts instantly',
                  'Order labs, scans & medications',
                  'Review lab results & add notes',
                  'Write & view clinical notes',
                  'Direct reply to nurse observations',
                ],
              },
              {
                title: 'Hospital Admin',
                icon: Building2,
                gradient: 'from-orange-500 to-amber-500',
                bg: 'from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20',
                border: 'border-orange-200 dark:border-orange-800',
                link: 'text-orange-600 dark:text-orange-400',
                dot: 'bg-orange-500',
                features: [
                  'View today\'s appointment queue',
                  'Manage lab test pipeline',
                  'Advance test status step-by-step',
                  'Upload result summaries',
                  'Auto-notifies patient when ready',
                  'Doctor roster management',
                ],
              },
            ].map((portal, i) => {
              const styles: Record<string, { bg: string; border: string; link: string; dot: string; gradient: string }> = {
                'Patient Portal': {
                  bg: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
                  border: 'border-blue-200 dark:border-blue-800',
                  link: 'text-blue-600 dark:text-blue-400',
                  dot: 'bg-blue-500',
                  gradient: 'from-blue-500 to-cyan-500'
                },
                'Nurse Dashboard': {
                  bg: 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20',
                  border: 'border-purple-200 dark:border-purple-800',
                  link: 'text-purple-600 dark:text-purple-400',
                  dot: 'bg-purple-500',
                  gradient: 'from-purple-500 to-pink-500'
                },
                'Doctor Workspace': {
                  bg: 'from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20',
                  border: 'border-emerald-200 dark:border-emerald-800',
                  link: 'text-emerald-600 dark:text-emerald-400',
                  dot: 'bg-emerald-500',
                  gradient: 'from-emerald-500 to-teal-500'
                },
                'Hospital Admin': {
                  bg: 'from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20',
                  border: 'border-orange-200 dark:border-orange-800',
                  link: 'text-orange-600 dark:text-orange-400',
                  dot: 'bg-orange-500',
                  gradient: 'from-orange-500 to-amber-500'
                }
              };

              const s = styles[portal.title as keyof typeof styles];

              return (
                <motion.div key={portal.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.08 }} viewport={{ once: true }}
                  className={`relative p-7 bg-gradient-to-br ${s.bg} rounded-2xl border ${s.border} hover:shadow-xl transition-all duration-300 flex flex-col`}>
                  <div className={`flex items-center justify-center h-14 w-14 rounded-xl bg-gradient-to-br ${s.gradient} text-white mb-5 shadow-lg`}>
                    <portal.icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{portal.title}</h3>
                  <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-6 flex-1">
                    {portal.features.map(f => (
                      <li key={f} className="flex items-start gap-2">
                        <span className={`inline-block w-1.5 h-1.5 ${s.dot} rounded-full mt-1.5 flex-shrink-0`} />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link to="/login" className={`inline-flex items-center ${s.link} font-semibold hover:opacity-80 transition-opacity`}>
                    Get Started <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── Community Care Section ─── */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-20">
            <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} viewport={{ once: true }}
              className="lg:w-1/2 w-full">
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-4">
                Community &amp; Home Care
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-5 leading-tight">
                Extending Quality Care Beyond the Hospital Walls
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed mb-6">
                I-CAMS bridges the gap between hospital-based clinical teams and community care workers. Home-based nurses can submit assessments, log daily observations, and flag urgent needs — keeping the entire care team in sync while the patient recovers at home.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {[
                  { icon: FileText, title: 'Digital Care Logs', desc: 'Replace paper-based records with secure digital logs' },
                  { icon: Bell, title: 'Smart Alerts', desc: "Instant notifications when a patient's status changes" },
                  { icon: Users, title: 'Team Coordination', desc: 'Nurses, doctors & carers on one platform' },
                  { icon: TrendingUp, title: 'Progress Tracking', desc: 'Chart recovery milestones and follow-up targets' },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="h-9 w-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center flex-shrink-0">
                      <item.icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white text-sm">{item.title}</p>
                      <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/about" className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors duration-200">
                Learn about I-CAMS <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.1 }} viewport={{ once: true }}
              className="lg:w-1/2 w-full">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl dark:shadow-emerald-900/20">
                <img src="/home-care-asessment.jpeg" alt="Home care assessment" className="w-full h-80 lg:h-[420px] object-cover" />
                <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-xl px-4 py-3 flex items-center gap-3 shadow-lg">
                  <div className="h-10 w-10 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
                    <Heart className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Patient-Centred</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">Care delivered anywhere</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Why I-CAMS Is Innovative ─── */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} viewport={{ once: true }}
            className="text-center mb-14">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-4">Why We're Different</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">
              Built for Sri Lanka. Built for the Future.
            </h2>
            <p className="mt-4 text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
              No other system in Sri Lanka connects patients, nurses, doctors, and hospitals in a single real-time workflow.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Globe,
                title: 'Sri Lanka–First',
                color: 'blue',
                desc: 'Designed specifically for the Sri Lankan healthcare landscape — government and private hospitals, local specializations, multilingual support (English, Sinhala, Tamil).',
              },
              {
                icon: Zap,
                title: 'End-to-End Connected',
                color: 'purple',
                desc: 'From booking a hospital appointment to receiving lab results on your phone — the entire care journey is digitized and visible to every authorized role in real time.',
              },
              {
                icon: ShieldCheck,
                title: 'Clinical-Grade Security',
                color: 'emerald',
                desc: 'Patient data is protected with clinical-grade security standards. Role-based access ensures that only authorized personnel see sensitive information.',
              },
              {
                icon: MessageSquare,
                title: 'In-App Care Communication',
                color: 'orange',
                desc: 'Nurses flag concerns to doctors. Doctors reply with instructions. Patients receive updates. All within the app — no external messaging tools needed.',
              },
              {
                icon: FlaskConical,
                title: 'Live Lab Test Tracker',
                color: 'teal',
                desc: 'Patients can track every step of their lab test — from being ordered, sample collected, processing, to results ready — with timestamps at every stage.',
              },
              {
                icon: Smartphone,
                title: 'Mobile-First Design',
                color: 'pink',
                desc: 'Fully responsive and optimized for mobile. Elderly patients can log vitals from home, and nurses can submit assessments during ward rounds on any device.',
              },
            ].map((item, i) => {
              const iconStyles: Record<string, string> = {
                blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
                purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
                emerald: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
                orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
                teal: 'bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400',
                pink: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400',
              };

              return (
                <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.08 }} viewport={{ once: true }}
                  className="p-6 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:shadow-lg transition-all duration-300">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-4 ${iconStyles[item.color].split(' ').slice(0, 2).join(' ')}`}>
                    <item.icon className={`h-6 w-6 ${iconStyles[item.color].split(' ').slice(2).join(' ')}`} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-700 dark:to-cyan-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Experience Smarter Healthcare?
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-blue-50 mb-10 max-w-2xl mx-auto">
            Join patients, nurses, doctors, and hospital admins across Sri Lanka already benefiting from I-CAMS — the connected care platform.
          </motion.p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to={isLoggedIn ? getDashboardPath() : "/login"}
              className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-semibold rounded-xl text-blue-600 bg-white hover:bg-blue-50 dark:bg-slate-100 dark:hover:bg-slate-200 transition-colors duration-200 shadow-lg">
              {isLoggedIn ? 'Go to Dashboard' : "Get Started — It's Free"}
            </Link>
            <Link to="/features"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/50 text-base font-semibold rounded-xl text-white hover:bg-white/10 transition-colors duration-200">
              See All Features →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Tagline ─── */}
      <section className="py-10 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-500 dark:text-slate-400 text-lg italic font-medium">
            "Bridging the clinical gap through technology, one log at a time."
          </p>
          <p className="text-slate-400 dark:text-slate-500 text-[10px] mt-4 uppercase tracking-[0.2em] font-bold">
            I-CAMS Sri Lanka • Integrated Care &amp; Monitoring System
          </p>
        </div>
      </section>

      <Footer />
      <ScrollToTop />
    </div>
  );
}
