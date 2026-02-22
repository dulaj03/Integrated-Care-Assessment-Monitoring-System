import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files
import enCommon from './locales/en/common.json';
import siCommon from './locales/si/common.json';
import taCommon from './locales/ta/common.json';

// Define resource type for TypeScript support
export const resources = {
  en: { translation: enCommon },
  si: { translation: siCommon },
  ta: { translation: taCommon },
} as const;

const ns = ['translation'];
export const defaultNS = 'translation';

// Get browser language
const getBrowserLanguage = (): string => {
  if (typeof window === 'undefined') return 'en';

  const browserLang = navigator.language.split('-')[0];
  const supportedLanguages = ['en', 'si', 'ta'];

  return supportedLanguages.includes(browserLang) ? browserLang : 'en';
};

// Get saved language from localStorage or use browser language
const getSavedLanguage = (): string => {
  if (typeof window === 'undefined') return 'en';

  const saved = localStorage.getItem('i18nextLng');
  return saved || getBrowserLanguage();
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    ns,
    defaultNS,
    lng: getSavedLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes XSS
    },
    react: {
      useSuspense: false, // Disable suspense for better compatibility
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
