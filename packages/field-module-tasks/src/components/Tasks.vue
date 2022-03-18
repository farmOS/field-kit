<template>
  <router-view/>
</template>
<script>
const { useEntities } = window.lib;
const {
  computed, ref, inject, provide,
} = window.Vue;
const { useRouter } = window.VueRouter;

export default {
  name: 'TasksContainer',
  setup() {
    const router = useRouter();
    const {
      append, checkout, commit, revise,
    } = useEntities();

    const assetFilter = { status: 'active' };
    const assets = checkout('asset', assetFilter);
    const locations = computed(() => assets.filter(a => a.is_location));
    const equipment = computed(() => assets.filter(a => a.type === 'equipment'));
    provide('assets', { assets, locations, equipment });

    const termFilter = { type: ['log_category', 'unit'] };
    const terms = checkout('term', termFilter);
    const units = computed(() => terms.filter(t => t.type === 'unit'));
    const categories = computed(() => terms.filter(t => t.type === 'log_category'));
    provide('terms', { terms, units, categories });

    const profile = inject('profile');
    const logFilter = {
      'owner.id': profile.user.id,
      status: { $ne: 'done' },
    };
    const logs = checkout('log', logFilter);

    const currentID = ref(logs[0]);
    const current = computed(() => logs.find(l => l.id === currentID.value));

    const open = (id) => {
      currentID.value = id;
      router.push({ path: '/tasks/edit' });
    };
    const openNew = (type) => {
      const { id } = append(logs, type, { status: 'done' });
      currentID.value = id;
      router.push({ path: '/tasks/edit' });
    };
    const update = (fields = {}) => { revise(current.value, fields); };
    const save = () => commit(current.value);
    const close = () => {
      const request = commit(current.value);
      router.push({ path: '/tasks' });
      return request;
    };
    provide('logs', {
      logs,
      current,
      open,
      openNew,
      update,
      save,
      close,
    });
  },
};
</script>
