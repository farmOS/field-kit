<template>
  <q-page padding>
  <q-btn :ripple="{ center: true }" color="secondary" label="Balik" no-caps :to="{ path: 'dashboard' }" /> 
 <div class="q-pa-md" style="max-width: 350px">
    <q-list bordered padding>
      <q-item-label header>User Controls</q-item-label>

      <q-item clickable v-ripple>
        <q-item-section>
          <q-item-label>Account Management</q-item-label>
          <q-item-label caption>
            Set the content filtering level to restrict
            apps that can be downloaded
          </q-item-label>
        </q-item-section>
      </q-item>

      <q-item clickable v-ripple>
        <q-item-section>
          <q-item-label>Change Password</q-item-label>
          <q-item-label caption>
            Require password for purchase or use
            password to restrict purchase
          </q-item-label>
        </q-item-section>
      </q-item>

      <q-separator spaced />
      <q-item-label header>General</q-item-label>

      <q-item tag="label" v-ripple>
        <q-item-section side top>
          <q-checkbox v-model="check1" />
        </q-item-section>

        <q-item-section>
          <q-item-label>Notifications</q-item-label>
          <q-item-label caption>
            Notify me about updates to apps or games that I downloaded
          </q-item-label>
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple>
        <q-item-section side top>
          <q-checkbox v-model="check2" />
        </q-item-section>

        <q-item-section>
          <q-item-label>Sound</q-item-label>
          <q-item-label caption>
            Auto-update apps at anytime. Data charges may apply
          </q-item-label>
        </q-item-section>
      </q-item>

      <q-separator spaced />
      <q-item-label header>Advanced Settings</q-item-label>

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>Dark Mode</q-item-label>
          <q-item-label caption>Enable or Disable Dark Mode</q-item-label>
        </q-item-section>
        <q-item-section side >
          <q-toggle color="blue" v-model="notif1" val="battery" />
        </q-item-section>
      </q-item>

      <q-item tag="label" v-ripple>
        <q-item-section>
          <q-item-label>Picture uploaded</q-item-label>
          <q-item-label caption>Allow notification when uploading images</q-item-label>
        </q-item-section>
        <q-item-section side top>
          <q-toggle color="red" v-model="notif3" val="picture" />
        </q-item-section>
      </q-item>

      <q-separator spaced />
      Log Keluar
       <q-btn round color="secondary" icon="mdi-logout" :to="{ path: '/' }" />
      

    </q-list>
  </div>

  
  </q-page>
</template>

<script>
export default {
  // name: 'PageName',
}
</script>
