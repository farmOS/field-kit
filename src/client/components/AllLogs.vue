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
        :key="`card-${logs.indexOf(log)}`"
      >
        <router-link :to="{ name: 'edit-log', params: { index: i, type: log.type.data } }">
          <div class="card-body">

            <div class="card-row-1">
              <icon-assignment-done
                class="assignment done"
                v-if="log.done.data"/>
              <icon-assignment
                class="assignment"
                v-if="!log.done.data && (log.timestamp.data * 1000 > new Date().valueOf())"/>
              <icon-assignment-late
                class="assignment late"
                v-if="!log.done.data && (log.timestamp.data * 1000 < new Date().valueOf())"/>
              <div class="log-name">
                <h5>{{log.name.data}}</h5>
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
              <p>{{log.notes.data}}</p>
            </div>

            <div class="card-row-3">
              <div class="date-and-type">
                <span class="log-type">{{getLogType(log.type.data).toUpperCase()}}</span>
                <span>{{showDate(log.timestamp.data)}}</span>
              </div>
              <div class="tags">
                <span
                  v-for="area in mapTidsToAreas(log)"
                  class="tag tag-area">
                  {{area.name}}
                </span>
                <span
                  v-for="asset in mapIdsToAssets(log)"
                  class="tag tag-asset">
                  {{asset.name}}
                </span>
              </div>
            </div>

          </div>
        </router-link>
      </div>
    </div>

    <!-- Initialize the new log as an observation -->
    <router-link :to="{ name: 'edit-log', params: { type: 'farm_observation' } }">
      <div class="add-circle" @click="">
        <div class="background-circle">
        </div>
        <icon-add-circle/>
      </div>
    </router-link>

  </div>

</template>

<script>
import moment from 'moment';
import getLogType from '@/utils/getLogType'
import IconAddCircle from '../../icons/icon-add-circle.vue'; // eslint-disable-line import/extensions
import IconAssignment from '../../icons/icon-assignment.vue'; // eslint-disable-line import/extensions
import IconAssignmentDone from '../../icons/icon-assignment-done.vue'; // eslint-disable-line import/extensions
import IconAssignmentLate from '../../icons/icon-assignment-late.vue'; // eslint-disable-line import/extensions
import IconCloudDone from '../../icons/icon-cloud-done.vue'; // eslint-disable-line import/extensions
import IconCloudUpload from '../../icons/icon-cloud-upload.vue'; // eslint-disable-line import/extensions
import IconDelete from '../../icons/icon-delete.vue'; // eslint-disable-line import/extensions
import IconEdit from '../../icons/icon-edit.vue'; // eslint-disable-line import/extensions
import IconSync from '../../icons/icon-sync.vue'; // eslint-disable-line import/extensions

export default {
  props: [
    'logs',
    'userId',
    'assets',
    'logDisplayFilters',
    'areas',
    ],
  components: {
    IconAddCircle,
    IconAssignment,
    IconAssignmentDone,
    IconAssignmentLate,
    IconCloudDone,
    IconCloudUpload,
    IconDelete,
    IconEdit,
    IconSync,
  },
  beforeRouteLeave(to, from, next) {
    console.log(to.name);
    // Before navigating to the "Edit" screen, if a log index is provided in 
    // the query params, set it as the current log
    if (to.name === 'edit-log' && typeof to.params.index === 'number') {
      this.$store.commit('setCurrentLogIndex', to.params.index);
      next();
    // If no index is given, create a new log. The 'type' prop is set based on
    // the 'type' param in the local route
    } else if (to.name === 'edit-log') {
      this.$store.dispatch('initializeLog', to.params.type);
      next();
    // Otherwise just continue to the next route
    } else {
      next();
    }
  },
  methods: {
    showDate(unixTimestamp) {
      return moment.unix(unixTimestamp).format('MMM DD YYYY');
    },
    // Pass in a log and get back an array of the areas attached to that log
    mapTidsToAreas(log) {
      if (log.area && this.areas.length > 0) {
        return log.area.data.map(a1 => this.areas.find(a2 => +a2.tid === +a1.id));
      }
      return [];
    },
    // Pass in a log and get back an array of the areas attached to that log
    mapIdsToAssets(log) {
      if (log.asset && this.assets.length > 0) {
        return log.asset.data.map(a1 => this.assets.find(a2 => +a2.id === +a1.id));
      }
      return [];
    },
    getLogType(type) {
      return getLogType(type);
    },
    passesFilters(log) {
      const passesTypeFilter = !this.logDisplayFilters.excludeTypes.includes(log.type.data);
      const passesCategoryFilter = () => {
        if (log.log_category.data.length === 0 && this.logDisplayFilters.excludeCategories.includes(-1)) {
          return false;
        }
        return !log.log_category.data.some(cat => (
          this.logDisplayFilters.excludeCategories.some(exCat => +exCat === +cat.id)
        )
      )};
      const passesDateFilter = () => {
        const filter = this.logDisplayFilters.date;
        const d = new Date();
        let dateLimit;
        if (filter === 'TODAY') {
          d.setDate(d.getDate() - 1);
          dateLimit = d.valueOf() / 1000 | 0
        }
        if (filter === 'THIS_WEEK') {
          d.setDate(d.getDate() - 7);
          dateLimit = d.valueOf() / 1000 | 0
        }
        if (filter === 'THIS_MONTH') {
          d.setMonth(d.getMonth() - 1);
          dateLimit = d.valueOf() / 1000 | 0
        }
        if (filter === 'THIS_YEAR') {
          d.setYear(d.getYear() - 1);
          dateLimit = d.valueOf() / 1000 | 0
        }
        if (filter === 'ALL_TIME') {
          dateLimit = 0
        }
        return log.timestamp.data > dateLimit;
      }

      if (passesTypeFilter && passesCategoryFilter() && passesDateFilter()) {
        return true;
      }
      return false;
    },
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
