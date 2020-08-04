import { mapState } from 'vuex';

// A global Vue mixin for translating strings in the markup.
export default {
  computed: mapState({
    _translations: state => state.l10n.translations,
    _locale: state => state.l10n.locale,
  }),
  methods: {
    $t(str) {
      const translation = this._translations[this._locale]?.[str];
      if (translation) { return translation; }
      return str;
    },
  },
};
