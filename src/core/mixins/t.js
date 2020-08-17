import { mapState } from 'vuex';
import { $t } from '../store/l10n/t';

// A global Vue mixin for translating strings in the markup.
export default {
  computed: mapState({
    locale: state => state.l10n.locale,
  }),
  methods: { $t },
  watch: {
    locale() {
      this.$forceUpdate();
    },
  },
};
