import { Link } from "react-router";
import {
  ArrowLeft,
  Activity,
  UserSquare2,
  BellRing,
  BarChart3,
  MessageSquareShare
} from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Footer } from '../components/footer';
import { motion } from "motion/react";

export function Features() {
  const features = [
    {
      name: 'Real-time Symptom Tracking',
      benefit: 'Enables early detection of deterioration through continuous patient data, allowing for timely clinical intervention.',
      icon: Activity,
      color: 'blue'
    },
    {
      name: 'Role-based Professional Access',
      benefit: 'Reduces hospital overcrowding by streamlining triage and ensuring only necessary cases are escalated to specialized care.',
      icon: UserSquare2,
      color: 'emerald'
    },
    {
      name: 'Automated Notifications & Alerts',
      benefit: 'Facilitates early detection of critical symptoms, triggering immediate medical responses before conditions worsen.',
      icon: BellRing,
      color: 'red'
    },
    {
      name: 'Data Visualization Dashboards',
      benefit: 'Aids in reducing overcrowding by identifying stable patient trends, supporting safe and informed home monitoring.',
      icon: BarChart3,
      color: 'indigo'
    },
    {
      name: 'Secure Multi-stakeholder Communication',
      benefit: 'Supports early detection through seamless information exchange between patients, nurses, and doctors for proactive care.',
      icon: MessageSquareShare,
      color: 'cyan'
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />

      {/* Header Section */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-6xl mb-6"
          >
            Clinical <span className="text-blue-600 dark:text-blue-400">Capabilities</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto font-light leading-relaxed"
          >
            A streamlined digital ecosystem designed to optimize healthcare delivery,
            prioritize patient outcomes, and alleviate the burden on our clinical infrastructure.
          </motion.p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 hover:shadow-xl hover:border-blue-500/30 transition-all duration-300 group"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-${feature.color}-100 dark:bg-${feature.color}-900/30 text-${feature.color}-600 dark:text-${feature.color}-400 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                {feature.name}
              </h3>
              <p className="text-slate-600 dark:text-slate-400 font-medium text-lg leading-relaxed mb-4">
                {feature.benefit}
              </p>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Key Benefit: {feature.benefit.includes('early detection') && feature.benefit.includes('overcrowding') ? 'Comprehensive Care' : feature.benefit.includes('early detection') ? 'Early Detection' : 'Capacity Management'}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Simplification highlight section */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mt-24 p-12 bg-blue-600 rounded-3xl text-center text-white shadow-2xl overflow-hidden relative"
        >
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4">Engineered for Simplicity</h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto font-light">
              We've stripped away the complexity of traditional medical software,
              focusing on a clean, intuitive interface that lets you focus on what
              matters most: patient health.
            </p>
          </div>
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-blue-400/20 rounded-full blur-2xl"></div>
        </motion.div>

        <div className="mt-20 text-center">
          <Link to="/" className="inline-flex items-center px-6 py-3 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 font-medium transition-all duration-200 shadow-sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Return to Homepage
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}

