<template>
  <div class="farm-tabs">

    <div class="tab-bar">
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

    <div
      class="tab-content-container"
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
</template>

<script>
export default {
  name: 'FarmTabs',
  props: {
    tabs: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      tabSelected: 0,
      tabScrollPositions: this.tabs.map(() => 0),
    };
  },
  computed: {
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
  },
};
</script>

<style scoped>
.farm-tabs {
  position: relative;
  height: 100vh;
  width: 100vw;
  overflow-x: hidden;
}

.tab-bar {
  display: flex;
  flex-flow: row nowrap;
  position: fixed;
  top: 3rem;
  height: 3rem;
  width: 100%;
  z-index: 1000;
  background-color: var(--primary);
  box-shadow: var(--shadow-strong);
}

.tab {
  font-size: 1rem;
  line-height: 1.5rem;
  color: var(--white);
  transition: color .5s;
  text-align: center;
  text-transform: uppercase;
  padding-top: 1rem;
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
  display: flex;
  transition: left .5s;
  position: absolute;
  top: 3rem;
}
</style>
