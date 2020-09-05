<template>
  <farm-menu-bar :more="false">
    <template #left-menu>
      <li @click="$emit('toggle-drawer')">
        <icon-menu/>
      </li>
      <li>Login</li>
    </template>
  </farm-menu-bar>
</template>

<script>
export default {
  name: 'LoginMenuBar',
};
</script>
