/**
 * Advanced LanguageSwitcher with Dropdown
 * Alternative component showing more languages or advanced controls
 * 
 * Usage: Import and use this component for more advanced language selection UI
 */

import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { LanguageCode, saveLanguagePreference } from '../hooks/useTranslationTyped';

interface AdvancedLanguageSwitcherProps {
  showNativeNames?: boolean;
  compact?: boolean;
}

export function AdvancedLanguageSwitcher({
  showNativeNames = true,
  compact = false,
}: AdvancedLanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const languages: Array<{ code: LanguageCode; label: string; nativeLabel: string }> = [
    { code: 'en', label: 'English', nativeLabel: 'English' },
    { code: 'si', label: 'Sinhala', nativeLabel: 'සිංහල' },
    { code: 'ta', label: 'Tamil', nativeLabel: 'தமிழ்' },
  ];

  const currentLang = languages.find((l) => l.code === i18n.language);
  const displayLabel = showNativeNames
    ? currentLang?.nativeLabel
    : currentLang?.label;

  const handleLanguageChange = (langCode: LanguageCode) => {
    i18n.changeLanguage(langCode);
    saveLanguagePreference(langCode);
    setIsOpen(false);
  };

  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  if (compact) {
    return (
      <div className="flex gap-2">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`px-2 py-1 text-sm rounded font-medium transition-colors ${i18n.language === lang.code
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {lang.label.substring(0, 2).toUpperCase()}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium border border-blue-300 dark:border-blue-700 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
      >
        {displayLabel}
        <ChevronDown
          className="w-4 h-4 transition-transform"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 min-w-[200px] rounded-md bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 shadow-lg z-50"
          >
            {languages.map((lang) => (
              <motion.button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full text-left px-4 py-3 transition-colors first:rounded-t-md last:rounded-b-md ${i18n.language === lang.code
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-semibold'
                  : 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
                whileHover={{ paddingLeft: '1.25rem' }}
              >
                <span className="flex items-center justify-between">
                  <span>
                    {showNativeNames ? lang.nativeLabel : lang.label}
                    {!showNativeNames && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                        ({lang.nativeLabel})
                      </span>
                    )}
                  </span>
                  {i18n.language === lang.code && (
                    <span className="text-blue-600 dark:text-blue-400">✓</span>
                  )}
                </span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
