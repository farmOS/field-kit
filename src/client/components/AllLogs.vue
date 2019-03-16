<template lang="html">
  <div>
    <h1>My Logs</h1>
    <div class="btn-wrapper">
        <!-- Initialize the new log as an observation -->
        <router-link :to="{ name: 'edit-log', params: { type: 'farm_observation' } }">
        <button
          type="button"
          class="btn btn-success btn-navbar">
          Create log
        </button>
      </router-link>
      <button
        @click="syncAll"
        type="button"
        class="btn btn-info btn-navbar navbar-right">
        Sync all to farmOS
      </button>
    </div>
    <div class="card-deck">
      <div
        class="card"
        v-if="logs.length < 1">
        <!-- <div class="card-header">Logs will go here</div> -->
        <div class="card-body">
          <h4 class="card-title">Let's Get Started!</h4>
          <p class="card-text">
            You don't have any logs to display yet. Logs are records of events
            in farmOS. You can add some by clicking "Create Log" above.
          </p>
        </div>
      </div>
      <div
        class="card"
        v-if="logs.length > 0"
        v-for="(log, i) in logs"
        :key="`card-${logs.indexOf(log)}`"
      >
        <div class="card-body">
          <p>
            <icon-assignment-done v-if="log.done.data"/>
            <icon-assignment
              v-if="!log.done.data && (log.timestamp.data * 1000 > new Date().valueOf())"/>
            <icon-assignment-late
              v-if="!log.done.data && (log.timestamp.data * 1000 < new Date().valueOf())"/>
            {{showDate(log.timestamp.data)}}
            <span
              v-if="log.wasPushedToServer"
              class="sync-status"
            >
              <a :href="log.remoteUri">synced</a>
              ({{syncTime(log.timestamp.data)}})
            </span>
            <span
              v-else-if="log.isReadyToSync"
              class="sync-status"
            >
              <div
                class="spin"
                aria-hidden="true"
              >
                <icon-sync/>
              </div>
            </span>
            <span v-else class="sync-status">
              unsynced
            </span>
          </p>
          <h5>{{log.name.data}}</h5>
          <router-link
            :to="{ name: 'edit-log', params: { index: i, type: log.type.data } }"
            class="edit-btn">
            <icon-edit />
          </router-link>
          <div class="del-btn" @click="openDeleteDialog(i)">
            <icon-delete/>
          </div>
        </div>
      </div>
    </div>
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

</template>

<script>
import moment from 'moment';
import IconAssignment from '../../icons/icon-assignment.vue'; // eslint-disable-line import/extensions
import IconAssignmentDone from '../../icons/icon-assignment-done.vue'; // eslint-disable-line import/extensions
import IconAssignmentLate from '../../icons/icon-assignment-late.vue'; // eslint-disable-line import/extensions
import IconDelete from '../../icons/icon-delete.vue'; // eslint-disable-line import/extensions
import IconEdit from '../../icons/icon-edit.vue'; // eslint-disable-line import/extensions
import IconSync from '../../icons/icon-sync.vue'; // eslint-disable-line import/extensions

export default {
  props: [
    'logs',
    'userId',
    ],
  components: {
    IconAssignment,
    IconAssignmentDone,
    IconAssignmentLate,
    IconDelete,
    IconEdit,
    IconSync,
  },
  data() {
    return {
      showDeleteDialog: false,
      logIndexToDelete: null,
    };
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
      const log = this.logs[this.logIndexToDelete];
      console.log('Log to be deleted: ', log);
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
      console.log(`Deleting log "${payload.name.data}"...`);
    },
    syncAll() {
      // Calling getLogs first.  On return, it will call a check action in httpModule.
      this.$store.dispatch('getLogs');
    },
  },
};

</script>

<style scoped>
  .btn-wrapper {
    margin: 1rem 0;
  }

  .btn-wrapper > button {
    margin-right: 1rem;
  }

  .sync-status {
    position: absolute;
    right: 1.25rem;
  }

  .edit-btn, .del-btn {
    display: inline-block;
    fill: var(--gray-dark)
  }

  .del-btn {
    float: right;
  }

  @media (min-width: 576px) {
    .card-deck .card {
      flex: 0 0 576px;
      margin-bottom: 15px;
    }
  }

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
  }
  @-ms-keyframes spin {
      from { -ms-transform: rotate(0deg); }
      to { -ms-transform: rotate(-360deg); }
  }
  @-moz-keyframes spin {
      from { -moz-transform: rotate(0deg); }
      to { -moz-transform: rotate(-360deg); }
  }
  @-webkit-keyframes spin {
      from { -webkit-transform: rotate(0deg); }
      to { -webkit-transform: rotate(-360deg); }
  }
  @keyframes spin {
      from {
          transform: rotate(0deg);
      }
      to {
          transform: rotate(-360deg);
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
