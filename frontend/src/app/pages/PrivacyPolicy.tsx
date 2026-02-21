import { Link } from "react-router";
import { ArrowLeft, ShieldCheck, Lock, Eye, FileSignature, Globe2 } from "lucide-react";
import { Navbar } from "../components/Navbar";
import { Footer } from '../components/footer';
import { motion } from "motion/react";

export function PrivacyPolicy() {
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
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">Privacy Policy</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-12">Last Updated: February 22, 2026</p>
        </motion.div>

        <div className="space-y-12">
          {/* Section 1 */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold">Introduction to Confidentiality</h2>
            </div>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              At I-CAMS, we recognize that health data is among the most sensitive information an individual can share. Our platform is built on a foundation of <span className="text-blue-600 dark:text-blue-400 font-bold">clinical trust and digital integrity</span>. This policy outlines how we protect your data while facilitating better healthcare outcomes in Sri Lanka.
            </p>
          </section>

          {/* Section 2 */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold">1. Data Encryption & Security</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-6 font-medium">
              We employ industry-leading encryption standards to ensure your health records are secure both in transit and at rest.
            </p>
            <ul className="space-y-4">
              <li className="flex gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 flex-shrink-0"></div>
                <p className="text-slate-600 dark:text-slate-400"><strong className="text-slate-900 dark:text-slate-100">End-to-End Encryption:</strong> All health logs submitted by patients are encrypted before they leave your device.</p>
              </li>
              <li className="flex gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 flex-shrink-0"></div>
                <p className="text-slate-600 dark:text-slate-400"><strong className="text-slate-900 dark:text-slate-100">Secure Servers:</strong> Data is stored in secure, clinical-grade data centers with 24/7 monitoring.</p>
              </li>
              <li className="flex gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 flex-shrink-0"></div>
                <p className="text-slate-600 dark:text-slate-400"><strong className="text-slate-900 dark:text-slate-100">Anonymization:</strong> For statistical analysis and healthcare optimization in Sri Lanka, we use anonymized data aggregates that cannot be traced back to individual patients.</p>
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Eye className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold">2. Role-Based Access Control (RBAC)</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-8">
              I-CAMS enforces a strict "Need to Know" policy. Your data is only visible to authorized personnel directly involved in your care.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h4 className="font-bold text-blue-600 mb-2">Patients</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">Full access to their own logs, trends, and care plans. Ability to authorize or revoke professional access.</p>
              </div>
              <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h4 className="font-bold text-emerald-600 mb-2">Doctors</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">Access to medical history, vital trends, and diagnostic logs for patients under their direct clinical supervision.</p>
              </div>
              <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h4 className="font-bold text-purple-600 mb-2">Nurses</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">Access to daily logs, symptom updates, and medication schedules to coordinate routine care interventions.</p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                <FileSignature className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold">3. Data Ownership & Rights</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              We believe the patient is the ultimate owner of their health information. Under our framework:
            </p>
            <ul className="space-y-4">
              <li className="flex gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 flex-shrink-0"></div>
                <p className="text-slate-600 dark:text-slate-400"><strong className="text-slate-900 dark:text-slate-100">The Right to Access:</strong> You can download a full copy of your health data at any time.</p>
              </li>
              <li className="flex gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 flex-shrink-0"></div>
                <p className="text-slate-600 dark:text-slate-400"><strong className="text-slate-900 dark:text-slate-100">The Right to Correction:</strong> You can request updates to any inaccurate information in your profile.</p>
              </li>
              <li className="flex gap-4">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2.5 flex-shrink-0"></div>
                <p className="text-slate-600 dark:text-slate-400"><strong className="text-slate-900 dark:text-slate-100">The Right to Erasure:</strong> You can request the deletion of your account and all associated personal health data, subject to local medical record retention laws.</p>
              </li>
            </ul>
          </section>

          {/* Section 5 */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Globe2 className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold">4. Compliance & Standards</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              I-CAMS is designed to meet and exceed digital health standards. We are committed to aligning with:
            </p>
            <ul className="bg-slate-100 dark:bg-slate-900 p-8 rounded-2xl space-y-3">
              <li className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                The <strong className="text-slate-900 dark:text-white">Personal Data Protection Act (No. 9 of 2022)</strong> of Sri Lanka.
              </li>
              <li className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                International healthcare data standards (HIPAA & GDPR principles).
              </li>
              <li className="text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                Ministry of Health guidelines for digital health intervention.
              </li>
            </ul>
          </section>
        </div>

        <div className="mt-20 p-10 bg-blue-50 dark:bg-blue-900/20 rounded-[2rem] border border-blue-100 dark:border-blue-800 text-center">
          <h3 className="text-2xl font-bold mb-4">Questions about your privacy?</h3>
          <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-xl mx-auto">
            Our Data Protection Officer is here to help. Contact us for any privacy-specific inquiries.
          </p>
          <Link to="/contact" className="inline-block bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-95">
            Contact DPO
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
