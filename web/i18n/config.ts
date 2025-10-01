import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      navbar: {
        login: "Log in",
        start: "Start Composing",
        features: "Features",
      },
      language: {
        label: "Language",
        english: "English",
        hindi: "हिंदी",
        punjabi: "ਪੰਜਾਬੀ",
      },
    },
  },
  hi: {
    translation: {
      navbar: {
        login: "लॉग इन",
        start: "शुरू करें",
        features: "विशेषताएँ",
      },
      language: {
        label: "भाषा",
        english: "English",
        hindi: "हिंदी",
        punjabi: "ਪੰਜਾਬੀ",
      },
    },
  },
  pa: {
    translation: {
      navbar: {
        login: "ਲਾਗ ਇਨ",
        start: "ਸ਼ੁਰੂ ਕਰੋ",
        features: "ਫੀਚਰ",
      },
      language: {
        label: "ਭਾਸ਼ਾ",
        english: "English",
        hindi: "ਹਿੰਦੀ",
        punjabi: "ਪੰਜਾਬੀ",
      },
    },
  },
} as const;

if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources,
    lng: "en",
    fallbackLng: "en",
    interpolation: { escapeValue: false },
    returnEmptyString: false,
  });
}

export default i18n;
