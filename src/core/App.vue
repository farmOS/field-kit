<template>
  <transition name="ready" mode="out-in">
    <not-ready v-if="!ready"/>
    <app-shell v-else>
      <template v-slot="{ openDrawer }">
        <router-view v-slot="{ Component }">
          <component :is="Component"
            @open-drawer="openDrawer"
            :user="user"
            :farm="farm"
            :settings="settings"
            :assets="assets"
            :logs="logs"
            :plans="plans"
            :quantities="quantities"
            :terms="terms"
            :users="users"
            :assetTypes="assetTypes"
            :logTypes="logTypes"
            :planTypes="planTypes"
            :quantityTypes="quantityTypes"
            :termTypes="termTypes"
            :userTypes="userTypes"
            :areaGeoJSON="areaGeoJSON"/>
        </router-view>
      </template>
    </app-shell>
  </transition>
</template>

<script>
import { mapActions, mapState } from 'vuex';
import AppShell from './shell/AppShell.vue';
import NotReady from './shell/NotReady.vue';
import { refreshCache } from './idb/cache';
import flattenEntity from './utils/flattenEntity';

export default {
  name: 'App',
  components: { AppShell, NotReady },
  data() {
    return {
      ready: false,
    };
  },
  created() {
    this.loadProfile()
      .then(this.loadConfigDocs)
      .then(this.loadFieldModules)
      .then(() => {
        this.updateProfile()
          .then(this.updateConfigDocs)
          .then(this.updateFieldModules)
          .then(refreshCache)
          .catch((e) => { this.alert(e); })
          .finally(() => {
            // Try to detect redirects from field modules that weren't loaded
            // and hadn't registered their routes when the page loaded.
            const { redirectedFrom } = this.$router.currentRoute.value;
            const wasRedirectedFromModule = redirectedFrom && this.$router.getRoutes()
              .findIndex(r => r.path === redirectedFrom.path) > -1;
            if (wasRedirectedFromModule) {
              this.$router.push(redirectedFrom.fullPath);
            }
            this.ready = true;
          });
      })
      .catch(() => {
        this.ready = true;
        // If loading the profile, config or modules fails, we treat it like a
        // fresh install.
        if (this.$route.path !== '/login') this.$router.push('/login');
      });
  },
  computed: {
    ...mapState({
      /**
       * CORE STATE
       */
      errors: state => state.errors,
      user: state => state.profile.user,
      farm: state => state.profile.farm,
      settings: state => state.settings,
      modules: state => state.modules,
      areaGeoJSON: state => state.areaGeoJSON,

      /**
       * L10N STATE
       */
      // locale: state => state.l10n.locale,
      // langs: state => state.l10n.languages,

      /**
       * ENTITIES
       */
      assets: state => state.assets.map(flattenEntity),
      logs: state => state.logs.map(flattenEntity),
      plans: state => state.plans.map(flattenEntity),
      quantities: state => state.quantities.map(flattenEntity),
      terms: state => state.terms.map(flattenEntity),
      users: state => state.users.map(flattenEntity),
      assetTypes: state => state.assetTypes,
      logTypes: state => state.logTypes,
      planTypes: state => state.planTypes,
      quantityTypes: state => state.quantityTypes,
      termTypes: state => state.termTypes,
      userTypes: state => state.userTypes,
    }),
  },
  methods: {
    ...mapActions([
      'loadProfile',
      'loadConfigDocs',
      'loadFieldModules',
      'updateProfile',
      'updateConfigDocs',
      'updateFieldModules',
    ]),
  },
};
</script>

<style scoped>
  .ready-enter-active, .ready-leave-active {
    transition: opacity .5s;
  }
  .ready-enter-from, .ready-leave-to {
    opacity: 0;
  }
</style>
