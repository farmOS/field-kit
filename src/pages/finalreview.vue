<template>
  <q-page padding>
   <q-table
      :rows="rows"
      :columns="columns"
      title="Ladang Saya"
      :rows-per-page-options="[10]"
      row-key="name"
    >
       
      <template v-slot:body="props">
        <q-tr :props="props">
           
          <q-td key="desc" :props="props">
           {{ props.row.delete }}
            <q-btn round color="red-5" icon="mdi-delete" />
          </q-td>

          <q-td key="desc" :props="props">
            {{ props.row.name }}
            <q-popup-edit v-model="props.row.name" buttons v-slot="scope">
              <q-input v-model="scope.value" dense autofocus counter @keyup.enter="scope.set" />
            </q-popup-edit>
          </q-td>

          <q-td key="weight" :props="props">
            {{ props.row.weight }}
            <q-popup-edit v-model.number="props.row.weight" buttons v-slot="scope">
              <q-input type="number" v-model.number="scope.value" dense autofocus @keyup.enter="scope.set" />
            </q-popup-edit>
          </q-td>

          <q-td key="gender" :props="props">
            <div class="text-pre-wrap">{{ props.row.gender }}</div>
            <q-popup-edit v-model.number="props.row.gender" buttons v-slot="scope">
              <q-input clearable filled color="purple-12" v-model="text" label="Jantina" dense autofocus @keyup.enter="scope.set"  />
            </q-popup-edit>
          </q-td>

          <q-td key="value" :props="props">
            {{ props.row.value }}
            <q-popup-edit v-model.number="props.row.value" buttons persistent v-slot="scope">
              <q-input type="number" v-model.number="scope.value" dense autofocus @keyup.enter="scope.set" />
            </q-popup-edit>
          </q-td>

          <q-td key="date" :props="props">
            {{ props.row.date }}
            
            <q-popup-edit v-model.number="props.row.date" buttons label-set="Save" label-cancel="Close" v-slot="scope">
              <q-input v-model="date" filled type="date" hint="Tarikh" dense autofocus @keyup.enter="scope.set" />
            </q-popup-edit>
          </q-td>
          
        </q-tr>
      </template>
    </q-table>

    <q-btn round color="secondary" icon="mdi-plus" :to="{ path: 'harvesttype' }" />
    <q-btn round color="secondary" icon="mdi-text-box-check" :to="{ path: 'successpage' }" />
  
  </q-page>
</template>  

<script>
  import { ref } from 'vue'
const columns = [
  {name: 'delete', label: 'Padam' },
  { name: 'desc', align: 'left', label: 'Ternakan/Tanaman', field: 'name' },
  { name: 'weight', align: 'center', label: 'Berat(KG)', field: 'Berat(KG)' },
  { name: 'gender', label: 'Jantina(J/B)', field: 'Jantina(J/B)' },
  { name: 'value', label: 'Hasil Di Ladang($/KG)', field: 'Hasil Di Ladang($/KG)' },
  { name: 'date', label: 'Tarikh', field: 'Tarikh' },
 
]
const rows = [
  {
    name: 'Ayam',
    weight: '159',
    gender: 'Jantan',
    value: '3',
    date: '4/8/21',
   },

  {
    name: 'Kerbau',
    weight: '237',
    gender: 'Jantan',
    value: '7',
    date: '3/9/21',
   },

  {
    name: 'Biri Biri',
    weight: '262',
    gender: 'Jantan',
    value: '23',
    date: '11/9/2021',
   },

  {
    name: 'Ayam',
    weight: 305,
    gender: 'Betina',
    value: '67',
    date: '16/7/21',
  },

  {
    name: 'Kerbau',
    weight: '356',
    gender: 'Betina',
    value: '49',
    date: '25/8/2021',
   },

  {
    name: 'Biri Biri',
    weight: 375,
    gender: 'Betina',
    value: '94',
    date: '18/8/2021',
   },

  {
    name: 'Lobak',
    weight: 392,
    gender: '-',
    value: '1.5',
    date: '5/5/21',
 },

  {
    name: 'Bayam',
    weight: 408,
    gender: '-',
    value: '1.3',
    date: '6/5/21',
  },

  
]
export default {
  setup () {
    return {
      rows: ref(rows),
      columns
    }
  }
}
</script>
