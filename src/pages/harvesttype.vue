<template>
  <q-page padding>
      <q-btn
      padding="xl"
      color="secondary"
      round
      icon="eco"
      :to="{ path: 'croptype' }"
    />

    <q-btn
      padding="xl"
      color="secondary"
      round
      icon= "eco"
      :to="{ path: 'meatlist' }"
    />
<q-btn :ripple="{ center: true }" color="secondary" label="Back" no-caps :to="{ path: 'dashboard' }" /> 
  </q-page>
</template>

<script>
export default {
  // name: 'PageName',
}
</script>
