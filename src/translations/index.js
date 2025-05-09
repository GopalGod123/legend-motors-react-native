import {I18n} from 'i18n-js';
import en from './en.json';
import ar from './ar.json';
import zh from './zh.json';
import es from './es.json';
import ru from './ru.json';
import fr from './fr.json';

// Create i18n instance
const i18n = new I18n({
  en,
  ar,
  zh,
  es,
  ru,
  fr,
});

// Set default locale
i18n.defaultLocale = 'en';
i18n.enableFallback = true;

export default i18n;
