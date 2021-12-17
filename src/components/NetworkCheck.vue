<template>
  <q-dialog v-model="networkCheck" persistent>
    <q-card>
      <q-card-section class="row items-center">
        <q-avatar icon="signal_wifi_off" color="primary" text-color="white" />
        <span class="q-ml-sm">
          Aplikasi ini boleh digunakan tanpa menggunakan data. Apabila data
          sudah kembali, sila masuk semula untuk muat naik.
        </span>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Log Masuk Semula" color="primary" v-close-popup />
        <q-btn
          flat
          label="Terus ke Dashboard"
          color="primary"
          v-close-popup
          @click="this.$router.push({ path: '' })"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
export default defineComponent({
  name: 'NetworkCheck',
  setup() {
    return {
      networkCheck: ref(navigator.onLine),
    };
  },
});
</script>
