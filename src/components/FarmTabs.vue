<template>
  <div class="tab-container">

    <div class="tab-bar">
      <div
        v-for="(tab, i) in tabs"
        :key="`tab-${i}`"
        class="tab"
        :class="{ selected: tabSelected === i }"
        :style="tabStyle"
        @click="tabSelected = i">
        <h5>{{tab}}</h5>
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
};
</script>

<style scoped>
.tab-container {
  position: relative;
  height: 100%;
  width: 100%;
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
  background-color: var(--farmos-green-dark);
  box-shadow: -2px 0px 15px rgba(0, 0, 0, .5);
}

.tab {
  font-size: 1rem;
  line-height: 1.5rem;
  color: white;
  transition: color .5s;
  text-align: center;
  text-transform: uppercase;
  padding-top: 1rem;
}

.tab:not(.selected) {
  color: rgba(255, 255, 255, .5);
  transition: color .5s;
}

.tab-indicator {
  position: absolute;
  top: calc(3rem - 2px);
  transition: left .5s;
  z-index: 1001;
  height: 2px;
  background-color: white;
}

.tab-content-container {
  display: flex;
  transition: left .5s;
  position: absolute;
  top: 3rem;
}
</style>
