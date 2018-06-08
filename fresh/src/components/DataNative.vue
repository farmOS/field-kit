<template>
 <div></div>
</template>

<script>
export default {
  data () {
  return {
    defaultObservations: [
      {name: 'White corn', date: 1001, notes:'It has all gone white!', quantity: 0},
      {name: 'Tomato aphids', date: 1002, notes:'The plants are covered!', quantity: 9001},
      {name: 'Giant pumpkins', date: 1003, notes:'Giant pumpkins in the field', quantity: 5}      
    ], //end default observations

  assets: {
    plantings: {Corn: {name: 'Corn', location: 'Field 1'},
      Alfalfa: {name: 'Alfalfa', location: 'Field 2'},
      Pumpkins: {name: 'Pumpkins', location: 'Field 3'}
    },
    locations: {Field1: {name: 'Field 1', area: 5.5},
      Field2: {name: 'Field 2', area: 4},
      Field3: {name: 'Field 3', area: 1.5},
      Paddock: {name: 'Dairy paddock', area: 1},
      Pasture1: {name: 'Pasture 1', area: 12},
      Pasture2: {name: 'Pasture 2', area: 6},
    },
    livestock: {Livestock1: {name: 'D1', class: 'dairy cow'},
      Livestock2: {name: 'D2', class: 'dairy cow', location: 'Pasture 1'},
      Livestock3: {name: 'D3', class: 'dairy cow', location: 'Pasture 1'},
      Livestock4: {name: 'D4', class: 'dairy cow', location: 'Dairy paddock'},
      Livestock5: {name: 'D5', class: 'dairy cow', location: 'Pasture 1'},
      Livestock6: {name: 'D6', class: 'dairy cow', location: 'Pasture 1'},
      Livestock7: {name: 'D7', class: 'dairy cow', location: 'Pasture 1'},
      Livestock8: {name: 'B1', class: 'beef cow', location: 'Pasture 2'},
      Livestock9: {name: 'B1', class: 'beef cow', location: 'Pasture 2'},
      Livestock10: {name: 'B1', class: 'beef cow', location: 'Pasture 2'}
    }

  } //end assets
} //end return
}, //end data
  //Trying to compute a store for records based on all assets
  /*
  computed: {
    observations () {
      var index = 0;
      var newObs = {template: {text: 'text'}};
      console.log('***the assets***')
      console.log(this.assets)
      for (var i in this.assets) {
        //this.assets is undefined

        //newObs[0][i] = this.assets[i];
        Vue.set(newObs.template,i,i)
      }
      console.log('data module observations:')
      for (var i in newObs.template) {
        console.log(newObs.template[i])
      }
      return newObs;
    }
  },
  */
  methods: {
    dataResponse (query) {

    }
  } // end methods
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
