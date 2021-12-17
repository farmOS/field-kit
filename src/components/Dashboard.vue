<template>
  <div class="q-pa-md">
    <NetworkCheck />
    <q-markup-table flat bordered>
      <thead class="bg-teal">
        <tr>
          <th colspan="6">
            <div class="row no-wrap items-center">
              <q-img style="width: 70px" :ratio="1" class="rounded-borders" />

              <div class="text-h4 q-ml-md text-white">Ladang Saya</div>
            </div>
          </th>
        </tr>
        <tr>
          <th class="text-left">Ternakan/Tanaman</th>
          <th class="text-right">Berat(KG)</th>
          <th class="text-right">Jantina(J/B)</th>
          <th class="text-right">
            Keluasan Diusahakan Mengikut Jenis Tanaman(Hektar)
          </th>
          <th class="text-right">Hasil Di Ladang($/KG)</th>
          <th class="text-right">Tarikh</th>
        </tr>
      </thead>
      <tbody class="bg-grey-3">
        <tr>
          <td class="text-left">Kerbau</td>
          <td class="text-right">10</td>
          <td class="text-right">M</td>
          <td class="text-right">-</td>
          <td class="text-right">5.5</td>
          <td class="text-right">11/9/2021</td>
        </tr>

        <tr>
          <td class="text-left">Lembu</td>
          <td class="text-right">5</td>
          <td class="text-right">F</td>
          <td class="text-right">-</td>
          <td class="text-right">7.3</td>
          <td class="text-right">25/8/2021</td>
        </tr>

        <tr>
          <td class="text-left">Kambing</td>
          <td class="text-right">6</td>
          <td class="text-right">F</td>
          <td class="text-right">-</td>
          <td class="text-right">9.5</td>
          <td class="text-right">12/10/2021</td>
        </tr>

        <tr>
          <td class="text-left">Biri-Biri</td>
          <td class="text-right">7</td>
          <td class="text-right">M</td>
          <td class="text-right">-</td>
          <td class="text-right">9.1</td>
          <td class="text-right">22/11/2021</td>
        </tr>

        <tr>
          <td class="text-left">Rusa</td>
          <td class="text-right">8</td>
          <td class="text-right">M</td>
          <td class="text-right">-</td>
          <td class="text-right">3.5</td>
          <td class="text-right">18/8/2021</td>
        </tr>

        <tr>
          <td class="text-left">Tarap</td>
          <td class="text-right">20</td>
          <td class="text-right">-</td>
          <td class="text-right">7</td>
          <td class="text-right">5.5</td>
          <td class="text-right">10/9/2021</td>
        </tr>

        <tr>
          <td class="text-left">Bayam</td>
          <td class="text-right">15</td>
          <td class="text-right">-</td>
          <td class="text-right">4</td>
          <td class="text-right">3</td>
          <td class="text-right">8/12/2021</td>
        </tr>
      </tbody>
    </q-markup-table>

    <div class="row justify-end">
      <q-fab
        color="secondary"
        vertical-actions-align="right"
        icon="mdi-plus"
        direction="up"
      >
        <!-- TODO: Do a loop -->
        <q-fab-action
          label="Sayur"
          @click="this.$router.push({ path: 'vegelist' })"
          color="light-green-6"
          icon="mdi-corn"
        />
        <q-fab-action
          label="Buah"
          @click="this.$router.push({ path: 'fruitlist' })"
          color="orange-6"
          icon="mdi-food-apple"
        />
        <q-fab-action
          label="Bunga"
          @click="this.$router.push({ path: 'flowerlist' })"
          color="pink-6"
          icon="mdi-flower"
        />
        <q-fab-action
          color="brown-6"
          icon="mdi-food-drumstick"
          label="Ternakan"
          @click="this.$router.push({ path: 'meatlist' })"
        />
      </q-fab>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import NetworkCheck from 'components/NetworkCheck.vue';

export default defineComponent({
  name: 'Dashboard',
  components: {
    NetworkCheck,
  },
  setup() {
    return {};
  },
});
</script>
