<template>
  <farm-main :space="['none', 's']">
    <app-bar-options title="Tasks"/>
    <farm-tiles :columns="[1, 2, 3]" :space="['none', 's']" dividers>
      <farm-card
        v-if="logs.length < 1">
        <farm-stack space="xxs">
          <h3>{{ $t('Let\'s Get Started!')}}</h3>
          <farm-text size='s'>
            {{ $t('You don\'t have any logs to display yet. Logs are records of events') }}
            {{ $t('in farmOS. You can add some by clicking the') }}
            <icon-add-circle class="inline-svg"/>
            {{ $t('icon below.') }}
          </farm-text>
        </farm-stack>
      </farm-card>
      <farm-card
        v-for="(task, i) in tasks"
        :key="`card-${i}`">
        <router-link :to="{ path: `/tasks/${task.id}` }">
          <farm-stack space="xxs">

            <farm-inline justifyContent="space-between" space="s">
              <farm-inline justifyContent="start" space="s">
                <icon-assignment-done
                  v-if="task.status === 'done'"/>
                <icon-assignment
                  v-if="task.status !== 'done' && !task.late"/>
                <icon-assignment-late
                  class="late"
                  v-if="task.status !== 'done' && task.late"/>
                <h6>{{task.name}}</h6>
              </farm-inline>
            </farm-inline>

            <farm-text size="s">{{task.notes}}</farm-text>

            <farm-inline justifyContent="space-between" alignItems="flex-end">
              <farm-stack space="xs">
                <farm-text-label as="p">
                  {{$t(task.typeLabel).toUpperCase()}}
                </farm-text-label>
                <farm-text size="s">{{task.date}}</farm-text>
              </farm-stack>
              <farm-inline space="xs" justifyContent="flex-end" flex="0 0 75%">
                <farm-text size="s"
                  v-for="location in task.locations"
                  class="tag area"
                  :key="`area-${location.id}`">
                  {{location.name}}
                </farm-text>
                <farm-text size="s"
                  v-for="asset in task.assets"
                  class="tag asset"
                  :key="`asset-${asset.id}`">
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
  parseNotes,
} = window.lib;

export default {
  name: 'TasksAll',
  inject: ['appendLog', 'bundles'],
  props: [
    'logs',
    'userId',
    'assets',
  ],
  computed: {
    tasks() {
      const compare = (a, b) => new Date(b.timestamp) - new Date(a.timestamp);
      const logs = this.logs.map((log) => {
        const {
          id, name, status, timestamp,
        } = log;
        const [locations, assets] = log.asset.reduce(([locs, nonLocs], asset) => {
          const match = this.assets.find(a => a.id === asset.id);
          if (!match) return [locs, nonLocs];
          if (match.is_location) return [[...locs, match], nonLocs];
          return [locs, [...nonLocs, match]];
        }, [[], []]);
        const dateOpts = { month: 'short', day: 'numeric', year: 'numeric' };
        const label = this.bundles?.log?.[log.type]?.label || '';
        return {
          id,
          name,
          status,
          timestamp,
          locations,
          assets,
          typeLabel: label,
          date: new Date(timestamp).toLocaleDateString(undefined, dateOpts),
          notes: parseNotes(log.notes),
          late: timestamp < new Date().toISOString(),
        };
      });
      return logs.sort(compare);
    },
  },
  methods: {
    showDate(iso) {
      const date = new Date(iso);
      const opts = { month: 'short', day: 'numeric', year: 'numeric' };
      return date.toLocaleDateString(undefined, opts);
    },
    startNewLog() {
      const log = this.appendLog('activity', { status: 'done' });
      this.$router.push({ path: `/tasks/${log.id}` });
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
