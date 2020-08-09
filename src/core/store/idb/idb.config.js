import logUpgrades from './upgrades/logs';
import assetUpgrades from './upgrades/assets';
import areaUpgrades from './upgrades/areas';
import unitUpgrades from './upgrades/units';
import categoryUpgrades from './upgrades/categories';
import resourceUpgrades from './upgrades/resources';

export default {
  version: 5,
  name: 'farmos',
  stores: [
    {
      name: 'logs',
      keyPath: 'localID',
      autoIncrement: false,
      upgrades: logUpgrades,
    },
    {
      name: 'assets',
      keyPath: 'id',
      autoIncrement: false,
      upgrades: assetUpgrades,
    },
    {
      name: 'areas',
      keyPath: 'tid',
      autoIncrement: false,
      upgrades: areaUpgrades,
    },
    {
      name: 'units',
      keyPath: 'tid',
      autoIncrement: false,
      upgrades: unitUpgrades,
    },
    {
      name: 'categories',
      keyPath: 'tid',
      autoIncrement: false,
      upgrades: categoryUpgrades,
    },
    {
      // Resources have no keypath, so the keys will be "out-of-line".
      // This means a key must be provided on each transaction.
      // We'll be breaking down the resources object that comes from
      // /farm.json according to its object keys, and using those as
      // the store keys.
      name: 'resources',
      autoIncrement: false,
      upgrades: resourceUpgrades,
    },
  ],
};
