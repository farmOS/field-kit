import translations from './translations';
import { setLocale, setTranslations } from './t';

const locales = Object.keys(translations);
const languages = Object.entries(translations)
  .map(([code, { name }]) => ({ code, name }));

export default {
  state: {
    locale: 'en',
    languages,
  },
  mutations: {
    setLocale(state, locale) {
      if (locale === 'en' || locales.includes(locale)) {
        state.locale = locale;
        setLocale(locale);
      } else {
        // eslint-disable-next-line no-console
        console.warn(`No translation provided for language code ${locale}.`);
      }
    },
    setTranslations(state, ts) {
      setTranslations(ts);
      state.languages = Object.entries(ts)
        .map(([code, { name }]) => ({ code, name }));
    },
  },
};
