<template>
  <q-page padding>
   Jual
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

   Sembilih   
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

    Lahir  
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
      
    Mati  
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
      
<q-btn :ripple="{ center: true }" color="secondary" label="Back" no-caps :to="{ path: 'meatlist' }" /> 
<q-btn :ripple="{ center: true }" color="secondary" label="Tambah" no-caps :to="{ path: 'meatlist' }" /> 
<q-btn :ripple="{ center: true }" color="secondary" label="Review" no-caps :to="{ path: 'finalreview' }" /> 

  </q-page>

</template>

<script>
export default {
  // name: 'PageName',
}
</script>
