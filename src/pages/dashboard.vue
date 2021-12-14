<template>
  <q-page padding>
    <div class="q-pa-md">
    <q-markup-table flat bordered>
      <thead class="bg-teal">
        <tr>
          <th colspan="5">
            <div class="row no-wrap items-center">
              <q-img
                style="width: 70px"
                :ratio="1"
                class="rounded-borders"
              />

              <div class="text-h4 q-ml-md text-white">Ladang Saya</div>
            </div>
          </th>
        </tr>
        <tr>
          <th class="text-left">Ternakan/Tanaman</th>
          <th class="text-right">Berat(KG)</th>
          <th class="text-right">Jantina(M/F)</th>
          <th class="text-right">Hasil Di Ladang($/KG)</th>
          <th class="text-right">Tarikh</th>
        </tr>
      </thead>
      <tbody class="bg-grey-3">
        
         <tr>
          <td class="text-left">Kerbau</td>
          <td class="text-right">10</td>
          <td class="text-right">M</td>
          <td class="text-right">5.5</td>
          <td class="text-right">11/9/2021</td>
        </tr>

         <tr>
          <td class="text-left">Lembu</td>
          <td class="text-right">5</td>
          <td class="text-right">F</td>
          <td class="text-right">7.3</td>
          <td class="text-right">25/8/2021</td>
        </tr>

         <tr>
          <td class="text-left">Kambing</td>
          <td class="text-right">6</td>
          <td class="text-right">F</td>
          <td class="text-right">9.5</td>
          <td class="text-right">12/6/2021</td>
        </tr>

        <tr>
          <td class="text-left">Biri-Biri</td>
          <td class="text-right">7</td>
          <td class="text-right">M</td>
          <td class="text-right">9.1</td>
          <td class="text-right">22/4/2021</td>
        </tr>

        <tr>
          <td class="text-left">Rusa</td>
          <td class="text-right">8</td>
          <td class="text-right">M</td>
          <td class="text-right">3.5</td>
          <td class="text-right">18/8/2021</td>
        </tr>
      </tbody>
    </q-markup-table>
  </div>
  <q-btn round color="secondary" icon="directions" :to="{ path: 'harvesttype' }" />
  <q-btn :ripple="{ center: true }" color="secondary" label="Settings" no-caps :to="{ path: 'settings' }" />  
  </q-page>
</template>

<script>
export default {
  // name: 'PageName',
}
</script>
