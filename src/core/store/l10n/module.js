import { setLocale, setTranslations } from './t';
import farm from '../farmClient';

const enabledLocales = [
  'pt',
];

export default {
  state: {
    locale: 'en',
    languages: [],
  },
  mutations: {
    setLocale(state, locale) {
      if (locale === 'en' || enabledLocales.includes(locale)) {
        state.locale = locale;
        setLocale(locale);
        localStorage.setItem('locale', locale);
      } else {
        // eslint-disable-next-line no-console
        console.warn(`No translation provided for language code ${locale}.`);
      }
    },
    setLanguages(state, langs) {
      state.languages = langs;
    },
  },
  actions: {
    updateLanguages({ commit, state }, response) {
      const token = JSON.parse(localStorage.getItem('token'));
      const setLangs = (res) => {
        const locale = res.user?.language;
        const isEnabled = enabledLocales.includes(locale);
        const isNotInLanuages = !state.languages.some(l => l.code === locale);
        if (isEnabled && isNotInLanuages) {
          import(/* webpackChunkName: "l10n" */ `./translations/${locale}.js`)
            .then(({ default: translations }) => {
              setTranslations(locale, translations);
              const langs = state.languages.concat({
                code: locale,
                name: translations.name,
              });
              commit('setLanguages', langs);
              localStorage.setItem('languages', JSON.stringify(langs));
            });
        }
        if (locale === 'en') {
          commit('setLanguages', []);
          localStorage.setItem('languages', JSON.stringify([]));
        }
        return res;
      };
      if (response) {
        return setLangs(response);
      }
      if (token) {
        return farm().info().then(setLangs);
      }
      return null;
    },
    loadCachedLanguages({ commit }) {
      const locale = localStorage.getItem('locale');
      if (locale) {
        commit('setLocale', locale);
      }
      const langs = JSON.parse(localStorage.getItem('languages'));
      if (langs) {
        commit('setLanguages', langs);
        langs.forEach(({ code }) => {
          import(/* webpackChunkName: "l10n" */ `./translations/${code}.js`)
            .then(({ default: translations }) => {
              setTranslations(code, translations);
            });
        });
      }
    },
  },
};
