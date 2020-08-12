function translator(translations, locale) {
  let _translations = translations;
  let _locale = locale;

  return {
    $t(str) {
      const translation = _translations?.[_locale]?.strings?.[str];
      if (translation) { return translation; }
      return str;
    },
    setTranslations(t) {
      _translations = t;
    },
    setLocale(l) {
      _locale = l;
    },
  };
}

export const { $t, setTranslations, setLocale } = translator();
