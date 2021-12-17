<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title>
          <img src="Logo-KebunKitani.png" id="logo" />
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <div v-if="loggedIn">
        <Login />
      </div>
      <div v-else>
        <Settings />
      </div>
      <EssentialLink
        v-for="link in essentialLinks"
        :key="link.title"
        v-bind="link"
      />
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import EssentialLink from 'components/EssentialLink.vue';
import Login from 'components/Login.vue';
import Settings from 'components/Settings.vue';

const linksList = [
  {
    title: 'Contact Us',
    caption: 'kebunkitani.site/contact-us',
    icon: 'chat',
    link: 'https://kebunkitani.site/contact-us',
  },
  {
    title: 'Kebun Kitani Website',
    caption: 'kebunkitani.site',
    icon: 'home',
    link: 'https://kebunkitani.site',
  },
  {
    title: 'Privacy Policy',
    caption: 'kebunkitani.site/privacy-%26-policy',
    icon: 'mdi-shield-account',
    link: 'https://kebunkitani.site/privacy-%26-policy',
  },
  {
    title: 'Our Code is Open Sourced',
    caption: 'github.com/Qoyyuum/KebunKitani',
    icon: 'code',
    link: 'https://github.com/Qoyyuum/KebunKitani',
  },
];

import { defineComponent, ref } from 'vue';
import { useQuasar } from 'quasar';

export default defineComponent({
  name: 'MainLayout',

  components: {
    EssentialLink,
    Login,
    Settings,
  },

  setup() {
    const $q = useQuasar();
    const leftDrawerOpen = ref(true);
    let loggedIn = ref($q.localStorage.getItem('token'));

    return {
      essentialLinks: linksList,
      leftDrawerOpen,
      loggedIn,
      toggleLeftDrawer() {
        leftDrawerOpen.value = !leftDrawerOpen.value;
      },
    };
  },
});
</script>

<style lang="sass">
#logo
  height: 50px
</style>
