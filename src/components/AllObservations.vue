<template lang="html">
  <div>
    <h1>All Observations</h1>
    <button
      @click="$emit('create-observation')"
      type="button"
      class="btn btn-success btn-navbar">
      Create observation
    </button>
    <button
      @click="syncAll"
      type="button"
      class="btn btn-info btn-navbar navbar-right">
      Sync all to farmOS
    </button>
    <table class="table table-bordered">
      <thead>
        <tr>
          <th>Date</th>
          <th>Log name</th>
          <th>Sync status</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="log in logs" :key='logs.indexOf(log)'>
          <td>{{showDate(log.timestamp)}}</td>
          <td>{{log.name}}</td>
          <td v-if="log.wasPushedToServer">
            <a :href="log.remoteUri">synced</a> ({{syncTime(log.timestamp)}})
          </td>
          <td v-else-if="log.isReadyToSync">
            <!-- TODO: add proper spinner once glyphicon font is working -->
            <div class="glyphicon glyphicon-refresh spin" aria-hidden="true" />
          </td>
          <td v-else>unsynced</td>
          <td>
            <button
              type="button"
              :name='`delete-${logs.indexOf(log)}`'
              @click='openDeleteDialog(logs.indexOf(log))'>
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>
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
            <h5 class="modal-title" id="exampleModalLabel">Modal title</h5>
            <button
              type="button"
              class="close"
              @click='cancelDelete'
              aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
            ...
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
            class="btn btn-primary"
            @click='confirmDelete()'>
            Delete
          </button>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<script>
import moment from 'moment';

export default {
  props: ['logs'],
  data() {
    return {
      showDeleteDialog: false,
      logIndexToDelete: null,
    }
  },
  methods: {
    syncTime(unixTimestamp) {
      return moment.unix(unixTimestamp).format('YYYY-MM-DD');
    },
    showDate(unixTimestamp) {
      return moment.unix(unixTimestamp).format('MMM DD YYYY');
    },
    openDeleteDialog(index) {
      this.showDeleteDialog = true;
      this.logIndexToDelete = index;
    },
    cancelDelete() {
      this.showDeleteDialog = false;
    },
    confirmDelete() {
      const index = this.logIndexToDelete;
      this.showDeleteDialog = false;
      // this.$store.commit('deleteLog', index)
      console.log(`Deleting log "${this.logs[index].name}"`)
    },
    syncAll() {
      function logSyncer(log) {
        return {
          ...log,
          isReadyToSync: true,
        };
      }
      this.$store.commit('updateAllLogs', logSyncer);

      // FIXME: Why is this being called here? Why not in getPhoto or getPhotoLoc?
      // this.updateCurrentLog('photo_loc', this.photoLoc);
    },
  },
};
</script>

<style>
  .spin {
      -webkit-animation-name: spin;
      -webkit-animation-duration: 4000ms;
      -webkit-animation-iteration-count: infinite;
      -webkit-animation-timing-function: linear;
      -moz-animation-name: spin;
      -moz-animation-duration: 4000ms;
      -moz-animation-iteration-count: infinite;
      -moz-animation-timing-function: linear;
      -ms-animation-name: spin;
      -ms-animation-duration: 4000ms;
      -ms-animation-iteration-count: infinite;
      -ms-animation-timing-function: linear;

      animation-name: spin;
      animation-duration: 4000ms;
      animation-iteration-count: infinite;
      animation-timing-function: linear;

      /* These styles are just filler (literally) */
      /* until the glyphicon font set is available */
      width: 15px;
      height: 15px;
      transform: translateY(-%50);
      overflow: visible;
      background-color: tomato;
  }
  @-ms-keyframes spin {
      from { -ms-transform: rotate(0deg); }
      to { -ms-transform: rotate(360deg); }
  }
  @-moz-keyframes spin {
      from { -moz-transform: rotate(0deg); }
      to { -moz-transform: rotate(360deg); }
  }
  @-webkit-keyframes spin {
      from { -webkit-transform: rotate(0deg); }
      to { -webkit-transform: rotate(360deg); }
  }
  @keyframes spin {
      from {
          transform: rotate(0deg);
      }
      to {
          transform: rotate(360deg);
      }
  }

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
