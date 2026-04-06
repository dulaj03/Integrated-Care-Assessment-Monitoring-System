import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowRight, ArrowUpRight, Instagram, Linkedin, Facebook } from 'lucide-react';

// Custom X (Twitter) Icon Component
const XIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.514l-5.106-6.693-5.829 6.693h-3.308l7.699-8.876-8.156-10.624h6.508l4.632 6.124 5.288-6.124zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export function Footer() {
  const { t } = useTranslation();
  
  return (
    <footer className="w-full">
      {/* Contact Banner Section */}
      <div className="bg-white dark:bg-slate-900 py-24 px-6 sm:px-12 lg:px-24 border-t border-slate-100 dark:border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">

          {/* Left Label */}
          <div className="hidden md:block w-32">
            <span className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase flex items-center gap-2">
              {t('footer.heardEnough')} <ArrowRight className="w-4 h-4" />
            </span>
          </div>

          {/* Center Heading */}
          <div className="flex-1 text-center">
            <h2 className="text-5xl md:text-7xl font-light tracking-tight text-slate-900 dark:text-white relative inline-block">
              {t('footer.contactUs')}
              <span className="absolute bottom-2 left-0 w-full h-3 bg-[#0040ff] dark:bg-blue-600 -z-10 opacity-60"></span>
            </h2>
          </div>

          {/* Right Button */}
          <div className="w-32 flex justify-end">
            <Link
              to="/contact"
              className="group flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#0040ff] hover:scale-105 dark:bg-blue-600 dark:hover:bg-blue-700 transition-transform duration-300"
            >
              <ArrowRight className="w-6 h-6 md:w-8 md:h-8 text-white group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Main Footer Section */}
      <div className="bg-[#111111] dark:bg-slate-950 text-white py-20 px-6 sm:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-20">
            {/* Brand / Tagline */}
            <div>
              <h3 className="text-3xl md:text-4xl font-medium leading-tight max-w-md">
                {t('footer.integratedCare')}
              </h3>
            </div>

            {/* Newsletter / CTA */}
            <div className="lg:pl-12">
              <p className="text-xs font-semibold tracking-wider text-gray-500 dark:text-gray-400 uppercase mb-4">
                {t('footer.stayUpdated')}
              </p>
              <Link to="/register" className="inline-flex items-center text-lg font-medium hover:text-[#0040ff] dark:hover:text-blue-500 transition-colors group">
                {t('footer.signUpNewsletter')}
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 text-sm text-gray-400 dark:text-gray-500">
            {/* Location 1 */}
            <div className="space-y-4">
              <h4 className="text-white text-xs font-semibold tracking-wider uppercase mb-6">{t('footer.headquarters')}</h4>
              <p className="hover:text-white dark:hover:text-gray-300 transition-colors cursor-pointer">infoicams123@gmail.com</p>
              <p>+94 11 234 5678</p>
              <p>123 Healthcare Ave,<br />Colombo 03, Sri Lanka</p>
              <a href="#" className="inline-flex items-center hover:text-white dark:hover:text-gray-300 transition-colors mt-2">
                {t('footer.seeOnMap')} <ArrowUpRight className="ml-1 w-3 h-3" />
              </a>
            </div>

            {/* Location 2 */}
            <div className="space-y-4">
              <h4 className="text-white text-xs font-semibold tracking-wider uppercase mb-6">{t('footer.support')}</h4>
              <p className="hover:text-white dark:hover:text-gray-300 transition-colors cursor-pointer">infoicams123@gmail.com</p>
              <p>+94 11 234 9999</p>
              <p>456 Tech Park,<br />Kandy, Sri Lanka</p>
              <a href="#" className="inline-flex items-center hover:text-white dark:hover:text-gray-300 transition-colors mt-2">
                {t('footer.seeOnMap')} <ArrowUpRight className="ml-1 w-3 h-3" />
              </a>
            </div>

            {/* Spacer for layout matching */}
            <div className="hidden lg:block"></div>

            {/* Socials */}
            <div>
              <h4 className="text-white text-xs font-semibold tracking-wider uppercase mb-6">{t('footer.followUs')}</h4>
              <div className="flex gap-6">
                <a href="#" className="hover:text-[#0040ff] dark:hover:text-blue-500 transition-colors"><Facebook className="w-5 h-5" /></a>
                <a href="#" className="hover:text-[#0040ff] dark:hover:text-blue-500 transition-colors"><XIcon /></a>
                <a href="#" className="hover:text-[#0040ff] dark:hover:text-blue-500 transition-colors"><Instagram className="w-5 h-5" /></a>
                <a href="#" className="hover:text-[#0040ff] dark:hover:text-blue-500 transition-colors"><Linkedin className="w-5 h-5" /></a>
              </div>
            </div>
          </div>

          <div className="mt-20 pt-8 border-t border-gray-800 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600 dark:text-gray-500">
            <div className="flex flex-col items-center md:items-start gap-2">
              <p>&copy; {new Date().getFullYear()} I-CAMS. All rights reserved.</p>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Design and Developed by Dulaj Hewage</p>
            </div>
            <div className="flex gap-6 mt-6 md:mt-0">
              <Link to="/privacy" className="hover:text-gray-400 dark:hover:text-gray-400 transition-colors">{t('footer.privacyPolicy')}</Link>
              <Link to="/terms" className="hover:text-gray-400 dark:hover:text-gray-400 transition-colors">{t('footer.termsOfService')}</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
