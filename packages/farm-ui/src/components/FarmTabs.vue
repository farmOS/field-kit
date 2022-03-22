<template>
  <div class="farm-tabs">

    <div class="tab-bar-container">
      <div class="tab-bar"
        :style="tabBarStyle">
        <div
          v-for="(tab, i) in tabs"
          :key="`tab-${i}`"
          class="tab"
          :class="{ selected: tabSelected === i }"
          :style="tabStyle"
          @click="switchTab(i)">
          <h4>{{tab}}</h4>
        </div>
        <div
          class="tab-indicator"
          :style="indicatorStyle"/>
      </div>
    </div>

    <farm-main ref="tabMain" @vnode-mounted="calcTabBarMarginX" space="none">
      <div
        class="tab-content-container">
        <div class="tab-content-slider"
          :style="contentContainerStyle">
          <div
            v-for="(tab, i) in tabs"
            :key="`tab-content-${i}`"
            class="tab-content"
            :style="contentStyle"
            :class="{ selected: tabSelected === i }">
            <slot :name="tab.toLowerCase()"></slot>
          </div>
        </div>
      </div>
    </farm-main>

  </div>
</template>

<script>
import { mapResponsiveProps, responsiveProps, responsiveValidator } from '../responsiveProps';

export default {
  name: 'FarmTabs',
  mixins: [responsiveProps],
  props: {
    tabs: {
      type: Array,
      required: true,
    },
    initTab: {
      type: String,
    },
    space: {
      type: [Array, String],
      default: 'none',
      validator: responsiveValidator([
        'xxxs', 'xxs', 'xs', 's',
        'm', 'l', 'xl', 'xxl', 'none',
      ]),
    },
  },
  data() {
    return {
      tabSelected: this.tabs.includes(this.initTab)
        ? this.tabs.indexOf(this.initTab)
        : 0,
      tabScrollPositions: this.tabs.map(() => 0),
      tabBarMarginX: 0,
    };
  },
  created() {
    window.addEventListener('resize', this.calcTabBarMarginX);
  },
  unmounted() {
    window.removeEventListener('resize', this.calcTabBarMarginX);
  },
  computed: {
    ...mapResponsiveProps({
      _space: 'space',
    }),
    tabBarStyle() {
      return { margin: `0 ${this.tabBarMarginX}px` };
    },
    tabStyle() {
      return { flex: `0 0 ${100 / this.tabs.length}%` };
    },
    indicatorStyle() {
      const percent = 100 / this.tabs.length;
      return {
        width: `${percent}%`,
        left: `${this.tabSelected * percent}%`,
      };
    },
    contentContainerStyle() {
      return {
        width: `${this.tabs.length * 100}%`,
        left: `-${100 * this.tabSelected}%`,
      };
    },
    contentStyle() {
      return {
        flex: `0 0 ${100 / this.tabs.length}%`,
        padding: `var(--${this._space})`,
      };
    },
  },
  methods: {
    switchTab(index) {
      const curTabPosition = this.$el.scrollTop;
      const nextTabPosition = this.tabScrollPositions[index];
      this.tabScrollPositions[this.tabSelected] = curTabPosition;
      this.tabSelected = index;
      setTimeout(() => {
        this.$el.scrollTo({ top: nextTabPosition, behavior: 'smooth' });
      }, 500);
    },
    // This is necessary to take into account the scrollbar in farm-main.
    calcTabBarMarginX() {
      const mainWidth = document.querySelector('main')?.clientWidth || 0;
      this.tabBarMarginX = Math.max(0, mainWidth - 1200) / 2;
    },
  },
};
</script>

<style scoped>
.farm-tabs {
  position: relative;
  top: 3rem;
  height: calc(100vh - 3rem);
  width: 100%;
  overflow-x: hidden;
  background-color: var(--light);
}

.tab-bar-container {
  position: fixed;
  top: 3rem;
  z-index: 1000;
  height: 3rem;
  width: 100%;
  background-color: var(--primary);
  box-shadow: var(--shadow-strong);
}

.tab-bar {
  position: relative;
  display: flex;
  flex-flow: row nowrap;
  height: 100%;
  width: 100%;
  max-width: 1200px;
}

.tab {
  font-size: 1rem;
  line-height: 1.5rem;
  color: var(--white);
  transition: color .5s;
  text-align: center;
  text-transform: uppercase;
  padding-top: 1rem;
  cursor: pointer;
}

.tab:not(.selected) {
  color: var(--white-transparent);
  transition: color .5s;
}

.tab-indicator {
  position: absolute;
  top: calc(3rem - 2px);
  transition: left .5s;
  z-index: 1001;
  height: 2px;
  background-color: var(--white);
}

.tab-content-container {
  overflow-x: hidden;
}

.tab-content-slider {
  position: relative;
  display: flex;
  transition: left .5s;
  width: 100%;
  height: 100%;
}
</style>
