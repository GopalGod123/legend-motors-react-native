import {I18n} from 'i18n-js';
import en from './en.json';
import ar from './ar.json';

// Create i18n instance
const i18n = new I18n({
  en,
  ar,
});

// Set default locale
i18n.defaultLocale = 'en';
i18n.enableFallback = true;

export default i18n;
