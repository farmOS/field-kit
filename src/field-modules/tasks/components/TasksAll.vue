<template lang="html">
  <farm-main :space="['none', 's']">
    <farm-tiles :columns="[1, 2, 3]" :space="['none', 's']" dividers>
      <farm-card
        v-if="logs.length < 1">
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
        v-for="(log, i) in tasks"
        :key="`card-${i}`">
        <router-link :to="{ path: `/tasks/${log.id}` }">
          <farm-stack space="xxs">

            <farm-inline justifyContent="space-between" space="s">
              <farm-inline justifyContent="start" space="s">
                <icon-assignment-done
                  v-if="log.status === 'done'"/>
                <icon-assignment
                  v-if="log.status !== 'done' && !log.late"/>
                <icon-assignment-late
                  class="late"
                  v-if="log.status !== 'done' && log.late"/>
                <h6>{{log.name}}</h6>
              </farm-inline>
              <icon-cloud-upload v-if="log.isUnsynced"/>
              <icon-cloud-done v-else/>
            </farm-inline>

            <farm-text size="s">{{log.notes}}</farm-text>

            <farm-inline justifyContent="space-between" alignItems="flex-end">
              <farm-stack space="xs">
                <farm-text-label as="p">
                  {{$t(logTypes[log.type].label).toUpperCase()}}
                </farm-text-label>
                <farm-text size="s">{{log.date}}</farm-text>
              </farm-stack>
              <farm-inline space="xs" justifyContent="flex-end" flex="0 0 75%">
                <farm-text size="s"
                  v-for="(asset, i) in log.assets"
                  class="tag area"
                  :key="`area-${i}`">
                  {{area.name}}
                </farm-text>
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
const {
  meta: { isUnsynced },
  utils: { parseNotes },
} = window.farmOS;

export default {
  name: 'TasksAll',
  props: [
    'logTypes',
    'logs',
    'userId',
    'assets',
  ],
  computed: {
    tasks() {
      return this.logs.map((log) => {
        const assets = log.asset.data.map(logAsset =>
          this.assets.find(a => a.id === logAsset.id));
        const dateOpts = { month: 'short', day: 'numeric', year: 'numeric' };
        return {
          ...log,
          assets,
          date: new Date(log.timestamp).toLocaleDateString(undefined, dateOpts),
          notes: parseNotes(log.notes),
          late: log.timestamp < new Date().toISOString(),
          isUnsynced: isUnsynced(log),
        };
      });
    },
  },
  methods: {
    showDate(iso) {
      const date = new Date(iso);
      const opts = { month: 'short', day: 'numeric', year: 'numeric' };
      return date.toLocaleDateString(undefined, opts);
    },
    // Pass in a log and get back an array of the areas attached to that log
    mapTidsToAreas(log) {
      if (log.area?.data && this.areas.length > 0) {
        return log.area.data.map(a1 => this.areas.find(a2 => +a2.tid === +a1.id));
      }
      return [];
    },
    // Pass in a log and get back an array of the areas attached to that log
    mapIdsToAssets(log) {
      if (log.asset?.data && this.assets.length > 0) {
        return log.asset.data.map(a1 => this.assets.find(a2 => +a2.id === +a1.id));
      }
      return [];
    },
    startNewLog() {
      this.createLog({ done: true })
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
