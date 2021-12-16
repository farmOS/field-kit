<template>
  <q-page padding>

  <q-input standout="bg-teal text-white" label="Jenis Ternakan" stack-label :dense="dense">
        <template v-slot:control>
          <div class="self-center full-width no-outline" tabindex="0">{{text}}</div>
        </template>
      </q-input>

Indong
   <q-input standout="bg-teal text-white" label="Jantan" stack-label :dense="dense">
        <template v-slot:control>
          <div class="self-center full-width no-outline" tabindex="0">{{text}}</div>
        </template>
      </q-input>

    <q-input standout="bg-teal text-white" label="Betina" stack-label :dense="dense">
        <template v-slot:control>
          <div class="self-center full-width no-outline" tabindex="0">{{text}}</div>
        </template>
      </q-input>

Mendara
  <q-input standout="bg-teal text-white" label="Jantan" stack-label :dense="dense">
        <template v-slot:control>
          <div class="self-center full-width no-outline" tabindex="0">{{text}}</div>
        </template>
      </q-input>

   <q-input standout="bg-teal text-white" label="Betina" stack-label :dense="dense">
        <template v-slot:control>
          <div class="self-center full-width no-outline" tabindex="0">{{text}}</div>
        </template>
      </q-input>

Anak Binating
  <q-input standout="bg-teal text-white" label="Jantan" stack-label :dense="dense">
        <template v-slot:control>
          <div class="self-center full-width no-outline" tabindex="0">{{text}}</div>
        </template>
      </q-input>

  <q-input standout="bg-teal text-white" label="Betina" stack-label :dense="dense">
        <template v-slot:control>
          <div class="self-center full-width no-outline" tabindex="0">{{text}}</div>
        </template>
      </q-input>
 
  <q-btn :ripple="{ center: true }" color="secondary" label="Balik" no-caps :to="{ path: 'harvesttype' }" /> 
  <q-btn round color="secondary" icon="mdi-content-save" :to="{ path: 'meatreview' }" />

 </q-page>
 </template>
<script>
export default {
  // name: 'PageName',
}
</script>
