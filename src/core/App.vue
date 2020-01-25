<template>
  <div id="app" class="html">
    <transition name="filter">
      <div class="modal-filter" v-if="showDrawer" @click="showDrawer = !showDrawer"/>
    </transition>

    <transition name="drawer">
      <div class="drawer container-fluid" v-if="showDrawer">
        <header class="drawer-header row">
          <div class="col">
            <div class="arrow-back" @click="showDrawer = !showDrawer">
              <icon-arrow-back/>
            </div>
            <div v-if="isLoggedIn" class="user-info">
              <h2>{{ farmName }}</h2>
              <p>{{ farmUrl }}</p>
              <p>{{ username}}</p>
            </div>
            <div v-else class="user-info">
              <h2>Welcome to farmOS</h2>
              <p>Login for more options.</p>
            </div>
          </div>
        </header>
        <module-menu-items :modules="modules" @click.native="showDrawer = !showDrawer"/>
        <drawer-list>
          <router-link to="/homescreen" @click="showDrawer = !showDrawer">
            <drawer-list-item>Home</drawer-list-item>
          </router-link>
          <drawer-list-item :clickable="false">
            <label for="location-switch">Share My Location&nbsp;</label>
            <input
              id="location-switch"
              class="toggle-check"
              type="checkbox"
              :checked="useGeolocation"
              @input="setUseGeolocation($event.target.checked)"/>
          </drawer-list-item>
          <drawer-list-item :clickable="false">Version: {{version}}</drawer-list-item>
          <router-link to="/login" v-if="!isLoggedIn" @click.native="showDrawer = !showDrawer">
            <drawer-list-item >Login</drawer-list-item>
          </router-link>
          <router-link to="/logout" v-if="isLoggedIn" @click.native="showDrawer = !showDrawer">
            <drawer-list-item>Logout</drawer-list-item>
          </router-link>
        </drawer-list>

      </div>
    </transition>

    <main>
      <section>

        <div
          v-for="(err, index) in errors"
          :key="`err-${errors.indexOf(err)}`">
          <div
            v-if="err.show"
            class="alert alert-warning alert-dismissable" >
            <span v-html="err.message"></span>
            <button
              type="button"
              @click="closeError(index)"
              class="close"
              aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
        </div>

        <div class="region region-content">
          <div class="block block-system">

            <router-view
              name="menubar"
              @toggleDrawer="showDrawer = !showDrawer"
            />

            <router-view
              :useGeolocation="useGeolocation"
              :userId='userId'
              :systemOfMeasurement='systemOfMeasurement'
              :logTypes='logTypes'
              :logs='removeMetaData(logs)'
              :areas='areas'
              :assets='assets'
              :units='units'
              :categories='categories'
              :equipment='equipment'
              :areaGeoJSON='areaGeoJSON'
              @toggleDrawer="showDrawer = !showDrawer"
            />

          </div>
        </div>

      </section>
    </main>
  </div>
</template>

<script>
import Vue from 'vue';
import { mapState, mapGetters } from 'vuex';
import IconMenu from '@/components/icons/icon-menu';
import IconArrowBack from '@/components/icons/icon-arrow-back';
import DrawerList from '@/components/DrawerList';
import DrawerListItem from '@/components/DrawerListItem';
import { version } from '../../package.json';

const removeMetaData = entities => entities
  .map(entity => Object.fromEntries(
    Object.entries(entity).map(([key, val]) => (
      typeof val === 'object' && 'data' in val
        ? [key, val.data]
        : [key, val]
    )),
  ));

const ModuleMenuItems = Vue.component('module-menu-items', {
  render(createElement) {
    const self = this;
    return createElement('div', this.modules.map(module => createElement(
      `${module.name}-drawer-items`,
      {
        nativeOn: {
          click() {
            self.$store.commit('setCurrentModule', module.name);
            self.$store.commit('filterLogs', log => log.modules.includes(module.name));
            self.$store.dispatch('loadCachedLogs');
          },
        },
      },
    )));
  },
  props: {
    modules: {
      type: Array,
      required: true,
    },
  },
});

export default {
  name: 'App',
  components: {
    ModuleMenuItems,
    IconMenu,
    IconArrowBack,
    DrawerList,
    DrawerListItem,
  },
  data() {
    return {
      showDrawer: false,
      version,
    };
  },
  created() {
    this.$store.commit('setCurrentModule', this.$route.meta.module);
    this.$store.dispatch('loadCachedUserAndSiteInfo');
    this.$store.dispatch('updateUserAndSiteInfo');
    this.$store.dispatch('loadCachedLogs');
    this.$store.dispatch('loadCachedAssets');
    this.$store.dispatch('loadCachedAreas');
    this.$store.dispatch('loadCachedUnits');
    this.$store.dispatch('loadCachedCategories');
  },
  computed: {
    ...mapState({
      /**
       * SHELL STATE
       */
      errors: state => state.shell.errors,
      username: state => state.shell.user.name,
      userId: state => state.shell.user.uid,
      isLoggedIn: state => state.shell.user.isLoggedIn,
      useGeolocation: state => state.shell.settings.useGeolocation,
      systemOfMeasurement: state => state.shell.systemOfMeasurement,
      logTypes: state => state.shell.logTypes,
      farmName: state => state.shell.farmInfo.name,
      // Provide an example url for the dev server environment
      farmUrl: state => ((state.shell.farmInfo.url === '')
        ? 'example.farmos.net'
        : state.shell.farmInfo.url?.replace(/(^\w+:|^)\/\//, '')),
      modules: state => state.shell.modules,
      areaGeoJSON: state => state.shell.areaGeoJSON,

      /**
       * FARM STATE
       */
      logs: state => state.farm.logs,
      areas: state => state.farm.areas,
      assets: state => state.farm.assets,
      units: state => state.farm.units,
      categories: state => state.farm.categories,
    }),
    ...mapGetters([
      'equipment',
    ]),
  },
  watch: {
    showDrawer(currentShowDrawer) {
      if (currentShowDrawer) {
        document.querySelector('body').setAttribute('style', 'overflow-y: hidden');
      } else {
        document.querySelector('body').setAttribute('style', 'overflow-y: visible');
      }
    },
    $route(to) {
      this.$store.commit('setCurrentModule', to.meta.module);
    },
  },
  methods: {
    closeError(index) {
      this.$store.commit('dismissError', index);
    },
    setUseGeolocation(checked) {
      this.$store.commit('setUseGeolocation', checked);
    },
    removeMetaData,
  },
};
</script>

<style scoped>
  .close {
    position: absolute;
    top: 5px;
    right: 5px;
  }

  .drawer {
    position: fixed;
    top: 0;
    height: 100vh;
    width: 80vw;
    background-color: white;
    z-index: 2000;
    overflow-y: auto;
  }

  .modal-filter {
    position: fixed;
    top: 0;
    height: 100%;
    width: 100%;
    background-color: #000;
    opacity: .25;
    z-index: 1500;
  }

  .drawer-enter, .drawer-leave-to {
    transform: translateX(-80vw);
  }

  .filter-enter, .filter-leave-to {
    opacity: 0;
  }

  .drawer-enter-active, .drawer-leave-active,
  .filter-enter-active, .filter-leave-active {
    transition: all .3s ease;
  }

  .drawer header {
    background-color: var(--farmos-green-dark);
    color: white;
    height: 9rem;
  }

  .arrow-back, .menu {
    fill: var(--gray-dark);
  }

  .arrow-back {
    fill: white;
    margin-top: 0.5rem;
  }

  main {
    margin-top: 3rem;
  }

  .drawer a, .drawer a:hover {
    text-decoration: none;
    color: inherit;
  }

  input.toggle-check {
    position: relative;
    -webkit-appearance: none;
    outline: none;
    width: 1.6667rem;
    height: 1rem;
    background-color: #fff;
    border: 1px solid #D9DADC;
    border-radius: 1.6667rem;
    box-shadow: inset -0.6667rem 0 0 0 #fff;
  }

  input.toggle-check:after {
    content: "";
    position: absolute;
    top: 1px;
    left: 1px;
    background: transparent;
    width: 0.8667rem;
    height: 0.8667rem;
    border-radius: 50%;
    box-shadow: 1px 0px 2px rgba(0,0,0,0.2);
  }

  input.toggle-check:checked {
    box-shadow: inset 0.6667rem 0 0 0 var(--cyan);
    border-color: var(--cyan);
  }

  input.toggle-check:checked:after {
    left: 0.6667rem;
    box-shadow: -1px 0px 2px rgba(0,0,0,0.05);
  }

</style>
