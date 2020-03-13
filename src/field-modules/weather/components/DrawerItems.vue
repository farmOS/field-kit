<template>
  <farm-drawer-list>
    <router-link :to="{ name: 'weather-form' }">
      <farm-drawer-list-item>Record Weather Event</farm-drawer-list-item>
    </router-link>
  </farm-drawer-list>
</template>

<style >
  a, a:hover {
    text-decoration: none;
    color: inherit;
  }
</style>
