import { mapMutations, mapActions } from 'vuex';

export default {
  methods: {
    ...mapMutations([
      'updateLog',
      'deleteLog',
    ]),
    ...mapActions([
      'initializeLog',
      'loadLogs',
      'getLogs',
      'syncLogs',
    ]),
  },
};
