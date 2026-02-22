import { useTranslation } from 'react-i18next';

/**
 * Custom hook for type-safe translations
 * Usage: const { t, i18n } = useTranslationTyped();
 */
export const useTranslationTyped = () => {
  const result = useTranslation();
  return result;
};

export type LanguageCode = 'en' | 'si' | 'ta';

export const languages: Record<LanguageCode, string> = {
  en: 'English',
  si: 'සිංහල',
  ta: 'தமிழ்',
};

/**
 * Helper function to get available languages
 */
export const getAvailableLanguages = (): Array<{ code: LanguageCode; name: string }> => {
  return Object.entries(languages).map(([code, name]) => ({
    code: code as LanguageCode,
    name,
  }));
};

/**
 * Helper function to save language preference
 */
export const saveLanguagePreference = (lang: LanguageCode): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('i18nextLng', lang);
  }
};

/**
 * Helper function to get current language
 */
export const getCurrentLanguage = (): LanguageCode => {
  if (typeof window === 'undefined') return 'en';

  const saved = localStorage.getItem('i18nextLng');
  return (saved as LanguageCode) || 'en';
};
