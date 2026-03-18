import { Link } from 'react-router';
import { ArrowLeft, Scale, AlertTriangle, UserCheck, Activity, Stethoscope } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/footer';
import { motion } from 'motion/react';

export function TermsOfService() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link to="/" className="inline-flex items-center text-blue-600 dark:text-blue-500 hover:text-blue-800 dark:hover:text-blue-400 font-medium mb-8">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">Terms of Service</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-12">Effective Date: February 22, 2026</p>
        </motion.div>

        <div className="space-y-12">
          {/* Section 1: Emergency Disclaimer */}
          <section className="p-10 bg-red-50 dark:bg-red-900/20 rounded-[2rem] border border-red-100 dark:border-red-900/30">
            <div className="flex items-center gap-3 mb-6 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-10 h-10" />
              <h2 className="text-3xl font-extrabold m-0 uppercase tracking-tighter">CRITICAL DISCLOSURE</h2>
            </div>
            <p className="text-xl text-red-900 dark:text-red-200 font-bold leading-relaxed mb-6">
              I-CAMS is an <span className="underline decoration-wavy">Assessment and Monitoring System</span>. It is designed to facilitate coordination between patients and healthcare providers. It is NOT an emergency response platform.
            </p>
            <div className="bg-white/50 dark:bg-black/20 p-6 rounded-xl border border-red-200 dark:border-red-900/50 space-y-4">
              <p className="text-red-700 dark:text-red-300 font-medium flex gap-3">
                <span className="font-bold">01.</span>
                Do NOT use I-CAMS for acute, life-threatening emergencies.
              </p>
              <p className="text-red-700 dark:text-red-300 font-medium flex gap-3">
                <span className="font-bold">02.</span>
                I-CAMS does NOT provide emergency ambulance dispatch services.
              </p>
              <p className="text-red-700 dark:text-red-300 font-medium flex gap-3">
                <span className="font-bold">03.</span>
                In case of a medical emergency, immediately contact local emergency services (e.g., dial 1990 in Sri Lanka).
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xl">
                1
              </div>
              <h2 className="text-2xl font-bold">Acceptance of Terms</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
              By accessing or using the I-CAMS platform, you agree to be bound by these Terms of Service. If you are using the platform on behalf of a hospital or clinical institution, you represent that you have the authority to bind that institution to these terms.
            </p>
          </section>

          {/* Section 3 */}
          <section>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xl">
                2
              </div>
              <h2 className="text-2xl font-bold">Scope of Service</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-6 font-medium">
              I-CAMS provides a digital framework for:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-xl flex gap-3">
                <Activity className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span className="text-sm">Continuous health metric logging and symptom tracking.</span>
              </div>
              <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-xl flex gap-3">
                <Scale className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span className="text-sm">Visual trend analysis for clinical decision support.</span>
              </div>
              <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-xl flex gap-3">
                <UserCheck className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span className="text-sm">Professional-to-patient and staff communication.</span>
              </div>
              <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-xl flex gap-3">
                <Stethoscope className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <span className="text-sm">Integrated care coordination for nursing staff.</span>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xl">
                3
              </div>
              <h2 className="text-2xl font-bold">User Responsibility</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-6">
              Users are responsible for the accuracy of the information they provide. I-CAMS is a tool that assists clinical judgment; it does not replace the professional advice, diagnosis, or treatment provided by a healthcare professional.
            </p>
            <div className="space-y-4">
              <div className="flex gap-4 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
                <div>
                  <h4 className="font-bold mb-1">Patients</h4>
                  <p className="text-sm text-slate-500">Must ensure daily logs are honest, accurate, and submitted in a timely manner.</p>
                </div>
              </div>
              <div className="flex gap-4 p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="w-2 h-2 rounded-full bg-emerald-600 mt-2"></div>
                <div>
                  <h4 className="font-bold mb-1">Professionals</h4>
                  <p className="text-sm text-slate-500">Must use the data provided as a supplementary tool to standard clinical practices and professional judgment.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xl">
                4
              </div>
              <h2 className="text-2xl font-bold">Professional Standards</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Healthcare professionals using I-CAMS must maintain their local clinical registration and adhere to the medical ethics and standards set by the <strong className="text-slate-900 dark:text-white">Sri Lanka Medical Council (SLMC)</strong>.
            </p>
          </section>

          {/* Section 6 */}
          <section className="pt-10 border-t border-slate-200 dark:border-slate-800">
            <h2 className="text-2xl font-bold mb-4">5. Termination of Access</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              We reserve the right to suspend or terminate access to the platform for users who violate these terms, compromise the security of the system, or use the platform for purposes outside its intended clinical scope.
            </p>
          </section>
        </div>

        <div className="mt-20 py-10 text-center">
          <p className="text-slate-500 dark:text-slate-500 text-sm italic font-medium">
            "Bridging the clinical gap through technology, one log at a time."
          </p>
          <p className="text-slate-400 dark:text-slate-600 text-[10px] mt-4 uppercase tracking-[0.2em]">
            I-CAMS Sri Lanka • Assessment & Monitoring
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
