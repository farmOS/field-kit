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
    style0() {
      return {
        marginTop: `-${this._space}`,
        marginLeft: `-${this._space}`,
      };
    },
    style1() {
      return {
        display: 'flex',
        flexFlow: 'row wrap',
        justifyContent: 'start',
      };
    },
    style2() {
      return {
        flex: `0 0 ${100 / this._columns}%`,
      };
    },
    style3() {
      return {
        paddingTop: `${this._space}`,
        paddingLeft: `${this._space}`,
        height: '100%',
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
      { style: this.style0 },
      [h(
        'div',
        { style: this.style1 },
        this.$slots.default.map(node => h(
          'div',
          { style: this.style2 },
          [h(
            'div',
            { style: this.style3 },
            [node],
          )],
        )),
      )],
    );
  },
};
</script>
