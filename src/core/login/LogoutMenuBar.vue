<template>
  <farm-menu-bar :more="false">
    <template #left-menu>
      <li @click="$emit('open-drawer')">
        <icon-menu/>
      </li>
      <li>Logout</li>
    </template>
  </farm-menu-bar>
</template>

<script>
export default {
  name: 'LoginMenuBar',
  emits: ['open-drawer'],
};
</script>
