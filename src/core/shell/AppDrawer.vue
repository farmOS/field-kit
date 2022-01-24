<template>
  <div class="drawer container-fluid">
    <header class="drawer-header row">
      <div class="col">
        <div class="arrow-back" @click="$emit('close')">
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
          :checked="settings.useGeolocation"
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
</template>

<script>
import { mapState } from 'vuex';
import { version } from '../../../package.json';

export default {
  name: 'App',
  emits: ['close'],
  data() {
    return {
      version,
    };
  },
  computed: {
    ...mapState({
      /**
       * CORE STATE
       */
      user: state => state.profile.user,
      farm: state => state.profile.farm,
      settings: state => state.settings,
      modules: state => state.modules,
      // areaGeoJSON: state => state.areaGeoJSON,
      /**
       * L10N STATE
       */
      // locale: state => state.l10n.locale,
      // langs: state => state.l10n.languages,
    }),
  },
  methods: {
    handleRoute(route) {
      if (route !== this.$route.path) {
        this.$router.push(route);
      }
      this.$emit('close');
    },
    // setUseGeolocation(checked) {
    //   this.$store.commit('setUseGeolocation', checked);
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
