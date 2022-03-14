<template>
<!--
  This is just a fast & cheap way of temporarily stashing the delete dialog,
  previously embedded in the Tasks container component, here in AppModal, which
  itself is no longer needed since the drawer has its own implementation, as of
  the previous commit. Eventually, this should become a special component, akin
  to AppBar or AppDrawer, whose state is managed by AppShell, which itself can
  provide a method to all field modules for triggering a modal dialog. One
  instance of this will be the delete dialog, which AppShell can trigger auto-
  matically whenever a deletion is performed. See issues #411 & #459 for details.
-->
<div
  v-if="showDeleteDialog"
  class="modal"
  id="delete-dialog"
  role="dialog">
  <div class="modal-filter"></div>
  <div class="modal-dialog" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="exampleModalLabel">{{ $t('Confirm Deletion')}}</h5>
        <button
          type="button"
          class="close"
          @click="cancelDelete"
          aria-label="Close">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="modal-body">
        {{ $t('Are sure you\'d like to delete the log')}} "{{logToDelete.name}}"?&nbsp;
        <span
          v-if="isUnsynced(logToDelete)">
          <!-- eslint-disable-next-line max-len -->
          {{ $t('It has not yet been synced to the server and cannot be recovered after it\'s deleted.')}}
        </span>
        <span v-else>
          {{ $t('Deleting it on this device will not remove the log from the server.') }}
        </span>
      </div>
      <div class="modal-footer">
        <button
        type="button"
        class="btn btn-secondary"
        @click="cancelDelete">
        Cancel
      </button>
      <button
        type="button"
        class="btn btn-danger"
        @click="confirmDelete">
        Delete
      </button>
      </div>
    </div>
  </div>
</div>
</template>

<script>
export default {
  name: 'AppModal',
  data() {
    return {
      showDeleteDialog: false,
      logIDToDelete: null,
    };
  },
  computed: {
    logToDelete() {
      return this.logs.find(log => log.id === this.logIDToDelete);
    },
  },
  methods: {
    openDeleteDialog(id) {
      this.showDeleteDialog = true;
      this.logIDToDelete = id;
    },
    cancelDelete() {
      this.showDeleteDialog = false;
    },
    confirmDelete() {
      this.deleteLog(this.logIDToDelete);
      this.showDeleteDialog = false;
      if (this.$route.name === 'tasks-edit') {
        this.$router.push({ path: '/tasks' });
      }
    },
  },
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
    position: fixed;
    top: 0;
    height: 100%;
    width: 100%;
    background-color: var(--dark-transparent);
    z-index: 1500;
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
