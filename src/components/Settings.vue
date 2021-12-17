<template>
  <q-page padding>
    <div class="q-pa-md" style="max-width: 350px">
      <q-item>
        <q-item-section side>
          <q-avatar rounded size="70px">
            <img src="https://cdn.quasar.dev/img/avatar.png" />
            <!-- <q-badge floating color="teal">new</q-badge> -->
          </q-avatar>
        </q-item-section>
        <q-item-section>
          <q-item-label>Mahmud</q-item-label>
          <q-item-label caption>Ladang Mahmud dan Anak-Anak</q-item-label>
        </q-item-section>
      </q-item>
      <!-- TODO: Get the Logout to work -->
      <q-btn
        color="red-5"
        icon="mdi-logout"
        label="LOG KELUAR"
        @click="logout"
      />
      <q-separator spaced />
      <q-list bordered padding>
        <q-item-label header>Kontrol-kontrol Pengguna</q-item-label>

        <q-item clickable v-ripple>
          <q-item-section>
            <q-item-label>Akaun Pentadbiran</q-item-label>
            <q-item-label caption>
              Sila tetapkan tahap isi kandungan aplikasi kepada terhad yang
              boleh dimuat turun
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-item clickable v-ripple>
          <q-item-section>
            <q-item-label>Tukar Kata-Haluan</q-item-label>
            <q-item-label caption>
              Dimestikan menggunakan kata-haluan untuk mengemaskan data dan muat
              naik data
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-separator spaced />
        <q-item-label header>Umum</q-item-label>

        <q-item tag="label" v-ripple>
          <q-item-section side top>
            <q-checkbox v-model="generalNotification" />
          </q-item-section>

          <q-item-section>
            <q-item-label>Pemberitahuan</q-item-label>
            <q-item-label caption>
              Sila beri notifikasi tentang kemaskini bagi aplikasi atau
              promosi-promosi
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-item tag="label" v-ripple>
          <q-item-section side top>
            <q-checkbox v-model="enableAutoUpdate" />
          </q-item-section>

          <q-item-section>
            <q-item-label>Kemaskini Aplikasi Secara Automatik</q-item-label>
            <q-item-label caption>
              Kemaskini dengan aplikasi sendirinya pada bila-bila masa. Mungkin
              akan dikenakan caj.
            </q-item-label>
          </q-item-section>
        </q-item>

        <q-separator spaced />
        <q-item-label header>Tetapan Lanjutan</q-item-label>

        <q-item tag="label" v-ripple @click="$q.dark.toggle()">
          <q-item-section>
            <q-item-label>Mod Gelap</q-item-label>
            <q-item-label caption
              >Ingin menggunakan Mod Gelap atau tidak?</q-item-label
            >
          </q-item-section>
          <q-item-section side>
            <q-toggle color="blue" v-model="darkMode" />
          </q-item-section>
        </q-item>
        <q-separator spaced />
      </q-list>
    </div>
  </q-page>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useStore } from 'src/store';
import { useQuasar } from 'quasar';

export default defineComponent({
  name: 'Settings',
  setup() {
    const darkMode = ref(true);
    const $q = useQuasar();
    $q.dark.set(darkMode.value);
    let pictureUploadNotification = ref(false);
    let enableAutoUpdate = ref(true);
    let generalNotification = ref(true);

    const store = useStore();

    const logout = () => {
      // Call logout function from farmos.js
      void store.dispatch('authModule/logout');

      // Remove logs, assets, areas, user info & site info from store & local persistance
      store.commit('farmModule/deleteAllLogs');
      void store.dispatch('farmModule/deleteAllCachedLogs');
      store.commit('farmModule/deleteAllAssets');
      void store.dispatch('farmModule/deleteAllCachedAssets');
      store.commit('farmModule/deleteAllAreas');
      void store.dispatch('farmModule/deleteAllCachedAreas');
      store.commit('farmModule/deleteAllUnits');
      void store.dispatch('farmModule/deleteAllCachedUnits');
      store.commit('farmModule/deleteAllCategories');
      void store.dispatch('farmModule/deleteAllCachedCategories');
      void store.dispatch('farmModule/deleteCachedUserAndSiteInfo');

      // Set login status to false and return to login screen
      store.commit('authModule/setLoginStatus', false);
      // $router.push({ path: '/' });
      console.log('Logged out...');
    };

    return {
      darkMode,
      pictureUploadNotification,
      enableAutoUpdate,
      generalNotification,
      logout,
    };
  },
});
</script>
