/**
 * Translation utilities and helpers
 * Provides common functions for working with translations
 */

import { SupportedLanguage, LANGUAGES } from '../types/i18n.types';

/**
 * Flatten nested translation object to dot-notation keys
 * @example
 * flattenKeys({ common: { appName: "I-CAMS" } })
 * // Returns: { "common.appName": "I-CAMS" }
 */
export const flattenKeys = (
  obj: Record<string, unknown>,
  prefix = ''
): Record<string, string> => {
  const result: Record<string, string> = {};

  Object.entries(obj).forEach(([key, value]) => {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'string') {
      result[newKey] = value;
    } else if (typeof value === 'object' && value !== null) {
      Object.assign(result, flattenKeys(value as Record<string, unknown>, newKey));
    }
  });

  return result;
};

/**
 * Compare translation keys across multiple language files
 * Useful for identifying missing translations
 */
export const validateTranslationKeys = (
  translations: Record<SupportedLanguage, unknown>
): { missing: string[]; extra: string[]; valid: boolean } => {
  const allLanguages = Object.keys(translations) as SupportedLanguage[];

  if (allLanguages.length === 0) {
    return { missing: [], extra: [], valid: true };
  }

  const referenceKeys = new Set(
    Object.keys(flattenKeys(translations[allLanguages[0]] as Record<string, unknown>))
  );
  const issues = { missing: new Set<string>(), extra: new Set<string>() };

  // Check each language against the reference
  allLanguages.slice(1).forEach((lang) => {
    const langKeys = new Set(Object.keys(flattenKeys(translations[lang] as Record<string, unknown>)));

    // Find missing keys
    referenceKeys.forEach((key) => {
      if (!langKeys.has(key)) {
        issues.missing.add(key);
      }
    });

    // Find extra keys
    langKeys.forEach((key) => {
      if (!referenceKeys.has(key)) {
        issues.extra.add(key);
      }
    });
  });

  return {
    missing: Array.from(issues.missing),
    extra: Array.from(issues.extra),
    valid: issues.missing.size === 0 && issues.extra.size === 0,
  };
};

/**
 * Get language display information
 */
export const getLanguageInfo = (langCode: SupportedLanguage) => {
  return LANGUAGES[langCode];
};

/**
 * Format language list for display
 */
export const getAvailableLanguagesList = (): Array<{
  code: SupportedLanguage;
  native: string;
  english: string;
  dir: 'ltr' | 'rtl';
}> => {
  return Object.entries(LANGUAGES).map(([code, info]) => ({
    code: code as SupportedLanguage,
    native: info.nativeName,
    english: info.englishName,
    dir: info.direction,
  }));
};

/**
 * Detect best matching language from browser locale
 * @example
 * detectBrowserLanguage() // 'en' | 'si' | 'ta' | 'en' (default)
 */
export const detectBrowserLanguage = (
  defaultLang: SupportedLanguage = 'en'
): SupportedLanguage => {
  if (typeof window === 'undefined') return defaultLang;

  const browserLang = navigator.language.split('-')[0].toLowerCase();
  const supportedLanguages: SupportedLanguage[] = ['en', 'si', 'ta'];

  return (supportedLanguages.includes(browserLang as SupportedLanguage)
    ? (browserLang as SupportedLanguage)
    : defaultLang);
};

/**
 * Get text direction for a language
 */
export const getLanguageDirection = (
  langCode: SupportedLanguage
): 'ltr' | 'rtl' => {
  return LANGUAGES[langCode]?.direction || 'ltr';
};

/**
 * Format language name for display
 * @example
 * formatLanguageName('si') // "සිංහල (Sinhala)"
 */
export const formatLanguageName = (
  langCode: SupportedLanguage,
  format: 'native' | 'english' | 'both' = 'native'
): string => {
  const info = LANGUAGES[langCode];

  switch (format) {
  case 'native':
    return info.nativeName;
  case 'english':
    return info.englishName;
  case 'both':
    return `${info.nativeName} (${info.englishName})`;
  default:
    return info.nativeName;
  }
};

/**
 * Check if a language is RTL
 */
export const isRTLLanguage = (langCode: SupportedLanguage): boolean => {
  return getLanguageDirection(langCode) === 'rtl';
};

/**
 * Get complementary direction for adaptive styling
 */
export const getAdaptiveSpacing = (
  langCode: SupportedLanguage,
  direction: 'left' | 'right'
): 'left' | 'right' => {
  if (isRTLLanguage(langCode)) {
    return direction === 'left' ? 'right' : 'left';
  }
  return direction;
};

/**
 * Create a language switcher config for component props
 */
export const createLanguageSwitcherConfig = () => {
  return {
    languages: getAvailableLanguagesList(),
    fallback: 'en' as SupportedLanguage,
    storageKey: 'i18nextLng',
  };
};

/**
 * Validate if a language code is supported
 */
export const isSupportedLanguage = (
  langCode: string
): langCode is SupportedLanguage => {
  return ['en', 'si', 'ta'].includes(langCode);
};

/**
 * Safe language change with validation
 */
export const validateAndChangeLang = (
  langCode: unknown,
  defaultLang: SupportedLanguage = 'en'
): SupportedLanguage => {
  if (typeof langCode === 'string' && isSupportedLanguage(langCode)) {
    return langCode;
  }
  return defaultLang;
};

/**
 * Export translations statistics
 */
export const getTranslationStats = (translations: Record<SupportedLanguage, unknown>) => {
  const stats = {} as Record<SupportedLanguage, number>;

  Object.entries(translations).forEach(([lang, trans]) => {
    const flattened = flattenKeys(trans as Record<string, unknown>);
    stats[lang as SupportedLanguage] = Object.keys(flattened).length;
  });

  return {
    stats,
    total: Object.values(stats).reduce((a, b) => a + b, 0),
    average:
      Object.values(stats).reduce((a, b) => a + b, 0) /
      Object.keys(stats).length,
  };
};
