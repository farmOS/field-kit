import { setLocale, setTranslations } from './t';
import farm from '../farmClient';

const enabledLocales = [
  {
    code: 'pt',
    aliases: ['pt-br', 'pt-pt'],
  },
];

const getCode = locale => enabledLocales.find(l => (
  l.code === locale || l.aliases.includes(locale)
))?.code;

export default {
  state: {
    locale: 'en',
    languages: [],
  },
  mutations: {
    setLocale(state, locale) {
      const code = getCode(locale) || 'en';
      state.locale = code;
      setLocale(code);
      localStorage.setItem('locale', code);
      if (locale !== 'en' && !getCode(locale)) {
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
        const code = getCode(res.user?.language);
        const isNotInLanuages = !state.languages.some(l => l.code === code);
        if (code && isNotInLanuages) {
          import(/* webpackChunkName: "l10n" */ `./translations/${code}.js`)
            .then(({ default: translations }) => {
              setTranslations(code, translations);
              const langs = state.languages.concat({
                code,
                name: translations.name,
              });
              commit('setLanguages', langs);
              localStorage.setItem('languages', JSON.stringify(langs));
            });
        }
        if (res.user?.language === 'en') {
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
