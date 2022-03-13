<template>
  <transition name="ready" mode="out-in">
    <not-ready v-if="!ready"/>
    <app-shell v-else>
      <template v-slot:default>
        <router-view v-slot="{ Component }">
          <component :is="Component"
            :assets="assets"
            :logs="logs"
            :plans="plans"
            :quantities="quantities"
            :terms="terms"
            :users="users"/>
        </router-view>
      </template>
    </app-shell>
  </transition>
</template>

<script>
import { mapState } from 'vuex';
import AppShell from './shell/AppShell.vue';
import NotReady from './shell/NotReady.vue';
import { refreshCache } from './idb/cache';
import { loadFieldModules, updateFieldModules } from './field-modules';
import bundles, { loadConfigDocs, updateConfigDocs } from './store/configDocuments';
import { alert } from './store/alert';
import profile, { loadProfile, updateProfile } from './store/profile';
import settings from './store/settings';
import flattenEntity from './utils/flattenEntity';

export default {
  name: 'App',
  components: { AppShell, NotReady },
  provide() {
    return {
      bundles,
      profile,
      settings,
    };
  },
  data() {
    return {
      ready: false,
    };
  },
  created() {
    loadProfile()
      .then(loadConfigDocs)
      .then(loadFieldModules)
      .then(() => {
        updateProfile()
          .then(updateConfigDocs)
          .then(updateFieldModules)
          .catch((e) => { alert(e); })
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
            return refreshCache();
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
    }),
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
