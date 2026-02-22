import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/footer';
import { ScrollToTop } from '../components/ScrollToTop';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { Activity, ShieldCheck, Users, BarChart3, Clock, Smartphone, Heart, Stethoscope, Clipboard } from 'lucide-react';
import { motion } from 'motion/react';

export function Landing() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white dark:bg-slate-900 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                {/* Language Switcher */}
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mb-8 inline-block sm:block"
                >
                  <LanguageSwitcher />
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-4xl tracking-tight font-extrabold text-slate-900 dark:text-white sm:text-5xl md:text-6xl"
                >
                  <span className="block xl:inline">{t('hero.title').split(' ')[0]} {t('hero.title').split(' ')[1]} {t('hero.title').split(' ')[2]}</span>{' '}
                  <span className="block text-blue-600 dark:text-blue-500 xl:inline">{t('hero.titleHighlight')}</span>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="mt-3 text-base text-slate-500 dark:text-slate-400 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0"
                >
                  {t('hero.description')}
                </motion.p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow dark:shadow-lg dark:shadow-blue-900/30">
                    <Link
                      to="/login"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 md:py-4 md:text-lg md:px-10 transition-colors duration-200"
                    >
                      {t('common.getStarted')}
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link
                      to="/about"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 md:py-4 md:text-lg md:px-10 transition-colors duration-200"
                    >
                      {t('common.learnMore')}
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <img
            className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
            src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
            alt="Doctor using tablet"
          />
        </div>
      </section>

      {/* I-CAMS Overview Section */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
              {t('overview.heading')}
            </h2>
            <p className="max-w-3xl mx-auto text-lg md:text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
              {t('overview.content')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-slate-50 dark:bg-slate-950 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="lg:text-center"
          >
            <h2 className="text-base text-blue-600 dark:text-blue-500 font-semibold tracking-wide uppercase">{t('features.sectionLabel')}</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              {t('features.heading')}
            </p>
            <p className="mt-4 max-w-2xl text-xl text-slate-500 dark:text-slate-400 lg:mx-auto">
              {t('features.description')}
            </p>
          </motion.div>

          <div className="mt-10">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              {[
                {
                  name: 'Real-time Monitoring',
                  description: 'Patients can log vitals and symptoms instantly. Doctors receive immediate updates on critical changes.',
                  icon: Activity,
                },
                {
                  name: 'Secure Communication',
                  description: 'Direct, secure messaging between patients and care providers ensures timely advice and interventions.',
                  icon: Users,
                },
                {
                  name: 'Data Visualization',
                  description: 'Visualize health trends over time with intuitive charts, helping to spot decline early.',
                  icon: BarChart3,
                },
                {
                  name: '24/7 Access',
                  description: 'Access your health records and care plan from anywhere, at any time, on any device.',
                  icon: Clock,
                },
                {
                  name: 'Mobile Friendly',
                  description: 'Optimized for mobile devices, making it easy for patients to update their status on the go.',
                  icon: Smartphone,
                },
                {
                  name: 'Data Privacy',
                  description: 'Built with security in mind to protect sensitive patient health information.',
                  icon: ShieldCheck,
                },
              ].map((feature, index) => (
                <motion.div
                  key={feature.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="relative"
                >
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 dark:bg-blue-600 text-white">
                      <feature.icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-slate-900 dark:text-white">{feature.name}</p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-slate-500 dark:text-slate-400">{feature.description}</dd>
                </motion.div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Decorative Divider */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent"></div>
      </div>

      {/* Three Column Section - Portals */}
      <section className="py-12 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Patient Portal */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative p-8 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl border border-blue-200 dark:border-blue-800 hover:shadow-lg dark:hover:shadow-blue-900/30 transition-shadow duration-300"
            >
              <div className="flex items-center justify-center h-16 w-16 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white mb-6">
                <Heart className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Patient Portal</h3>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Track your health metrics, log symptoms and vitals, communicate directly with healthcare providers, and access your personalized care plan anytime, anywhere.
              </p>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-6">
                <li className="flex items-center">
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Health tracking dashboard
                </li>
                <li className="flex items-center">
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Medication reminders
                </li>
                <li className="flex items-center">
                  <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Secure messaging
                </li>
              </ul>
              <Link
                to="/login"
                className="inline-flex items-center text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-700 dark:hover:text-blue-300 transition-colors duration-200"
              >
                {t('common.getStarted')} →
              </Link>
            </motion.div>

            {/* Nurse Dashboard */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative p-8 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border border-purple-200 dark:border-purple-800 hover:shadow-lg dark:hover:shadow-purple-900/30 transition-shadow duration-300"
            >
              <div className="flex items-center justify-center h-16 w-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white mb-6">
                <Clipboard className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Nurse Dashboard</h3>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Manage patient assignments, monitor real-time updates, coordinate care interventions, and maintain accurate patient records in a centralized, easy-to-navigate interface.
              </p>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-6">
                <li className="flex items-center">
                  <span className="inline-block w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Patient assignment board
                </li>
                <li className="flex items-center">
                  <span className="inline-block w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Real-time alerts
                </li>
                <li className="flex items-center">
                  <span className="inline-block w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Task management
                </li>
              </ul>
              <Link
                to="/login"
                className="inline-flex items-center text-purple-600 dark:text-purple-400 font-semibold hover:text-purple-700 dark:hover:text-purple-300 transition-colors duration-200"
              >
                {t('common.getStarted')} →
              </Link>
            </motion.div>

            {/* Doctor Oversight */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative p-8 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-800 hover:shadow-lg dark:hover:shadow-emerald-900/30 transition-shadow duration-300"
            >
              <div className="flex items-center justify-center h-16 w-16 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white mb-6">
                <Stethoscope className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Doctor Oversight</h3>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Comprehensive patient insights, clinical decision support, integrated care coordination, and data-driven analytics to improve patient outcomes and optimize care delivery.
              </p>
              <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400 mb-6">
                <li className="flex items-center">
                  <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                  Clinical analytics
                </li>
                <li className="flex items-center">
                  <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                  Patient trend analysis
                </li>
                <li className="flex items-center">
                  <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                  Treatment planning tools
                </li>
              </ul>
              <Link
                to="/login"
                className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-semibold hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors duration-200"
              >
                {t('common.getStarted')} →
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-700 dark:to-cyan-700">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-4xl font-bold text-white mb-4"
          >
            Ready to Transform Patient Care?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg text-blue-50 mb-8"
          >
            Join healthcare professionals and patients already using I-CAMS to deliver better care outcomes.
          </motion.p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-semibold rounded-lg text-blue-600 bg-white hover:bg-blue-50 dark:bg-slate-100 dark:hover:bg-slate-200 transition-colors duration-200 shadow-lg"
          >
            {t('common.getStarted')}
          </Link>
        </div>
      </section>

      {/* Clinical Tagline */}
      <section className="py-12 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-500 dark:text-slate-400 text-lg italic font-medium">
            "Bridging the clinical gap through technology, one log at a time."
          </p>
          <p className="text-slate-400 dark:text-slate-500 text-[10px] mt-4 uppercase tracking-[0.2em] font-bold">
            I-CAMS Sri Lanka • Assessment & Monitoring
          </p>
        </div>
      </section>
      {/* Footer */}
      <Footer />
      <ScrollToTop />
    </div>
  );
}
