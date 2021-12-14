<template>
  <q-page padding>
  <q-field standout="bg-teal text-white" label="Jenis Ternakan" stack-label :dense="dense">
        <template v-slot:control>
          <div class="self-center full-width no-outline" tabindex="0">{{text}}</div>
        </template>
      </q-field>

Indong
 <q-field standout="bg-teal text-white" label="Jantan" stack-label :dense="dense">
        <template v-slot:control>
          <div class="self-center full-width no-outline" tabindex="0">{{text}}</div>
        </template>
      </q-field>
 <q-field standout="bg-teal text-white" label="Betina" stack-label :dense="dense">
        <template v-slot:control>
          <div class="self-center full-width no-outline" tabindex="0">{{text}}</div>
        </template>
      </q-field>

Mendara
  <q-field standout="bg-teal text-white" label="Jantan" stack-label :dense="dense">
        <template v-slot:control>
          <div class="self-center full-width no-outline" tabindex="0">{{text}}</div>
        </template>
      </q-field>
 <q-field standout="bg-teal text-white" label="Betina" stack-label :dense="dense">
        <template v-slot:control>
          <div class="self-center full-width no-outline" tabindex="0">{{text}}</div>
        </template>
      </q-field>

Anak Binating
  <q-field standout="bg-teal text-white" label="Jantan" stack-label :dense="dense">
        <template v-slot:control>
          <div class="self-center full-width no-outline" tabindex="0">{{text}}</div>
        </template>
      </q-field>
 <q-field standout="bg-teal text-white" label="Betina" stack-label :dense="dense">
        <template v-slot:control>
          <div class="self-center full-width no-outline" tabindex="0">{{text}}</div>
        </template>
      </q-field>
 
<q-btn :ripple="{ center: true }" color="secondary" label="Back" no-caps :to="{ path: 'harvesttype' }" /> 
<q-btn :ripple="{ center: true }" color="secondary" label="Save" no-caps :to="{ path: 'meatreview' }" /> 
 </q-page>
 </template>
<script>
export default {
  // name: 'PageName',
}
</script>
