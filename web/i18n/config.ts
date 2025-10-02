import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './languages/en.json';
import hi from './languages/hi.json';
import pa from './languages/pa.json';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  pa: { translation: pa },
} as const;

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    returnEmptyString: false,
  });
}

export default i18n;
