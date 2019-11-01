export default {
  name: 'my-logs',
  filters: {
    log: {
      log_owner: 'SELF',
      type: ['farm_activity', 'farm_observation', 'farm_harvest', 'farm_input', 'farm_seeding'],
      done: false,
    },
  },
};
