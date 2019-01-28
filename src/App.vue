<template>
  <div id="app" class="html">
    <transition name="filter">
      <div class="modal-filter" v-if="showDrawer" @click="showDrawer = !showDrawer"/>
    </transition>
    <header class="navbar navbar-light fixed-top bg-light">
      <div class="menu" @click="showDrawer = !showDrawer">
        <icon-menu/>
      </div>
      <img class="logo" src='./farmOS.png' alt="farmOS">
    </header>

    <transition name="drawer">
      <div class="drawer" v-if="showDrawer">
        <div class="arrow-back" @click="showDrawer = !showDrawer">
          <icon-arrow-back/>
        </div>
      </div>
    </transition>

    <div class="main-container container-fluid">
      <div class="row">
        <section class="col-sm-12">

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

              <router-view/>

            </div>
          </div>

        </section>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import IconMenu from './icons/icon-menu.vue';
import IconArrowBack from './icons/icon-arrow-back.vue';

export default {
  name: 'App',
  components: { IconMenu, IconArrowBack },
  data() {
    return {
      showDrawer: false,
    };
  },
  computed: mapState({
    errors: state => state.shell.errors,
  }),
  methods: {
    closeError(index) {
      this.$store.commit('dismissError', index)
    },
  },
};
</script>

<style scoped>
  .close {
    position: absolute;
    top: 5px;
    right: 5px;
  }

  .logo {
    max-height: 1.5rem;
  }

  .drawer {
    position: fixed;
    top: 0;
    height: 100vh;
    width: 80vw;
    background-color: #eee;
    z-index: 2000;
  }

  .modal-filter {
    position: absolute;
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

  .arrow-back, .menu {
    fill: var(--gray-dark);
  }

  .arrow-back {
    margin: 0.5rem 1rem;
  }

  .main-container {
    margin-top: 3rem;
  }

</style>
