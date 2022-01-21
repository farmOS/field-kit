// A Vue mixin for adding responsive props to a component.
export const responsiveProps = {
  props: {
    breakpoints: {
      type: Array,
      default() {
        return [0, 740, 992];
      },
    },
  },
  data() {
    return {
      bpIndex: 0,
    };
  },
  created() {
    window.addEventListener('resize', this.calcBpIndex);
    this.calcBpIndex();
  },
  beforeUnmount() {
    window.removeEventListener('resize', this.calcBpIndex);
  },
  methods: {
    calcBpIndex() {
      const bpMatches = bp => window.innerWidth >= bp;
      const breakpoint = Math.max(...this.breakpoints.filter(bpMatches));
      this.bpIndex = this.breakpoints.indexOf(breakpoint);
    },
  },
};

// A helper function for mapping responsive props (arrays) to primitive computed
// values, reactively, based on the current bpIndex.
export const mapResponsiveProps = props => Object.entries(props)
  .reduce((computed, [key, prop]) => ({
    ...computed,
    [key]: (vm) => {
      if (Array.isArray(vm[prop])) {
        const highestIndex = vm.bpIndex > vm[prop].length - 1
          ? vm[prop].length - 1
          : vm.bpIndex;
        return vm[prop][highestIndex];
      }
      return vm[prop];
    },
  }), {});

// Maps enumerable props to their primitive values used as attrs or inline styles.
export const mapResponsiveEnums = props => Object.entries(props)
  .reduce((computed, [prop, enums]) => ({
    ...computed,
    [`_${prop}`]: (vm) => {
      if (Array.isArray(vm[prop])) {
        const highestIndex = vm.bpIndex > vm[prop].length - 1
          ? vm[prop].length - 1
          : vm.bpIndex;
        const key = vm[prop][highestIndex];
        return enums[key];
      }
      const key = vm[prop];
      return enums[key];
    },
  }), {});

export const responsiveValidator = enums => val => (
  Array.isArray(val)
    ? val.every(v => enums.includes(v))
    : enums.includes(val)
);
