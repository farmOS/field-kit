<template>
  <q-page padding>
      <q-btn
      padding="xl"
      color="secondary"
      round
      icon="mdi-seed"
      :to="{ path: 'croptype' }"
    />

    <q-btn
      padding="xl"
      color="secondary"
      round
      icon= "mdi-food-drumstick"
      :to="{ path: 'meatlist' }"
    />
<q-btn :ripple="{ center: true }" color="secondary" label="Balik" no-caps :to="{ path: 'dashboard' }" /> 
  </q-page>
</template>

<script>
export default {
  // name: 'PageName',
}
</script>
