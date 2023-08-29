<script>
import { validateAction } from '@farmos.org/field-components/src/components/FarmAppBar.vue';
import {
  setNav, setTitle, setActions, reset,
} from './AppBar.vue';

export default {
  name: 'AppBarOptions',
  props: {
    nav: {
      type: String,
      default: 'menu',
    },
    title: String,
    actions: {
      type: Array,
      default: () => [],
      validator(val) {
        return Array.isArray(val) && val.every(validateAction);
      },
    },
  },
  created() {
    setNav(this.nav);
    setTitle(this.title);
    setActions(this.actions);
  },
  beforeUnmount() {
    reset();
  },
  watch: {
    nav(str) {
      setNav(str);
    },
    title(str) {
      setTitle(str);
    },
    actions(arr) {
      setActions(arr);
    },
  },
  // Render null to suppress warnings for missing template or render function.
  render: () => null,
};
</script>
