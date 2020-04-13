<template>
  <div class="main-container">
    <div class="fade-right"></div>
    <ul>
      <li class="heading" v-if="lateLogs.length > 0">LATE</li>
      <li class="log late" v-for="(log, i) in lateLogs" :key="`late-log-${i}`">
        {{log.name}}
      </li>
    </ul>
    <ul>
      <li class="heading" v-if="upcomingLogs.length > 0">UPCOMING</li>
      <li class="log" v-for="(log, i) in upcomingLogs" :key="`upcoming-log-${i}`">
        {{log.name}}
      </li>
    </ul>
    <ul>
      <li class="heading" v-if="doneLogs.length > 0">DONE</li>
      <li class="log" v-for="(log, i) in doneLogs" :key="`done-log-${i}`">
        {{log.name}}
      </li>
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
  computed: {
    lateLogs() {
      const now = Math.floor(Date.now() / 1000);
      return this.logs
        .filter(log => !log.done && log.timestamp < now)
        .slice(0, 5);
    },
    upcomingLogs() {
      const now = Math.floor(Date.now() / 1000);
      const limit = 5 - this.lateLogs.length;
      return this.logs
        .filter(log => !log.done && log.timestamp > now)
        .slice(0, limit);
    },
    doneLogs() {
      const limit = 5 - this.lateLogs.length - this.upcomingLogs.length;
      return this.logs
        .filter(log => log.done)
        .slice(0, limit);
    },
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

.main-container {
  position: relative;
  white-space: nowrap;
}
.fade-right {
  position: absolute;
  top: 0px;
  right: -1rem;
  height: 100%;
  width: 2rem;
  z-index: 10;
  background: linear-gradient(to right, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1) 50%);
}

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
