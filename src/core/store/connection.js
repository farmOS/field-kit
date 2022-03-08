import { ref, readonly } from 'vue';

// All previous requests completed w/o connection errors, and no requests are
// in progress or waiting to be retried.
export const STATUS_GOOD_CONNECTION = Symbol('STAUS_GOOD_CONNECTION');
// Some previous requests completed while others did not are wating to be retried.
export const STATUS_POOR_CONNECTION = Symbol('STAUS_POOR_CONNECTION');
// All previous requests failed to connect and are waiting to be retried, or
// navigator.onLine is false.
export const STATUS_NO_CONNECTION = Symbol('STATUS_NO_CONNECTION');
// A request is in progress.
export const STATUS_IN_PROGRESS = Symbol('STATUS_IN_PROGRESS');

const state = ref(STATUS_GOOD_CONNECTION);
const reference = readonly(state);

export { reference as default };

const isValidStatus = value => [
  STATUS_GOOD_CONNECTION, STATUS_POOR_CONNECTION, STATUS_NO_CONNECTION, STATUS_IN_PROGRESS,
].includes(value);

export function updateStatus(change) {
  let status;
  if (typeof change === 'number') {
    if (change === 0) status = STATUS_NO_CONNECTION;
    if (change === 1) status = STATUS_GOOD_CONNECTION;
    if (change < 1 && change > 0) status = STATUS_POOR_CONNECTION;
  }
  if (isValidStatus(change)) {
    status = change;
  }
  if (navigator && navigator.onLine === false) {
    status = STATUS_NO_CONNECTION;
  }
  if (isValidStatus(status)) {
    state.value = status;
  }
}
