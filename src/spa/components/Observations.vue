<template>
  <div class="well">
  <li v-for="i in recordText">
    <p> {{ recordText[i] }} </p><br>
  </li>
  </div>
</template>

<script>
/*
Currently non-functional.  Does not receive record store from the Data module
*/
export default {
  props: ['recordStore'],
  computed: {
    recordText () {
      // Make an array consisting of text from all records
      var recordArray = [];
      for (var i in this.recordStore) {
        // For each record, gather all record values and combine into a string
        console.log('recordStore i');
        console.log(this.recordStore[i]);
        var oneRecord = '';
          for (var j in this.recordStore[i]) {
          oneRecord = oneRecord+this.recordStore[i][j];
          console.log('record: '+this.recordStore[i][j]);
          }
        recordArray.push(oneRecord);
        //recordArray.push(this.recordStore[i].index);
      }
      return recordArray;
    }, //end recordText
  },
  methods: {}
}
</script>

<style scoped>

</style>
