import store from '../store';
import { $t } from '../store/l10n/t';

// A global Vue mixin for translating strings in the markup.
export default {
  computed: {
    locale() {
      // TODO: figure out if this is where the locale will come from.
      return store.state.profile.user.langcode;
    },
  },
  methods: { $t },
  watch: {
    locale() {
      this.$forceUpdate();
    },
  },
};
