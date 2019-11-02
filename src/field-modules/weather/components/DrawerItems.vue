<template>
  <ul class="row list-group">
    <router-link :to="{ name: 'weather-form' }">
      <li class="list-group-item">Record Weather Event</li>
    </router-link>
  </ul>
</template>

<script>
import modConfig from '../module.config'
export default {
  name: `${modConfig.name}-drawer-items`,
}
</script>

<style >
  a {
    text-decoration: none;
    color: inherit;
  }
</style>