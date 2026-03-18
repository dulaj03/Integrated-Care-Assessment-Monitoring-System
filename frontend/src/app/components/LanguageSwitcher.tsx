import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { motion } from 'motion/react';
import { LanguageCode, saveLanguagePreference } from '../hooks/useTranslationTyped';

/**
 * LanguageSwitcher Component
 * Displays language selection buttons for English, Sinhala, and Tamil
 * Matches existing UI styles and sizes
 */
export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const languages: Array<{ code: LanguageCode; label: string; nativeLabel: string }> = [
    { code: 'en', label: 'English', nativeLabel: 'English' },
    { code: 'si', label: 'Sinhala', nativeLabel: 'සිංහල' },
    { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்' },
  ];

  const handleLanguageChange = (langCode: LanguageCode) => {
    i18n.changeLanguage(langCode);
    saveLanguagePreference(langCode);
  };

  useEffect(() => {
    // Update HTML lang attribute for accessibility
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <div className="flex flex-wrap gap-2 sm:gap-3">
      {languages.map((lang) => (
        <motion.button
          key={lang.code}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleLanguageChange(lang.code)}
          className={`px-4 sm:px-6 py-2 sm:py-3 rounded-md font-medium text-sm sm:text-base transition-all duration-200 ${i18n.language === lang.code
            ? 'bg-blue-600 dark:bg-blue-700 text-white shadow-lg dark:shadow-lg dark:shadow-blue-900/30'
            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 border border-blue-300 dark:border-blue-700'
          }`}
          aria-label={`Switch to ${lang.nativeLabel}`}
          aria-current={i18n.language === lang.code ? 'true' : 'false'}
        >
          {lang.nativeLabel}
        </motion.button>
      ))}
    </div>
  );
}
