import logUpgrades from './upgrades/logs';
import assetUpgrades from './upgrades/assets';
import areaUpgrades from './upgrades/areas';
import unitUpgrades from './upgrades/units';
import categoryUpgrades from './upgrades/categories';
import equipmentUpgrades from './upgrades/equipment';

export default {
  version: 3,
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
      name: 'equipment',
      keyPath: 'id',
      autoIncrement: false,
      upgrades: equipmentUpgrades,
    },
  ],
};
