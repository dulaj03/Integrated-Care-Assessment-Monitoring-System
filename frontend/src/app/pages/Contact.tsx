import { Link } from 'react-router';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Building2,
  LifeBuoy,
  Languages,
  Clock,
  ExternalLink,
  Send
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/footer';
import { motion } from 'motion/react';
import { useTranslation } from 'react-i18next';

export function Contact() {
  const { t } = useTranslation();
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
            {t('contact.title')} <span className="text-blue-600 dark:text-blue-400">{t('contact.titleHelp')}</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-light leading-relaxed"
          >
            {t('contact.description')}
          </motion.p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-24">

        {/* Support Channels & General Message Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* General Message Form (Restored & Updated) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-10 border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                <Send className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold dark:text-white">{t('contact.sendMessage')}</h2>
            </div>
            <p className="text-slate-500 dark:text-slate-400 mb-8">
              {t('contact.messageDescription')}
            </p>
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('contact.fullName')}</label>
                  <input type="text" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-4 focus:ring-2 focus:ring-blue-500 dark:text-white" placeholder={t('contact.fullName')} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('contact.email')}</label>
                  <input type="email" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-4 focus:ring-2 focus:ring-blue-500 dark:text-white" placeholder={t('contact.email')} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('contact.messageContent')}</label>
                <textarea rows={5} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-4 focus:ring-2 focus:ring-blue-500 dark:text-white" placeholder={t('contact.messagePlaceholder')}></textarea>
              </div>
              <button type="submit" className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-12 rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95">
                {t('contact.send')}
              </button>
            </form>
          </motion.div>

          {/* Quick Contact & Info (Restored & Updated) */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm"
            >
              <h3 className="text-xl font-bold dark:text-white mb-6">Get in Touch</h3>
              <div className="space-y-6">
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Email Us</p>
                    <p className="text-slate-700 dark:text-slate-200 font-medium">info@i-cams.lk</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Call Us</p>
                    <p className="text-slate-700 dark:text-slate-200 font-medium">+94 11 234 5678</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 group">
                  <div className="w-10 h-10 bg-red-50 dark:bg-red-900/20 rounded-lg flex items-center justify-center text-red-600 transition-colors group-hover:bg-red-600 group-hover:text-white">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Visit Us</p>
                    <p className="text-slate-700 dark:text-slate-200 font-medium text-sm leading-tight">123 Healthcare Ave, Colombo 03</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-indigo-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-500/20"
            >
              <div className="flex items-center gap-3 mb-4">
                <Languages className="w-5 h-5" />
                <h3 className="font-bold">Multilingual Access</h3>
              </div>
              <p className="text-indigo-100 text-sm leading-relaxed mb-4">
                English, සිංහල, and தமிழ் support is available for all users.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Institutional Section (New Requirement) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="bg-slate-900 dark:bg-slate-900 rounded-[3rem] p-12 text-white overflow-hidden relative"
        >
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-blue-500/20 rounded-full text-blue-400 text-sm font-bold mb-6">
                <Building2 className="w-4 h-4 mr-2" />
                Institutional Partnerships
              </div>
              <h2 className="text-4xl font-bold mb-6 leading-tight">Implement I-CAMS in your Hospital</h2>
              <p className="text-slate-400 text-lg mb-8">
                Join our network of healthcare providers optimizing clinical outcomes through integrated monitoring.
                Our team provides full technical integration and clinical staff training.
              </p>
            </div>
            <form className="bg-white/5 backdrop-blur-md p-8 rounded-3xl border border-white/10 space-y-4" onSubmit={(e) => e.preventDefault()}>
              <input type="text" className="w-full bg-white/10 border-white/20 rounded-xl p-4 placeholder:text-white/40 focus:ring-blue-500 text-white" placeholder="Hospital Name" />
              <input type="text" className="w-full bg-white/10 border-white/20 rounded-xl p-4 placeholder:text-white/40 focus:ring-blue-500 text-white" placeholder="Contact Person" />
              <textarea className="w-full bg-white/10 border-white/20 rounded-xl p-4 placeholder:text-white/40 focus:ring-blue-500 text-white" placeholder="Integration Requirements" rows={3}></textarea>
              <button className="w-full bg-blue-600 hover:bg-blue-700 py-4 font-bold rounded-xl transition-all shadow-lg shadow-blue-500/30">
                Submit Institutional Request
              </button>
            </form>
          </div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>
        </motion.div>

        {/* Help Desk & Map Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-8 rounded-3xl border border-emerald-100 dark:border-emerald-800/50">
              <div className="flex items-center gap-4 mb-4 text-emerald-600 dark:text-emerald-400">
                <LifeBuoy className="w-6 h-6" />
                <h3 className="text-xl font-bold">Patient Help Desk</h3>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
                Encountering technical issues? Our 24/7 help desk ensures your health monitoring is never interrupted.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                  <Clock className="w-5 h-5 text-emerald-500" />
                  <span>24/7 Availability</span>
                </div>
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-medium">
                  <Mail className="w-5 h-5 text-emerald-500" />
                  <span>support@i-cams.lk</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="lg:col-span-2 h-96 bg-slate-200 dark:bg-slate-800 rounded-[2.5rem] overflow-hidden relative border border-slate-300 dark:border-slate-700 shadow-inner"
          >
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1000')] bg-cover opacity-60 grayscale"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent"></div>
            <div className="absolute inset-x-0 bottom-8 flex justify-center">
              <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg px-8 py-4 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-4">
                <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]"></div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white leading-none">I-CAMS Clinical Hub</p>
                  <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-bold">Colombo 03, SL</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="text-center">
          <Link to="/" className="inline-flex items-center px-8 py-4 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 font-bold transition-all shadow-sm">
            <ArrowLeft className="w-5 h-5 mr-3" />
            {t('navigation.returnHome')}
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
