import store from '../store';
import { $t } from '../store/l10n/t';

// A global Vue mixin for translating strings in the markup.
export default {
  computed: {
    locale() {
      return store.state.l10n.locale;
    },
  },
  methods: { $t },
  watch: {
    locale() {
      this.$forceUpdate();
    },
  },
};
