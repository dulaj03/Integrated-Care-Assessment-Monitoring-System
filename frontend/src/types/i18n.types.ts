/**
 * Type-safe translations for i18next
 * This file provides TypeScript support for translation keys
 */

import enCommon from '../locales/en/common.json';

// Infer the structure of translation keys from the English translations
export type TranslationKeys = typeof enCommon;

/**
 * Utility type for accessing nested translation keys
 * Usage: KeyPath<'hero.title'> // Valid
 */
export type KeyPath = 'common.appName'
  | 'common.getStarted'
  | 'common.learnMore'
  | 'common.language'
  | 'common.english'
  | 'common.sinhala'
  | 'common.tamil'
  | 'hero.title'
  | 'hero.titleHighlight'
  | 'hero.description'
  | 'overview.heading'
  | 'overview.content'
  | 'features.sectionLabel'
  | 'features.heading'
  | 'features.description'
  | 'navigation.home'
  | 'navigation.about'
  | 'navigation.features'
  | 'navigation.contact'
  | 'navigation.login'
  | 'navigation.register'
  | 'footer.copyright'
  | 'footer.privacyPolicy'
  | 'footer.termsOfService';

/**
 * Supported language codes
 */
export type SupportedLanguage = 'en' | 'si' | 'ta';

/**
 * Language metadata
 */
export interface LanguageMetadata {
  code: SupportedLanguage;
  nativeName: string;
  englishName: string;
  direction: 'ltr' | 'rtl';
}

export const LANGUAGES: Record<SupportedLanguage, LanguageMetadata> = {
  en: {
    code: 'en',
    nativeName: 'English',
    englishName: 'English',
    direction: 'ltr',
  },
  si: {
    code: 'si',
    nativeName: 'සිංහල',
    englishName: 'Sinhala',
    direction: 'ltr',
  },
  ta: {
    code: 'ta',
    nativeName: 'தமிழ்',
    englishName: 'Tamil',
    direction: 'ltr',
  },
};
