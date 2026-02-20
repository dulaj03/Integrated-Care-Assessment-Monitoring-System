import { Link } from 'react-router';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/footer';
import { ScrollToTop } from '../components/ScrollToTop';
import { Activity, ShieldCheck, Users, BarChart3, Clock, Smartphone } from 'lucide-react';
import { motion } from 'motion/react';

export function Landing() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white dark:bg-slate-900 sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-4xl tracking-tight font-extrabold text-slate-900 dark:text-white sm:text-5xl md:text-6xl"
                >
                  <span className="block xl:inline">Integrated Care Assessment</span>{' '}
                  <span className="block text-blue-600 dark:text-blue-500 xl:inline">& Monitoring System</span>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="mt-3 text-base text-slate-500 dark:text-slate-400 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0"
                >
                  Bridging the gap between patients and healthcare professionals. Real-time monitoring, seamless communication, and proactive care for chronic conditions.
                </motion.p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow dark:shadow-lg dark:shadow-blue-900/30">
                    <Link
                      to="/login"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 md:py-4 md:text-lg md:px-10 transition-colors duration-200"
                    >
                      Get Started
                    </Link>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link
                      to="/about"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 md:py-4 md:text-lg md:px-10 transition-colors duration-200"
                    >
                      Learn More
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

      {/* Features Section */}
      <section className="py-12 bg-slate-50 dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-blue-600 dark:text-blue-500 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              A better way to manage health
            </p>
            <p className="mt-4 max-w-2xl text-xl text-slate-500 dark:text-slate-400 lg:mx-auto">
              I-CAMS provides a comprehensive suite of tools for patients, nurses, and doctors to collaborate effectively.
            </p>
          </div>

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
              ].map((feature) => (
                <div key={feature.name} className="relative">
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 dark:bg-blue-600 text-white">
                      <feature.icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-slate-900 dark:text-white">{feature.name}</p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-slate-500 dark:text-slate-400">{feature.description}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
      <ScrollToTop />
    </div>
  );
}
