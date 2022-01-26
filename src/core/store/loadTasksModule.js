const loadTasksModule = () => import('../../field-modules/tasks/module')
  .then(({ default: tasks }) => {
    window.farmOS.mountFieldModule(tasks);
  })
  .catch((e) => {
    const msg = 'Error loading Tasks Module.\n';
    // eslint-disable-next-line no-console
    if (process.env.NODE_ENV === 'development') console.error(msg, e);
    throw e;
  });

export default loadTasksModule;
