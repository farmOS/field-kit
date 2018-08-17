<template>
  <div id="app" class="html">
    <div class="main-container container-fluid">
      <div class="row">
        <section class="col-sm-12">

          <header>
            <img src='./farmOS.png' alt="" style="max-width: 200px; margin: 0.5rem 0">
            <h3 class="page-header">{{headerText}}</h3>
          </header>

          <div class="region region-content">
            <div class="block block-system">

              <router-view/>

            </div>
          </div>

        </section>
      </div>

      <div
        v-for="err in errors"
        :key="`err-${errors.indexOf(err)}`"
        class="alert alert-warning row">
        {{err.message}}
      </div>

    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'App',
  computed: mapState({
    headerText: state => state.shell.greeting,
    errors: state => state.shell.errors,
  }),

};
</script>

<style>

</style>
