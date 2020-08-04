import translations from './translations';

const locales = Object.keys(translations);

export default {
  state: {
    translations,
    locale: 'en',
  },
  mutations: {
    setLocale(state, locale) {
      if (locale === 'en' || locales.includes(locale)) {
        state.locale = locale;
      } else {
        // eslint-disable-next-line no-console
        console.warn(`No translation provided for language code ${locale}.`);
      }
    },
  },
};
