<template>
  <div id="home">
    <div class="container-fluid">
      <home-widgets :modules="modules"/>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import { mapState } from 'vuex';

const HomeWidgets = Vue.component('home-widgets', { // eslint-disable-line no-unused-vars
  render(createElement) {
    const self = this;
    return createElement(
      'div',
      { class: 'card-deck' },
      this.modules.map(module => createElement(
        'farm-card',
        {
          nativeOn: {
            click() {
              self.$router.push(module.routes[0].path);
            },
          },
        },
        [createElement(
          'farm-card-body',
          [
            createElement('h4', module.label),
            createElement(`${module.name}-widget`),
          ],
        )],
      )),
    );
  },
  props: {
    modules: {
      type: Array,
      required: true,
    },
  },
});

export default {
  name: 'Home',
  computed: mapState({
    modules: state => state.shell.modules,
  }),
};

</script>

<style scoped>
  #home {
    background-color: #eee;
  }

  .container-fluid {
    max-width: 700px;
    min-height: calc(100vh - 3rem);
    margin: auto;
    background-color: #eee;
    padding: 15px;
  }
</style>
