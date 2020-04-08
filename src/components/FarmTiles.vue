<script>
/* eslint-disable no-underscore-dangle */
export default {
  name: 'FarmTiles',
  props: {
    columns: {
      type: [Number, Array],
      default: 3,
    },
    space: {
      type: [String, Array],
      default: '1rem',
    },
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
  beforeDestroy() {
    window.removeEventListener('resize', this.calcBpIndex);
  },
  computed: {
    _columns() {
      return Array.isArray(this.columns)
        ? this.columns[this.bpIndex]
        : this.columns;
    },
    _space() {
      return Array.isArray(this.space)
        ? this.space[this.bpIndex]
        : this.space;
    },
    style() {
      return {
        display: 'flex',
        flexFlow: 'row wrap',
        justifyContent: this.$slots.default.length < this._columns
          ? 'center'
          : 'space-between',
      };
    },
    childStyle() {
      return {
        flex: `0 0 calc(${100 / this._columns}% - calc(${(this._columns - 1) / this._columns} * ${this._space}))`,
        marginBottom: this._space,
        marginRight: this.$slots.default.length < this._columns
          ? this._space
          : undefined,
      };
    },
  },
  methods: {
    calcBpIndex() {
      const bpMatches = bp => window.innerWidth >= bp;
      const breakpoint = Math.max(...this.breakpoints.filter(bpMatches));
      this.bpIndex = this.breakpoints.indexOf(breakpoint);
    },
  },
  render(h) {
    return h(
      'div',
      { class: 'farm-tiles', style: this.style },
      this.$slots.default
        .map(node => h('div', { style: this.childStyle }, [node])),
    );
  },
};
</script>
