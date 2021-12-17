<template>
  <q-page padding>

    <q-input standout="bg-teal text-white" label="Ketegori Tanaman" stack-label :dense="dense">
        <template v-slot:control>
          <div class="self-center full-width no-outline" tabindex="0">{{text}}</div>
        </template>
      </q-input>

       <q-input standout="bg-teal text-white" label="Jumlah Pohon" stack-label :dense="dense">
        <template v-slot:control>
          <div class="self-center full-width no-outline" tabindex="0">{{text}}</div>
        </template>
      </q-input>

       <q-input standout="bg-teal text-white" label="Jumlah Hasil" stack-label :dense="dense">
        <template v-slot:control>
          <div class="self-center full-width no-outline" tabindex="0">{{text}}</div>
        </template>
      </q-input>
      

      <q-btn :ripple="{ center: true }" color="secondary" label="Balik" no-caps :to="{ path: 'harvesttype' }" /> 
      <q-btn round color="secondary" icon="mdi-content-save" :to="{ path: 'flowerreview' }" />
      
  </q-page>
</template>

<script>
export default {
  // name: 'PageName',
}
</script>
