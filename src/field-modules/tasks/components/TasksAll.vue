<template lang="html">
  <farm-main :space="['0', '1rem']">
    <farm-tiles :columns="[1, 2, 3]" :space="[0, '1rem']" dividers>
      <farm-card
        v-if="logs.length < 1"
        space="var(--s)">
        <farm-stack space="xxs">
          <h3>{{ $t('Let\'s Get Started!')}}</h3>
          <farm-text size='s'>
            {{ $t('You don\'t have any logs to display yet. Logs are records of events') }}
            {{ $t('in farmOS. You can add some by clicking the') }}
            <icon-add-circle class="inline-svg"/>
            {{ $t('icon below, or you can get uncompleted tasks from the server by') }}
            {{ $t('clicking the') }} <icon-cloud-upload class="inline-svg"/> {{ $t('icon above.') }}
          </farm-text>
        </farm-stack>
      </farm-card>
      <farm-card
        v-for="(log, i) in logs.filter(passesFilters)"
        :key="`card-${i}`"
        space="var(--s)">
        <router-link :to="{ path: `/tasks/${log.localID}` }">
          <farm-stack space="xxs">

            <farm-inline justifyContent="space-between" space="s">
              <farm-inline justifyContent="start" space="s">
                <icon-assignment-done
                  v-if="log.done"/>
                <icon-assignment
                  v-if="!log.done && (log.timestamp * 1000 > new Date().valueOf())"/>
                <icon-assignment-late
                  class="late"
                  v-if="!log.done && (log.timestamp * 1000 < new Date().valueOf())"/>
                <h6>{{log.name}}</h6>
              </farm-inline>
              <icon-cloud-upload v-if="isUnsynced(log)"/>
              <icon-cloud-done v-else/>
            </farm-inline>

            <farm-text size="s">{{parseNotes(log.notes)}}</farm-text>

            <farm-inline justifyContent="space-between" alignItems="flex-end">
              <farm-stack space="xs">
                <farm-text-label as="p">
                  {{$t(logTypes[log.type].label).toUpperCase()}}
                </farm-text-label>
                <farm-text size="s">{{showDate(log.timestamp)}}</farm-text>
              </farm-stack>
              <farm-inline space="xs" justifyContent="flex-end" flex="0 0 75%">
                <farm-text size="s"
                  v-for="(area, i) in mapTidsToAreas(log)"
                  class="tag area"
                  :key="`area-${i}`">
                  {{area.name}}
                </farm-text>
                <farm-text size="s"
                  v-for="(asset, i) in mapIdsToAssets(log)"
                  class="tag asset"
                  :key="`asset-${i}`">
                  {{asset.name}}
                </farm-text>
              </farm-inline>
            </farm-inline>

          </farm-stack>
        </router-link>
      </farm-card>
    </farm-tiles>

    <div class="add-circle" @click="startNewLog">
      <div class="background-circle">
      </div>
      <icon-add-circle/>
    </div>

  </farm-main>

</template>

<script>
const { parseNotes } = window.farmOS.utils;
const { isUnsynced } = window.farmOS.utils.farmLog;

export default {
  name: 'TasksAll',
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
      this.initializeLog({ done: true })
        .then(id => this.$router.push({ path: `/tasks/${id}` }));
    },
    parseNotes,
    isUnsynced,
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

  a {
    color: var(--dark);
  }

  .late {
    fill: var(--warning);
  }

  .tag {
    font-size: 12px;
    padding: 0 var(--xxs);
    border-radius: var(--xs);
  }

  .tag.area {
    border: 1px solid var(--blue);
    background-color: var(--accent-blue);
  }

  .tag.asset {
    border: 1px solid var(--green);
    background-color: var(--accent-green);
  }

  .add-circle {
    position: fixed;
    bottom: 1.5rem;
    right: 1.5rem;
  }

  .add-circle svg {
    fill: var(--primary);
    height: 4.5rem;
    width: 4.5rem;
  }

  .background-circle {
    height: 3.75rem;
    width: 3.75rem;
    border-radius: 2rem;
    background-color: var(--accent-primary);
    box-shadow: var(--shadow-strong);
    position: absolute;
    top: .375rem;
    left: .375rem;
    z-index: -10;
  }

</style>
