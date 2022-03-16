function translator(translations, locale) {
  const _translations = translations || {};
  let _locale = locale;

  return {
    $t(str) {
      const translation = _translations?.[_locale]?.strings?.[str];
      if (translation) { return translation; }
      return str;
    },
    setTranslations(code, t) {
      _translations[code] = t;
    },
    setLocale(l) {
      _locale = l;
    },
  };
}

export const { $t, setTranslations, setLocale } = translator();
