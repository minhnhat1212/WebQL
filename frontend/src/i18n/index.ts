import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
// @ts-ignore
import vi from './vi.json';
// @ts-ignore
import en from './en.json';

const resources = {
  vi: { translation: vi },
  en: { translation: en },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'vi',
    fallbackLng: 'vi',
    interpolation: { escapeValue: false },
    detection: { order: ['localStorage', 'navigator'] },
  });

export default i18n; 