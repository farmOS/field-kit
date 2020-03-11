<template>
  <drawer-list>
    <router-link :to="{ name: 'weather-form' }">
      <drawer-list-item>Record Weather Event</drawer-list-item>
    </router-link>
  </drawer-list>
</template>

<style >
  a, a:hover {
    text-decoration: none;
    color: inherit;
  }
</style>
