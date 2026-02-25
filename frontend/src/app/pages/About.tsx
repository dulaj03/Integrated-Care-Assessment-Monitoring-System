import { Link } from "react-router";
import { ArrowLeft, Activity, ShieldCheck, HeartPulse, Microscope } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Footer } from '../components/footer';
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";

export function About() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />

      {/* Hero Section */}
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
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-6xl mb-6"
            >
              {t('about.title')} <span className="text-blue-600 dark:text-blue-400">{t('about.titleHighlight')}</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed font-light"
            >
              {t('about.description')}
            </motion.p>
          </div>
        </main>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-24">

        {/* The Problem Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-12 items-center"
        >
          <div className="order-2 md:order-1">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 mb-4">
              {t('about.challenge')}
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">{t('about.challengeHeading')}</h2>
            <div className="space-y-4 text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
              <p>
                {t('about.challengeContent1')}
              </p>
              <p>
                {t('about.challengeContent2')}
              </p>
            </div>
          </div>
          <div className="order-1 md:order-2 bg-slate-100 dark:bg-slate-800 rounded-3xl p-8 flex items-center justify-center border border-slate-200 dark:border-slate-700 aspect-square">
            <Microscope className="w-32 h-32 text-blue-600 dark:text-blue-400 opacity-80" />
          </div>
        </motion.section>

        {/* The Solution Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-12 items-center"
        >
          <div className="bg-blue-600 rounded-3xl p-8 flex items-center justify-center shadow-xl aspect-square">
            <ShieldCheck className="w-32 h-32 text-white" />
          </div>
          <div>
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 mb-4">
              {t('about.framework')}
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">{t('about.solutionHeading')}</h2>
            <div className="space-y-4 text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
              <p>
                {t('about.solutionContent1')}
              </p>
              <p>
                {t('about.solutionContent2')}
              </p>
            </div>
          </div>
        </motion.section>

        {/* Our Vision Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto pb-12"
        >
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 mb-4">
            Our Vision
          </div>
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-8">Optimizing Sri Lankan Healthcare</h2>
          <div className="space-y-6 text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
            <p>
              Our vision is to redefine chronic disease management and proactive care within the Sri Lankan healthcare system. We are committed to optimizing patient outcomes through technological innovation that is both robust and accessible.
            </p>
            <p className="font-semibold text-slate-900 dark:text-white">
              I-CAMS is designed for every individual, transcending age demographics.
            </p>
            <p>
              Whether it is pediatric monitoring, adult chronic care, or geriatric support, our platform provides comprehensive tools for all stages of life. We envision a future where technology and clinical expertise converge to create a more resilient and responsive healthcare infrastructure for all Sri Lankans.
            </p>
          </div>
        </motion.section>

        {/* Features Grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="bg-white dark:bg-slate-900 rounded-3xl p-12 border border-slate-200 dark:border-slate-800 shadow-sm"
        >
          <h3 className="text-2xl font-bold text-center mb-12 text-slate-900 dark:text-white">Clinical Foundations</h3>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="space-y-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto">
                <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="font-bold dark:text-white">Real-time Monitoring</h4>
              <p className="text-sm text-slate-500">Continuous tracking of vital signs and symptoms for immediate feedback.</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto">
                <HeartPulse className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="font-bold dark:text-white">Holistic Care</h4>
              <p className="text-sm text-slate-500">Supporting patients of all ages with specialized monitoring protocols.</p>
            </div>
            <div className="space-y-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="font-bold dark:text-white">Data Integrity</h4>
              <p className="text-sm text-slate-500">Secure, clinical-grade data handling for professional medical use.</p>
            </div>
          </div>
        </motion.section>

        {/* Back navigation */}
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

