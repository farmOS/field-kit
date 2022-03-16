<template>
<transition name="filter">
  <div v-if="show" class="drawer-filter" @click="show = false"></div>
</transition>
<transition name="drawer">
  <div v-if="show" class="drawer container-fluid">
    <header class="drawer-header row">
      <div class="col">
        <div class="arrow-back" @click="show = false">
          <icon-arrow-back />
        </div>
        <div class="user-info">
          <h2>{{ farm.name }}</h2>
          <p>{{ farm.url.replace(/(^\w+:|^)\/\//, '') }}</p>
          <p>{{ user.display_name }}</p>
        </div>
      </div>
    </header>
    <farm-list>
      <farm-list-item @click="handleRoute('/home')" :clickable="true">
        {{ $t('Home') }}
      </farm-list-item>
    </farm-list>
    <farm-list>
      <farm-list-item
        v-for="mod in modules"
        :key="`${mod.name}-menu-link`"
        :clickable="true"
        @click="handleRoute(mod.routes[0].path)">
        {{ $t(mod.label) }}
      </farm-list-item>
    </farm-list>
    <farm-list>
      <!-- <farm-list-item :clickable="false">
        <farm-toggle-check
          :label="$t('Share My Location')"
          labelPosition="before"
          :checked="settings.permissions.geolocation"
          @input="setUseGeolocation($event)"
        />
      </farm-list-item>
      <farm-list-item v-if="langs.length > 0">
        <label>{{ $t('Select Language') }}</label>
        <br />
        <div class="form-check">
          <input
            type="radio"
            class="form-check-input"
            name="language"
            id="lang1"
            value="en"
            @input="setLocale"
            :checked="isLocale('en')"
          />
          <label for="lang1" class="form-check-label">{{ $t('English') }}</label>
        </div>
        <div v-for="(lang, i) in langs" :key="`lang-${i}`" class="form-check">
          <input
            type="radio"
            class="form-check-input"
            name="language"
            :id="`lang-${i}`"
            :value="lang.language"
            @input="setLocale"
            :checked="isLocale(lang.language)"
          />
          <label :for="`lang-${i}`" class="form-check-label">{{ lang.native }}</label>
        </div>
      </farm-list-item> -->
      <farm-list-item :clickable="false">{{ $t('Version') }}: {{ version }}</farm-list-item>
      <farm-list-item @click="handleRoute('/logout')" :clickable="true">
        {{ $t('Logout') }}
      </farm-list-item>
    </farm-list>
  </div>
</transition>
</template>

<script>
import fieldModules from '../field-modules';
import profile from '../store/profile';
import settings from './settings';
import { version } from '../../../package.json';

export default {
  name: 'App',
  expose: ['openDrawer'],
  emits: ['close'],
  data() {
    return {
      show: false,
      user: profile.user,
      farm: profile.farm,
      modules: fieldModules,
      settings,
      version,
    };
  },
  methods: {
    openDrawer() {
      this.show = true;
    },
    handleRoute(route) {
      if (route !== this.$route.path) {
        this.$router.push(route);
      }
      this.show = false;
    },
    // setUseGeolocation(checked) {
    // },
    // setLocale(e) {
    //   this.$store.commit('setLocale', e.target.value);
    // },
    // isLocale(locale) {
    //   return this.locale === locale;
    // },
  },
};
</script>

<style scoped>
.drawer-enter-from, .drawer-leave-to {
  transform: translateX(-80vw);
}

.filter-enter-from, .filter-leave-to {
  opacity: 0;
}

.drawer-enter-active, .drawer-leave-active,
.filter-enter-active, .filter-leave-active {
  transition: all .3s ease;
}

.drawer-filter {
  position: fixed;
  top: 0;
  height: 100%;
  width: 100%;
  background-color: var(--dark-transparent);
  z-index: 1500;
}

.drawer {
  position: fixed;
  top: 0;
  height: 100vh;
  width: 80vw;
  background-color: var(--white);
  z-index: 2000;
  overflow-y: auto;
}

.drawer header {
  background-color: var(--primary);
  color: var(--white);
  height: 9rem;
}

.arrow-back svg {
  fill: var(--white);
}

.arrow-back {
  margin-top: 0.5rem;
}

.drawer a,
.drawer a:hover {
  text-decoration: none;
  color: inherit;
}
</style>
