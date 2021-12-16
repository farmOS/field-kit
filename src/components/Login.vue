<template>
  <q-page>
    <q-avatar color="primary" text-color="white">J</q-avatar>
    <q-input
      standout="bg-teal text-white"
      v-model="farmosUrl"
      label="Nama Ladang"
      v-on:input="checkValues"
    />
    <q-input
      standout="bg-teal text-white"
      v-model="username"
      label="Nama Pengguna"
      v-on:input="checkValues"
    />
    <q-input
      standout="bg-teal text-white"
      v-model="password"
      label="Kata Laluan"
      type="password"
      v-on:input="checkValues"
    />
    <q-spinner v-if="authPending" color="primary" size="3em" />
    <q-btn
      v-else
      color="primary"
      label="Log Masuk"
      @click="submitCredentials"
    />
  </q-page>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { useStore } from 'src/store';

export default defineComponent({
  name: 'Login',
  created() {
    this.farmosUrl =
      localStorage.getItem('host')?.replace(/(^\w+:|^)\/\//, '') || '';
  },
  setup() {
    let valuesEntered = ref(false);
    let authPending = ref(false);
    let username = ref('');
    let password = ref('');
    let farmosUrl = ref('');

    const store = useStore();

    const checkValues = () => {
      const urlIsValid =
        process.env.NODE_ENV === 'development' || username.value !== '';
      const usernameIsValid = username.value !== '';
      const passwordIsValid = password.value !== '';
      if (urlIsValid && usernameIsValid && passwordIsValid) {
        valuesEntered.value = true;
      }
    };

    const submitCredentials = () => {
      console.log('Logging in...');
      const payload = {
        farmosUrl: farmosUrl.value,
        username: username.value,
        password: password.value,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        // router: store.$router,
      };

      authPending.value = true;

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      store
        .dispatch('authModule/authorize', payload)
        .then(() => {
          authPending.value = false;
          console.log('Set Login Status');
          store.commit('authModule/setLoginStatus', true);
          console.log('Login Status is set. Updating Field Modules');
          // return $store.dispatch('updateFieldModules', this.$router);
        })
        .then((res) => store.dispatch('authModule/updateUserAndSiteInfo', res));
      // .then(res => $store.dispatch('updateFarmResources', res)); // TODO: Add to Store
    };

    return {
      valuesEntered,
      authPending,
      username,
      password,
      farmosUrl,
      store,
      checkValues,
      submitCredentials,
    };
  },
});
</script>
