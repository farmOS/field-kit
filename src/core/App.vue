<template>
<transition name="ready" mode="out-in">
  <div v-if="!ready" class="not-ready" key="not-ready">
    <farm-stack align="center" space="s">
      <img src="icons/icon-72x72.png" alt="farmOS leaf icon">
      <farm-text as="span" size="l">Getting ready...</farm-text>
    </farm-stack>
  </div>
  <div v-if="ready" class="app-container" key="ready">
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
            <div class="user-info">
              <h2>{{ farm.name }}</h2>
              <p>{{ farm.url.replace(/(^\w+:|^)\/\//, '') }}</p>
              <p>{{ user.display_name }}</p>
            </div>
          </div>
        </header>
        <farm-list>
          <router-link to="/home" @click.native="showDrawer = !showDrawer">
            <farm-list-item>{{ $t('Home') }}</farm-list-item>
          </router-link>
        </farm-list>
        <farm-list>
          <farm-list-item
            v-for="module in modules"
            :key="`${module.name}-menu-link`"
            @click="handleModuleClick(module)">
            {{$t(module.label)}}
          </farm-list-item>
        </farm-list>
        <farm-list>
          <farm-list-item :clickable="false">
            <farm-toggle-check
              :label="$t('Share My Location')"
              labelPosition="before"
              :checked="settings.useGeolocation"
              @input="setUseGeolocation($event)"/>
          </farm-list-item>
          <!-- <farm-list-item v-if="langs.length > 0">
            <label>{{$t('Select Language')}}</label><br>
            <div class="form-check">
              <input
                type="radio"
                class="form-check-input"
                name="language"
                id="lang1"
                value="en"
                @input="setLocale"
                :checked="isLocale('en')"/>
              <label for="lang1"  class="form-check-label">
                {{ $t('English') }}
              </label>
            </div>
            <div
              v-for="(lang, i) in langs"
              :key="`lang-${i}`"
              class="form-check">
              <input
                type="radio"
                class="form-check-input"
                name="language"
                :id="`lang-${i}`"
                :value="lang.language"
                @input="setLocale"
                :checked="isLocale(lang.language)"/>
              <label :for="`lang-${i}`"  class="form-check-label">
                {{ lang.native }}
              </label>
            </div>
          </farm-list-item> -->
          <farm-list-item :clickable="false">{{ $t('Version')}}: {{version}}</farm-list-item>
          <router-link to="/logout" @click.native="showDrawer = !showDrawer">
            <farm-list-item>{{ $t('Logout') }}</farm-list-item>
          </router-link>
        </farm-list>

      </div>
    </transition>

    <router-view
      name="menubar"
      @toggle-drawer="showDrawer = !showDrawer"
    />
    <router-view
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
      :areaGeoJSON="areaGeoJSON"
      @toggle-drawer="showDrawer = !showDrawer"
    />

    <div
      v-for="(err, index) in errors"
      :key="`alert-${index}`"
      class="alerts">
      <div
        class="alert alert-warning alert-dismissable" >
        <span v-html="err.message"></span>
        <button
          type="button"
          @click="dismissAlert(index)"
          class="close"
          aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
    </div>

  </div>
</transition>
</template>

<script>
import { mapActions, mapMutations, mapState } from 'vuex';
import { version } from '../../package.json';

export default {
  name: 'App',
  data() {
    return {
      ready: false,
      version,
      showDrawer: false,
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
          .then(this.purgeEntities)
          .catch((e) => { this.alert(e); })
          .finally(() => { this.ready = true; });
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
      assets: state => state.assets,
      logs: state => state.logs,
      plans: state => state.plans,
      quantities: state => state.quantities,
      terms: state => state.terms,
      users: state => state.users,
      assetTypes: state => state.assetTypes,
      logTypes: state => state.logTypes,
      planTypes: state => state.planTypes,
      quantityTypes: state => state.quantityTypes,
      termTypes: state => state.termTypes,
      userTypes: state => state.userTypes,
    }),
  },
  watch: {
    showDrawer(currentShowDrawer) {
      if (currentShowDrawer) {
        document.querySelector('body').setAttribute('style', 'overflow-y: hidden');
      } else {
        document.querySelector('body').setAttribute('style', 'overflow-y: visible');
      }
    },
  },
  methods: {
    ...mapMutations(['alert', 'dismissAlert']),
    ...mapActions([
      'loadProfile',
      'loadConfigDocs',
      'loadFieldModules',
      'updateProfile',
      'updateConfigDocs',
      'updateFieldModules',
      'purgeEntities',
    ]),
    // setUseGeolocation(checked) {
    //   this.$store.commit('setUseGeolocation', checked);
    // },
    handleModuleClick(module) {
      if (module.routes[0].path !== this.$route.path) {
        this.$router.push(module.routes[0].path);
      }
      this.showDrawer = !this.showDrawer;
    },
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
  .ready-enter-active, .ready-leave-active {
    transition: opacity .5s;
  }
  .ready-enter, .ready-leave-to {
    opacity: 0;
  }
  .not-ready {
    height: 100vh;
    padding-top: calc(50vh - 48px);
  }
  .not-ready img {
    height: 48px;
  }
  .not-ready span {
    -webkit-animation: pulse 1250ms infinite;
    animation: pulse 1250ms infinite;
  }
  @keyframes pulse {
    from { opacity: 1; }
    50% { opacity: .5; }
    to { opacity: 1; }
  }
  @-webkit-keyframes pulse {
    from { opacity: 1; }
    50% { opacity: .5; }
    to { opacity: 1; }
  }

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
    background-color: var(--white);
    z-index: 2000;
    overflow-y: auto;
  }

  .modal-filter {
    position: fixed;
    top: 0;
    height: 100%;
    width: 100%;
    background-color: var(--dark-transparent);
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

  .drawer a, .drawer a:hover {
    text-decoration: none;
    color: inherit;
  }

  .alerts {
    position: absolute;
    z-index: 1001;
    bottom: var(--s);
    right: var(--s);
    left: var(--s);
    text-align: center;
  }

  .alert {
    display: inline-block;
    box-shadow: var(--shadow-strong);
  }

</style>
