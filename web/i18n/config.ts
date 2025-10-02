import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en.json";
import hi from "./hi.json";
import pa from "./pa.json";

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  pa: { translation: pa },
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
