<template lang="html">
  <div>
    <div class="card-group">
      <div
        class="card"
        v-if="logs.length < 1">
        <!-- <div class="card-header">Logs will go here</div> -->
        <div class="card-body">
          <h4 class="card-title">Let's Get Started!</h4>
          <p class="card-text">
            You don't have any logs to display yet. Logs are records of events
            in farmOS. You can add some by clicking the <IconAddCircle class="inline-svg"/>
            icon below, or you can get uncompleted tasks from the server by
            clicking the <IconCloudUpload class="inline-svg"/> icon above.
          </p>
        </div>
      </div>
      <div
        class="card"
        v-if="logs.length > 0"
        v-for="(log, i) in logs"
        :key="`card-${logs.indexOf(log)}`"
      >
        <router-link :to="{ name: 'edit-log', params: { index: i, type: log.type.data } }">
          <div class="card-body">
            <icon-assignment-done
              class="assignment"
              v-if="log.done.data"/>
            <icon-assignment
              class="assignment"
              v-if="!log.done.data && (log.timestamp.data * 1000 > new Date().valueOf())"/>
            <icon-assignment-late
              class="assignment"
              v-if="!log.done.data && (log.timestamp.data * 1000 < new Date().valueOf())"/>
            <h5>{{log.name.data}}</h5>
            <icon-cloud-done v-if="log.wasPushedToServer" class="sync-status"/>
            <div
              class="spin sync-status"
              v-else-if="log.isReadyToSync"
              aria-hidden="true">
              <icon-sync/>
            </div>
            <icon-cloud-upload v-else class="sync-status"/>
            <p>{{log.notes.data}}</p>
            {{showDate(log.timestamp.data)}}
          </div>
        </router-link>
      </div>
    </div>

    <!-- Initialize the new log as an observation -->
    <router-link :to="{ name: 'edit-log', params: { type: 'farm_observation' } }">
      <div class="add-circle" @click="">
        <div class="background-circle">
        </div>
        <icon-add-circle/>
      </div>
    </router-link>

  </div>

</template>

<script>
import moment from 'moment';
import IconAddCircle from '../../icons/icon-add-circle.vue'; // eslint-disable-line import/extensions
import IconAssignment from '../../icons/icon-assignment.vue'; // eslint-disable-line import/extensions
import IconAssignmentDone from '../../icons/icon-assignment-done.vue'; // eslint-disable-line import/extensions
import IconAssignmentLate from '../../icons/icon-assignment-late.vue'; // eslint-disable-line import/extensions
import IconCloudDone from '../../icons/icon-cloud-done.vue'; // eslint-disable-line import/extensions
import IconCloudUpload from '../../icons/icon-cloud-upload.vue'; // eslint-disable-line import/extensions
import IconDelete from '../../icons/icon-delete.vue'; // eslint-disable-line import/extensions
import IconEdit from '../../icons/icon-edit.vue'; // eslint-disable-line import/extensions
import IconSync from '../../icons/icon-sync.vue'; // eslint-disable-line import/extensions

export default {
  props: [
    'logs',
    'userId',
    ],
  components: {
    IconAddCircle,
    IconAssignment,
    IconAssignmentDone,
    IconAssignmentLate,
    IconCloudDone,
    IconCloudUpload,
    IconDelete,
    IconEdit,
    IconSync,
  },
  methods: {
    showDate(unixTimestamp) {
      return moment.unix(unixTimestamp).format('MMM DD YYYY');
    },
  },
};

</script>

<style scoped>
  .assignment {
    position: absolute;
  }

  .card-body h5 {
    margin-left: 2rem;
  }

  .card-body p {
    margin-bottom: 0.5rem;
  }

  .inline-svg {
    height: 1rem;
  }

  .card-group > .card {
    margin-bottom: 0;
  }

  .card-body {
    color: var(--gray-dark);
  }

  .sync-status {
    position: absolute;
    top: 1.25rem;
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
    .card-group .card {
      flex: 0 0 576px;
      /* margin-bottom: 15px; */
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

  .add-circle {
    position: fixed;
    bottom: 1.5rem;
    right: 1.5rem;
    fill: var(--farmos-green-light);
  }

  .add-circle svg {
    height: 4.5rem;
    width: 4.5rem;
  }

  .background-circle {
    height: 3.75rem;
    width: 3.75rem;
    border-radius: 2rem;
    background-color: var(--farmos-green-dark);
    box-shadow: -1px 2px 5px rgba(0, 0, 0, .25);
    position: absolute;
    top: .375rem;
    left: .375rem;
    z-index: -10;
  }

</style>
