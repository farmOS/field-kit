const loadTasksModule = () =>
  import('../../../packages/field-module-tasks/dist/farm_fieldkit_tasks/js/tasks.1-0-0')
    .catch((e) => {
      if (process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line no-console
        console.log('Tasks module failed to load. Error: ', e);
      }
      return Promise.resolve();
    });

export default loadTasksModule;
