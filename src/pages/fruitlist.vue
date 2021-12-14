<template>
  <q-page padding>

     <q-field standout="bg-teal text-white" label="Jenis Buah" stack-label :dense="dense">
        <template v-slot:control>
          <div class="self-center full-width no-outline" tabindex="0">{{text}}</div>
        </template>

      </q-field>
       <q-field standout="bg-teal text-white" label="Berat tanaman dalam KG" stack-label :dense="dense">
        <template v-slot:control>
          <div class="self-center full-width no-outline" tabindex="0">{{text}}</div>
        </template>

      </q-field>
       <q-field standout="bg-teal text-white" label="Pohon Yang Berbuah" stack-label :dense="dense">
        <template v-slot:control>
          <div class="self-center full-width no-outline" tabindex="0">{{text}}</div>
        </template>

      </q-field>
       <q-field standout="bg-teal text-white" label="KELUASAN DIUSAHAKAN MENGIKUT JENIS BUAH (Hektar)" stack-label :dense="dense">
        <template v-slot:control>
          <div class="self-center full-width no-outline" tabindex="0">{{text}}</div>
        </template>

      </q-field>
       <q-field standout="bg-teal text-white" label="HARGA HASIL DI LADANG / UNIT (B$/KG)" stack-label :dense="dense">
        <template v-slot:control>
          <div class="self-center full-width no-outline" tabindex="0">{{text}}</div>
        </template>
      </q-field>

      <q-btn :ripple="{ center: true }" color="secondary" label="Back" no-caps :to="{ path: 'harvesttype' }" /> 
      <q-btn :ripple="{ center: true }" color="secondary" label="Save" no-caps :to="{ path: 'fruitreview' }" /> 

  </q-page>
</template>

<script>
export default {
  // name: 'PageName',
}
</script>
