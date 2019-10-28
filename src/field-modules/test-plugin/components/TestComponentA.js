export default {
  name: 'TestA',
  data() {
    return {
      count: 0,
    };
  },
  template: '<div><router-view name="menubar"/><h1>TestComponentA</h1><button v-on:click="count++">You clicked me {{ count }} times.</button></div>',
};
