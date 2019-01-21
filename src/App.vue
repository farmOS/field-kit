<template>
  <div id="app" class="html">
    <div class="main-container container-fluid">
      <div class="row">
        <section class="col-sm-12">

          <header>
            <img src='./farmOS.png' alt="" style="max-width: 200px; margin: 0.5rem 0">
          </header>

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

export default {
  name: 'App',
  computed: mapState({
    errors: state => state.shell.errors,
  }),
  methods: {
    closeError(index) {
      this.$store.commit('dismissError', index)
    },
    onDeviceReady() {
      console.log('RECEIVED DEVICEREADY CALL IN APP.VUE');
      this.$store.dispatch('getGeolocation');
    },
  },
  created() {
    document.addEventListener('deviceready', this.onDeviceReady(), false);
  },
};
</script>

<style scoped>
  .close {
    position: absolute;
    top: 5px;
    right: 5px;
  }
</style>
