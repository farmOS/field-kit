<template>
  <router-view/>
</template>
<script>
const { toFraction, useEntities } = window.lib;
const {
  computed, ref, inject, provide,
} = window.Vue;
const { useRouter } = window.VueRouter;

export default {
  name: 'TasksContainer',
  setup() {
    const router = useRouter();
    const {
      append, checkout, commit, link, revise,
    } = useEntities();

    const assetFilter = { status: 'active' };
    const assets = checkout('asset', assetFilter);
    const locations = computed(() => assets.filter(a => a.is_location));
    const equipment = computed(() => assets.filter(a => a.type === 'asset--equipment'));
    provide('assets', { assets, locations, equipment });

    const termFilter = { type: ['taxonomy_term--log_category', 'taxonomy_term--unit'] };
    const terms = checkout('term', termFilter);
    const units = computed(() => terms.filter(t => t.type === 'taxonomy_term--unit'));
    const categories = computed(() => terms.filter(t => t.type === 'taxonomy_term--log_category'));
    provide('terms', { terms, units, categories });

    const profile = inject('profile');
    const logFilter = {
      'owner.id': profile.user.id,
      status: { $ne: 'done' },
    };
    const logs = checkout('log', logFilter);

    const currentID = ref(logs[0]?.id);
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

    const quantities = link(current, 'quantity', 'quantity');
    const addQuantity = (type = 'quantity--standard') => {
      const resIds = current.value?.quantity || [];
      const updatedResIds = [...resIds, { id: null, type }];
      update({ quantity: updatedResIds });
      return resIds.length;
    };
    const updateQuantity = (key, value, id) => {
      let v = value;
      if (key === 'units') v = { id: value, type: 'taxonomy_term--unit' };
      if (key === 'value') v = toFraction(value || 0);
      const quantity = quantities.value.find(q => q.id === id);
      if (quantity) revise(quantity, { [key]: v });
    };
    const removeQuantity = (index) => {
      if (index >= 0) {
        const quantity = [
          ...current.value.quantity.slice(0, index),
          ...current.value.quantity.slice(index + 1),
        ];
        update({ quantity });
      }
    };
    provide('quantities', {
      quantities, addQuantity, updateQuantity, removeQuantity,
    });

    const save = () => commit(current.value);
    provide('logs', {
      logs,
      current,
      open,
      openNew,
      update,
      save,
    });
  },
};
</script>
