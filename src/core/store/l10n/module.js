import { setLocale, setTranslations } from './t';
import farm from '../farmClient';

const enabledLocales = [
  {
    code: 'pt',
    aliases: ['pt-br', 'pt-pt'],
    language: 'pt',
    name: 'Portuguese, International',
    native: 'Português, Internacional',
  },
  {
    code: 'de',
    aliases: ['de-de', 'de-at'],
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
    updateLanguages({ commit }, response) {
      const token = JSON.parse(localStorage.getItem('token'));
      const setLangs = (res) => {
        const locale = res.user?.language;
        if (locale) {
          commit('setLocale', locale);
        }
        const langs = Object.values(res?.languages || {})
          .reduce((ls, lang, i, arr) => {
            const code = getCode(lang.language);
            if (code && code === lang.language) {
              return ls.concat(lang);
            }
            if (code && !arr.some(l => l.language === lang.language)) {
              return ls.concat(enabledLocales.find(l => l.code === code));
            }
            return ls;
          }, []);
        commit('setLanguages', langs);
        localStorage.setItem('languages', JSON.stringify(langs));
        langs.forEach(({ language }) => {
          const code = getCode(language);
          import(/* webpackChunkName: "l10n" */ `./translations/${code}.js`)
            .then(({ default: translations }) => {
              setTranslations(code, translations);
            });
        });
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
        langs.forEach(({ language }) => {
          const code = getCode(language);
          import(/* webpackChunkName: "l10n" */ `./translations/${code}.js`)
            .then(({ default: translations }) => {
              setTranslations(code, translations);
            });
        });
      }
    },
  },
};
