/**
 * Example Page Component showing multilingual best practices
 * This is a reference implementation for other developers
 */

import { useTranslation } from 'react-i18next';
import { useTranslationTyped } from '../hooks/useTranslationTyped';
import { motion } from 'motion/react';
import { LanguageSwitcher } from '../components/LanguageSwitcher';

export function I18nExamplePage() {
  const { t, i18n } = useTranslationTyped();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto mb-12"
      >
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
          i18n Implementation Guide
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">
          Current Language: {i18n.language.toUpperCase()}
        </p>
      </motion.div>

      {/* Language Switcher */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-4xl mx-auto mb-12 p-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg"
      >
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
          Language Selector
        </h2>
        <LanguageSwitcher />
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
          The language preference is automatically saved to localStorage and
          persists across page refreshes.
        </p>
      </motion.div>

      {/* Usage Examples */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        {/* Example 1: Basic Usage */}
        <div className="p-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            Example 1: Using useTranslation Hook
          </h3>
          <pre className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg overflow-x-auto text-sm mb-4 text-slate-800 dark:text-slate-200">
            {`import { useTranslation } from 'react-i18next';

export function MyComponent() {
  const { t, i18n } = useTranslation();
  
  return (
    <div>
      <h1>{t('hero.title')}</h1>
      <p>{t('hero.description')}</p>
      <button onClick={() => i18n.changeLanguage('si')}>
        Change to Sinhala
      </button>
    </div>
  );
}`}
          </pre>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              ✓ This is the recommended approach for most components.
            </p>
          </div>
        </div>

        {/* Example 2: Custom Hook */}
        <div className="p-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            Example 2: Using Custom Typed Hook
          </h3>
          <pre className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg overflow-x-auto text-sm mb-4 text-slate-800 dark:text-slate-200">
            {`import { useTranslationTyped, saveLanguagePreference } from '../hooks/useTranslationTyped';

export function MyComponent() {
  const { t, i18n } = useTranslationTyped();
  
  const handleChange = (lang) => {
    i18n.changeLanguage(lang);
    saveLanguagePreference(lang);
  };
  
  return <button onClick={() => handleChange('ta')}>{t('common.tamil')}</button>;
}`}
          </pre>
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg">
            <p className="text-sm text-green-900 dark:text-green-100">
              ✓ Provides type safety and utility functions for language
              management.
            </p>
          </div>
        </div>

        {/* Example 3: Key Structure */}
        <div className="p-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            Example 3: Translation File Structure (Recommended)
          </h3>
          <pre className="bg-slate-100 dark:bg-slate-900 p-4 rounded-lg overflow-x-auto text-sm mb-4 text-slate-800 dark:text-slate-200">
            {`{
  "common": {
    "appName": "I-CAMS",
    "getStarted": "Get Started",
    "buttons": {
      "submit": "Submit",
      "cancel": "Cancel"
    }
  },
  "auth": {
    "login": {
      "title": "Login",
      "email": "Email Address",
      "errors": {
        "invalidEmail": "Please enter a valid email"
      }
    }
  },
  "messages": {
    "welcome": "Welcome, {{name}}!",
    "itemCount": "You have {{count}} items"
  }
}`}
          </pre>
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 p-4 rounded-lg">
            <p className="text-sm text-purple-900 dark:text-purple-100">
              ✓ Organize keys hierarchically for better maintainability.
            </p>
          </div>
        </div>

        {/* Current Translations Display */}
        <div className="p-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            Current Translations (Active Language: {i18n.language.toUpperCase()})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
              <p className="font-semibold text-slate-900 dark:text-white mb-2">
                Hero Section
              </p>
              <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                <li>
                  <strong>Title:</strong> {t('hero.title')}
                </li>
                <li>
                  <strong>Highlight:</strong> {t('hero.titleHighlight')}
                </li>
              </ul>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg">
              <p className="font-semibold text-slate-900 dark:text-white mb-2">
                Common Buttons
              </p>
              <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                <li>
                  <strong>Get Started:</strong> {t('common.getStarted')}
                </li>
                <li>
                  <strong>Learn More:</strong> {t('common.learnMore')}
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Best Practices Checklist */}
        <div className="p-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
            Best Practices Checklist
          </h3>
          <ul className="space-y-2">
            {[
              'Always use useTranslation hook from react-i18next',
              'Store language preference in localStorage',
              'Detect browser language on initial load',
              'Use hierarchical key structure in JSON files',
              'Keep translations organized by feature/namespace',
              'Test all languages for UI layout issues',
              'Validate all keys exist in all language files',
              'Use interpolation for dynamic content',
              'Implement RTL support for right-to-left languages',
              'Document translation conventions for team members',
            ].map((item, i) => (
              <label key={i} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <span className="text-slate-700 dark:text-slate-300">
                  {item}
                </span>
              </label>
            ))}
          </ul>
        </div>

        {/* Common Pitfalls */}
        <div className="p-8 bg-red-50 dark:bg-red-900/20 rounded-xl shadow-lg border border-red-200 dark:border-red-800">
          <h3 className="text-xl font-bold text-red-900 dark:text-red-100 mb-4">
            Common Pitfalls to Avoid
          </h3>
          <ul className="space-y-3">
            {[
              'Hardcoding text strings instead of using translation keys',
              'Forgetting to add translations to all language files',
              'Using inconsistent key naming conventions',
              'Not testing UI in all supported languages',
              'Storing language preference only in state (not localStorage)',
              'Missing browser language detection on first visit',
              'Not handling missing translations gracefully',
              'Using i18n.language before it is fully initialized',
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-red-600 dark:text-red-400 font-bold">
                  ✗
                </span>
                <span className="text-red-900 dark:text-red-100">{item}</span>
              </div>
            ))}
          </ul>
        </div>
      </motion.div>

      {/* Footer Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="max-w-4xl mx-auto mt-12 p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-center text-sm text-blue-900 dark:text-blue-100"
      >
        <p>
          For more detailed documentation, see{' '}
          <code className="bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">
            MULTILINGUAL_GUIDE.md
          </code>
        </p>
      </motion.div>
    </div>
  );
}
