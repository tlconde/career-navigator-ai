import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './en.json';
import ar from './ar.json';
import uk from './uk.json';
import fr from './fr.json';
import es from './es.json';
import tr from './tr.json';

export const languages = [
  { code: 'en', name: 'English', dir: 'ltr' },
  { code: 'ar', name: 'العربية', dir: 'rtl' },
  { code: 'uk', name: 'Українська', dir: 'ltr' },
  { code: 'fr', name: 'Français', dir: 'ltr' },
  { code: 'es', name: 'Español', dir: 'ltr' },
  { code: 'tr', name: 'Türkçe', dir: 'ltr' },
] as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
      uk: { translation: uk },
      fr: { translation: fr },
      es: { translation: es },
      tr: { translation: tr },
    },
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

export default i18n;
