<template lang="html">
  <div>
    <router-view
      name="menubar"
      @toggleDrawer="$emit('toggleDrawer')"
      @deleteCurrentLog="openDeleteDialog(currentLogIndex)"
      @syncAll="syncAll"
      :logs='logs'
      :currentLogIndex='currentLogIndex'
    />
    <router-view
      @deleteLog="openDeleteDialog($event)"
      :logs='logs'
      :areas='areas'
      :assets='assets'
      :currentLogIndex='currentLogIndex'
      :photoLoc='photoLoc'
      :geolocation='geolocation'
      :localArea='localArea'
      :useGeolocation='useGeolocation'
      :units='units'
      :categories='categories'
      :userId='userId'
      :logDisplayFilters='logDisplayFilters'
    />

    <div
      v-if="showDeleteDialog"
      class="modal"
      id="delete-dialog"
      tabindex="-1"
      role="dialog">
      <div class="modal-filter"></div>
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLabel">Confirm Deletion</h5>
            <button
              type="button"
              class="close"
              @click='cancelDelete'
              aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            Are sure you'd like to delete the log "{{logs[logIndexToDelete].name.data}}"?&nbsp;
            <span
              v-if='logs[logIndexToDelete].wasPushedToServer'>
              Deleting it on this device will not remove the log from the server.
            </span>
            <span v-else>
              It has not yet been synced to the server and cannot be recovered after it's deleted.
            </span>
          </div>
          <div class="modal-footer">
            <button
            type="button"
            class="btn btn-secondary"
            @click='cancelDelete'>
            Cancel
          </button>
          <button
            type="button"
            class="btn btn-danger"
            @click='confirmDelete()'>
            Delete
          </button>
          </div>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'Logs',
  data() {
    return {
      showDeleteDialog: false,
      logIndexToDelete: null,
    };
  },
  props: ['useGeolocation'],
  computed: mapState({
    logs: state => state.farm.logs,
    areas: state => state.farm.areas,
    assets: state => state.farm.assets,
    currentLogIndex: state => state.farm.currentLogIndex,
    statusText: state => state.farm.statusText,
    photoLoc: state => state.farm.photoLoc,
    geolocation: state => state.farm.geolocation,
    localArea: state => state.farm.localArea,
    units: state => state.farm.units,
    userId: state => state.shell.user.uid,
    categories: state => state.farm.categories,
    logDisplayFilters: state => state.shell.settings.logDisplayFilters,
  }),
  created() {
    this.$store.dispatch('onLogsComponentCreated');
  },
  beforeDestroy() {
    this.$store.commit('clearLogs');
  },
  methods: {
    openDeleteDialog(index) {
      this.showDeleteDialog = true;
      this.logIndexToDelete = index;
    },
    cancelDelete() {
      this.showDeleteDialog = false;
    },
    confirmDelete() {
      const log = this.logs[this.logIndexToDelete];
      const payload = {
        index: this.logIndexToDelete,
        local_id: log.local_id,
        id: log.id,
        remoteUri: log.remoteUri,
        name: log.name.data,
        type: log.type.data,
      };
      this.$store.commit('deleteLog', payload);
      this.showDeleteDialog = false;
      if (this.$route.name === 'edit-log') {
        this.$router.push({ path: '/logs' });
      }
    },
    syncAll() {
      // Calling getLogs first.  On return, it will call a check action in httpModule.
      this.$store.dispatch('getLogs');
    },
  }
};
</script>

<style lang="css" scoped>
  .modal {
    display: block;
    padding-right: 15px;
    overflow-x: hidden;
    overflow-y: auto;
    opacity: 1;
  }
  .modal-filter {
    position: absolute;
    height: 100%;
    width: 100%;
    background-color: #ccc;
    opacity: .5;
  }
  .modal-dialog {
    transform: translate(0,0);
    width: auto;
    margin: 3rem;
    pointer-events: none;
  }
  @media (min-width: 576px) {
    .modal-dialog {
      max-width: 500px;
      margin: 1.75rem auto;
    }
  }
</style>
