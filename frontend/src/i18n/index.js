/**
 * I18n Context and Hook
 * Provides language switching and translation functionality
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import translations from './translations';

const I18nContext = createContext();

export const I18nProvider = ({ children, defaultLanguage = 'en' }) => {
  const [language, setLanguage] = useState(defaultLanguage);

  const t = useCallback(
    (key) => {
      const keys = key.split('.');
      let value = translations[language];

      for (const k of keys) {
        value = value?.[k];
      }

      return value || key;
    },
    [language]
  );

  const changeLanguage = useCallback((lang) => {
    if (translations[lang]) {
      setLanguage(lang);
      localStorage.setItem('i18n_language', lang);
    }
  }, []);

  const value = {
    language,
    t,
    changeLanguage,
    availableLanguages: {
      en: 'English',
      si: 'සිංහල',
      ta: 'தமிழ்',
    },
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
};

export default I18nContext;
