<template lang="html">
  <div>
    <div class="card-group">
      <div
        class="card"
        v-if="logs.length < 1">
        <div class="card-body">
          <h4 class="card-title">Let's Get Started!</h4>
          <p class="card-text">
            You don't have any logs to display yet. Logs are records of events
            in farmOS. You can add some by clicking the <IconAddCircle class="inline-svg"/>
            icon below, or you can get uncompleted tasks from the server by
            clicking the <IconCloudUpload class="inline-svg"/> icon above.
          </p>
        </div>
      </div>
      <div
        class="card"
        v-if="logs.length > 0 && passesFilters(log)"
        v-for="(log, i) in logs"
        :key="`card-${i}`"
      >
        <router-link :to="{ path: `/logs/${log.localID}` }">
          <div class="card-body">

            <div class="card-row-1">
              <icon-assignment-done
                class="assignment done"
                v-if="log.done"/>
              <icon-assignment
                class="assignment"
                v-if="!log.done && (log.timestamp * 1000 > new Date().valueOf())"/>
              <icon-assignment-late
                class="assignment late"
                v-if="!log.done && (log.timestamp * 1000 < new Date().valueOf())"/>
              <div class="log-name">
                <h5>{{log.name}}</h5>
              </div>
              <icon-cloud-done v-if="log.wasPushedToServer" class="sync-status"/>
              <div
                class="spin sync-status"
                v-else-if="log.isReadyToSync"
                aria-hidden="true">
                <icon-sync/>
              </div>
              <icon-cloud-upload v-else class="sync-status"/>
            </div>

            <div class="card-row-2">
              <p>{{parseNotes(log.notes)}}</p>
            </div>

            <div class="card-row-3">
              <div class="date-and-type">
                <span class="log-type">{{logTypes[log.type].label.toUpperCase()}}</span>
                <span>{{showDate(log.timestamp)}}</span>
              </div>
              <div class="tags">
                <span
                  v-for="(area, i) in mapTidsToAreas(log)"
                  class="tag tag-area"
                  :key="`area-${i}`">
                  {{area.name}}
                </span>
                <span
                  v-for="(asset, i) in mapIdsToAssets(log)"
                  class="tag tag-asset"
                  :key="`asset-${i}`">
                  {{asset.name}}
                </span>
              </div>
            </div>

          </div>
        </router-link>
      </div>
    </div>

    <div class="add-circle" @click="startNewLog">
      <div class="background-circle">
      </div>
      <icon-add-circle/>
    </div>

  </div>

</template>

<script>
const { parseNotes } = window.farmOS.utils;

export default {
  name: 'AllLogs',
  props: [
    'logTypes',
    'logs',
    'userId',
    'assets',
    'logDisplayFilters',
    'areas',
  ],
  methods: {
    showDate(unixTimestamp) {
      if (Number.isNaN(Number(unixTimestamp))) {
        return 'No Date Provided';
      }
      const date = new Date(unixTimestamp * 1000);
      const opts = { month: 'short', day: 'numeric', year: 'numeric' };
      return date.toLocaleDateString(undefined, opts);
    },
    // Pass in a log and get back an array of the areas attached to that log
    mapTidsToAreas(log) {
      if (log.area && this.areas.length > 0) {
        return log.area.map(a1 => this.areas.find(a2 => +a2.tid === +a1.id));
      }
      return [];
    },
    // Pass in a log and get back an array of the areas attached to that log
    mapIdsToAssets(log) {
      if (log.asset && this.assets.length > 0) {
        return log.asset.map(a1 => this.assets.find(a2 => +a2.id === +a1.id));
      }
      return [];
    },
    passesFilters(log) {
      const passesTypeFilter = !this.logDisplayFilters.excludedTypes.includes(log.type);
      const passesCategoryFilter = () => {
        const logHasNoCats = log.log_category === null
          || log.log_category.length === 0;
        const noCatsFilterIsSelected = this.logDisplayFilters.excludedCategories.includes(-1);
        if (logHasNoCats && noCatsFilterIsSelected) {
          return false;
        }
        if (log.log_category !== null) {
          return !log.log_category.some(cat => (
            this.logDisplayFilters.excludedCategories.some(exCat => +exCat === +cat.id)
          ));
        }
        return true;
      };
      const passesDateFilter = () => {
        if (Number.isNaN(Number(log.timestamp))) {
          return true;
        }
        const filter = this.logDisplayFilters.date;
        const d = new Date();
        let dateLimit;
        if (filter === 'TODAY') {
          d.setDate(d.getDate() - 1);
          dateLimit = Math.floor(d.valueOf() / 1000);
        }
        if (filter === 'THIS_WEEK') {
          d.setDate(d.getDate() - 7);
          dateLimit = Math.floor(d.valueOf() / 1000);
        }
        if (filter === 'THIS_MONTH') {
          d.setMonth(d.getMonth() - 1);
          dateLimit = Math.floor(d.valueOf() / 1000);
        }
        if (filter === 'THIS_YEAR') {
          d.setYear(d.getYear() - 1);
          dateLimit = Math.floor(d.valueOf() / 1000);
        }
        if (filter === 'ALL_TIME') {
          dateLimit = 0;
        }
        return log.timestamp > dateLimit;
      };

      if (passesTypeFilter && passesCategoryFilter() && passesDateFilter()) {
        return true;
      }
      return false;
    },
    startNewLog() {
      this.$store.dispatch('initializeLog', { done: true })
        .then(id => this.$router.push({ path: `/logs/${id}` }));
    },
    parseNotes,
  },
};

</script>

<style scoped>
  .inline-svg {
    height: 1rem;
  }

  a:hover {
    text-decoration: none;
  }

  .card-group > .card {
    margin-bottom: 0;
  }

  .card-body {
    color: var(--gray-dark);
  }

  .card-row-1 {
    display: flex;
    flex-flow: row nowrap;
  }

  .card-row-1 h5 {
    font-weight: 700;
  }

  .card-row-2 {
    display: flex;
    flex-flow: row nowrap;
  }

  .card-row-3 {
    display: flex;
    flex-flow: row nowrap;
    justify-content: space-between;
  }

  .assignment {
    flex: 0 0 auto;
  }

  .assignment.late {
    fill: var(--orange);
  }

  .log-name {
    flex: 3 1 auto;
    margin-left: 1rem;
  }

  .sync-status {
    flex: 0 0 auto;
  }

  .card-body p {
    margin-bottom: 0.5rem;
  }

  .date-and-type {
    display: flex;
    flex-flow: column;
    justify-content: flex-end;
    flex: 0 0 auto;
  }

  .date-and-type span {
    margin-bottom: .25rem;
    padding: .125rem 0;
  }

  .log-type {
    font-size: .75rem;
  }

  .tags {
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
    flex-flow: row wrap;
    flex: 0 1 auto;
  }

  .tag {
    margin-left: .25rem;
    margin-bottom: .25rem;
    padding: .125rem;
    border-radius: .25rem;
  }

  .tag-area {
    border: 1px solid rgba(2, 154, 207, 1);
    background-color: rgba(2, 154, 207, .125)
  }

  .tag-asset {
    border: 1px solid rgba(96, 175, 50, 1);
    background-color: rgba(96, 175, 50, .125)
  }

  @media (min-width: 576px) {
    .card-group .card {
      flex: 0 0 576px;
    }
  }

  .spin {
      -webkit-animation-name: spin;
      -webkit-animation-duration: 4000ms;
      -webkit-animation-iteration-count: infinite;
      -webkit-animation-timing-function: linear;
      -moz-animation-name: spin;
      -moz-animation-duration: 4000ms;
      -moz-animation-iteration-count: infinite;
      -moz-animation-timing-function: linear;
      -ms-animation-name: spin;
      -ms-animation-duration: 4000ms;
      -ms-animation-iteration-count: infinite;
      -ms-animation-timing-function: linear;

      animation-name: spin;
      animation-duration: 4000ms;
      animation-iteration-count: infinite;
      animation-timing-function: linear;
  }
  @-ms-keyframes spin {
      from { -ms-transform: rotate(0deg); }
      to { -ms-transform: rotate(-360deg); }
  }
  @-moz-keyframes spin {
      from { -moz-transform: rotate(0deg); }
      to { -moz-transform: rotate(-360deg); }
  }
  @-webkit-keyframes spin {
      from { -webkit-transform: rotate(0deg); }
      to { -webkit-transform: rotate(-360deg); }
  }
  @keyframes spin {
      from {
          transform: rotate(0deg);
      }
      to {
          transform: rotate(-360deg);
      }
  }

  .add-circle {
    position: fixed;
    bottom: 1.5rem;
    right: 1.5rem;
    fill: var(--farmos-green-light);
  }

  .add-circle svg {
    height: 4.5rem;
    width: 4.5rem;
  }

  .background-circle {
    height: 3.75rem;
    width: 3.75rem;
    border-radius: 2rem;
    background-color: var(--farmos-green-dark);
    box-shadow: -1px 2px 5px rgba(0, 0, 0, .25);
    position: absolute;
    top: .375rem;
    left: .375rem;
    z-index: -10;
  }

</style>
