<template>
  <q-page padding>

     <q-btn
      padding="xl"
      color="secondary"
      round
      icon="mdi-corn" no-caps :to="{ path: 'vegelist' }"
    />

     <q-btn
      padding="xl"
      color="secondary"
      round
      icon="mdi-food-apple" no-caps :to="{ path: 'fruitlist' }"

    />
 
    <q-btn
      padding="xl"
      color="secondary"
      round
      icon="mdi-flower" no-caps :to="{ path: 'flowerlist' }"

    />

    <q-btn :ripple="{ center: true }" 
    color="secondary" 
    label="Back" no-caps :to="{ path: 'harvesttype' }" /> 

  </q-page>
</template>

<script>
export default {
  // name: 'PageName',
}
</script>
