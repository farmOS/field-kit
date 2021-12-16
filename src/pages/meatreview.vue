<template>
  <q-page padding>
   Jual
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

   Sembilih   
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

    Lahir  
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
      
    Mati  
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
      
      <q-btn :ripple="{ center: true }" color="secondary" label="Balik" no-caps :to="{ path: 'meatlist' }" /> 
      <q-btn round color="secondary" icon="mdi-plus" :to="{ path: 'meatlist' }" />
      <q-btn round color="secondary" icon="mdi-text-box-search-outline" :to="{ path: 'finalreview' }" />

  </q-page>

</template>

<script>
export default {
  // name: 'PageName',
}
</script>
