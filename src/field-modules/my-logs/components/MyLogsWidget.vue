<template>
  <div>
    <ul>
      <li class="heading">LATE</li>
      <li class="log late">Harvest 8/10/2020 - 10:30AM North Field Soy</li>
    </ul>
    <ul>
      <li class="heading">UPCOMING</li>
      <li class="log">Harvest 8/11/2020 - 10:30AM East Field Corn</li>
      <li class="log">Harvest 8/11/2020 - 1:00PM West Field Soy</li>
      <li class="log">Spray 8/12/2020 - 8:00AM South Field Corn</li>
    </ul>
    <div class="scroll-container">
      <div class="scroll-x" :style="scrollStyle">
        <svg-filter-dropshadow id="btn-shadow" :opacity=".25" :blur="3" :x="1" :y="2"/>
        <div id="activity" class="add-btn" @click="addLog('farm_activity', $event)">
          <icon-add-circle :style="{ filter: 'url(#btn-shadow)' }"/>
          <div>Activity</div>
        </div>
        <div id="observation" class="add-btn" @click="addLog('farm_observation', $event)">
          <icon-add-circle :style="{ filter: 'url(#btn-shadow)' }"/>
          <div>Observation</div>
        </div>
        <div id="harvest" class="add-btn" @click="addLog('farm_harvest', $event)">
          <icon-add-circle :style="{ filter: 'url(#btn-shadow)' }"/>
          <div>Harvest</div>
        </div>
        <div id="input" class="add-btn" @click="addLog('farm_input', $event)">
          <icon-add-circle :style="{ filter: 'url(#btn-shadow)' }"/>
          <div>Input</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['logs'],
  data() {
    return {
      scrollStyle: {
        paddingBottom: '15px',
      },
    };
  },
  mounted() {
    this.calcScrollStyle();
  },
  methods: {
    // This calculates the exact padding needed to hide the scrollbar, because
    // it can vary between browsers.
    calcScrollStyle() {
      const scrollX = document.querySelector('.scroll-x');
      const paddingBottom = `${scrollX.offsetHeight - scrollX.clientHeight}px`;
      this.scrollStyle = { paddingBottom };
    },
    addLog(type, e) {
      e.stopPropagation();
      const props = { modules: ['my-logs'], type, done: true };
      this.$store.dispatch('initializeLog', props)
        .then(id => this.$router.push(`/logs/${id}`));
    },
  },
};
</script>

<style scoped>

ul {
  margin-bottom: .5rem;
}
.heading {
  font-size: .625rem;
}
.log {
  font-size: .75rem;
  font-weight: bold;
}
.late {
  color: var(--orange);
}

.scroll-container {
  height: 5rem;
  padding: 0 1rem;
  width: calc(100% + 1rem);
  overflow: hidden;
}
.scroll-x {
  overflow-x: scroll;
  overflow-y: hidden;
  height: 100%;
  margin-right: -1rem;
  margin-left: -1rem;
  box-sizing: content-box;
}

.add-btn {
  display: inline-block;
  text-align: center;
  height: 4rem;
  font-size: .625rem;
  line-height: .625rem;
}
.add-btn svg {
  height: 100%;
  width: auto;
}
#activity svg {
  fill: var(--cyan);
}
#observation svg {
  fill: var(--orange);
}
#harvest svg {
  fill: var(--purple);
}
#input svg {
  fill: var(--green);
}

</style>
