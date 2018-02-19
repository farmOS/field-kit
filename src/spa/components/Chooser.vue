<template>
  <!-- A template must always have a static element at its root -->
  <!-- Apparently I don't use this.object notation in templates, only in script -->
  <!-- In v-for list rendering, i is the actual list object, not an index -->
  <div class="well">
  <li v-for="i in toChoose">
    <button @click="didChoose(i)" class="btn btn-default" type="button" >{{ i }}</button>
  </li>
  </div>
</template>

<script>
export default {
  props: ['toChoose'],
  /*
  computed: {
    choices () {
      var choiceList = []
       for (var i in this.toChoose) {
         this.choiceList.push(this.toChoose[i]);
       }
      return choiceList
    }
  },
  */
  methods: {
    didChoose (name) {
      console.log('Made choice: '+name)
      this.$emit('didChoose', name);
    }
  } // methods
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
