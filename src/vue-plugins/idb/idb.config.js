export default {
  version: 1,
  name: 'farmos',
  stores: [
    {
      name: 'logs',
      keyPath: 'local_id',
      autoIncrement: true,
    },
    {
      name: 'assets',
      keyPath: 'id',
      autoIncrement: false,
    },
    {
      name: 'areas',
      keyPath: 'tid',
      autoIncrement: false,
    },
    {
      name: 'categories',
      keyPath: 'id',
      autoIncrement: false,
    },
    {
      name: 'equipment',
      keyPath: 'id',
      autoIncrement: false,
    },
  ],
};
