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
        class="task-card"
        :key="`card-${i}`">
        <farm-stack space="xxs" @click="open(task.id)">

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
                {{$t(task.label).toUpperCase()}}
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
      </farm-card>
    </farm-tiles>

    <!-- TODO: replace hardcoded 'activity' type with a menu of available types -->
    <div class="add-circle" @click="openNew('activity')">
      <div class="background-circle">
      </div>
      <icon-add-circle/>
    </div>

  </farm-main>

</template>
<script>
const { computed, inject } = window.Vue;
const { parseNotes } = window.lib;

const compare = (a, b) => new Date(b.timestamp) - new Date(a.timestamp);
const dateOpts = { month: 'short', day: 'numeric', year: 'numeric' };

export default {
  name: 'TasksAll',
  inject: ['assets', 'bundles', 'logs'],
  setup() {
    const { equipment, locations } = inject('assets');
    const bundles = inject('bundles');
    const { logs, open, openNew } = inject('logs');
    const tasks = computed(() => logs.map(log => ({
      id: log.id,
      name: log.name,
      status: log.status,
      assets: equipment.value.filter(equip => log.asset.some(a => a.id === equip.id)),
      locations: locations.value.filter(loc => log.asset.some(a => a.id === loc.id)),
      label: bundles.log?.[log.type]?.label || '',
      date: new Date(log.timestamp).toLocaleDateString(undefined, dateOpts),
      notes: parseNotes(log.notes),
      late: new Date(log.timestamp) < new Date(),
    })).sort(compare));
    return { open, openNew, tasks };
  },
};

</script>
<style scoped>
  .inline-svg {
    height: 1rem;
  }

  .task-card:hover,
  .add-circle:hover {
    cursor: pointer;
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
