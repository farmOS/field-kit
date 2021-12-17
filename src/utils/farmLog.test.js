/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable no-undef */
import fromEntries from 'object.fromentries';
import {
  getLogTypes,
  setLogTypes,
  createLog,
  formatLogForServer,
  mergeLogFromServer,
  serializeLog,
  deserializeLog,
  getLastChange,
  getLastSync,
  getConflicts,
  resolveConflict,
} from './farmLog';
import defaultResources from '../core/store/defaultResources';

// Shim fromEntries for testing b/c it's not supported in Node.
if (!Object.fromEntries) {
  fromEntries.shim();
}

describe('farmLog', () => {
  describe('createLog, serializeLog & deserializeLog', () => {
    it('creates new log w/o initial props', () => {
      const log = createLog({ localID: 1 });
      const serializedLog = {
        name: { data: '', changed: expect.any(Number), conflicts: [] },
        timestamp: { data: expect.any(Number), changed: expect.any(Number), conflicts: [] },
        done: { data: false, changed: expect.any(Number), conflicts: [] },
        type: 'farm_activity',
        area: { data: [], changed: expect.any(Number), conflicts: [] },
        asset: { data: [], changed: expect.any(Number), conflicts: [] },
        files: { data: [], changed: expect.any(Number), conflicts: [] },
        geofield: { data: [], changed: expect.any(Number), conflicts: [] },
        images: { data: [], changed: expect.any(Number), conflicts: [] },
        notes: {
          data: { value: '', format: 'farm_format' },
          changed: expect.any(Number),
          conflicts: [],
        },
        movement: {
          data: { area: [], geometry: '' },
          changed: expect.any(Number),
          conflicts: [],
        },
        log_category: { data: [], changed: expect.any(Number), conflicts: [] },
        log_owner: { data: [], changed: expect.any(Number), conflicts: [] },
        inventory: { data: [], changed: expect.any(Number), conflicts: [] },
        membership: { data: { group: [] }, changed: expect.any(Number), conflicts: [] },
        quantity: { data: [], changed: expect.any(Number), conflicts: [] },
        flags: { data: [], changed: expect.any(Number), conflicts: [] },
        data: { data: '', changed: expect.any(Number), conflicts: [] },
        equipment: { data: [], changed: expect.any(Number), conflicts: [] },
        localID: 1,
        id: undefined,
        url: undefined,
        lastSync: 0,
      };
      expect(serializeLog(log)).toMatchObject(serializedLog);
    });
    it('creates a log, serializes and deserializes it, and is the same as the original', () => {
      const log = createLog({ localID: 1, name: 'I\'m a log!' });
      expect(deserializeLog(serializeLog(log))).toMatchObject(log);
    });
  });

  describe('log getters, setters and getLastChange', () => {
    const log = createLog({ localID: 1, changed: Date.now() - 3000 });
    it('sets and gets the name property, updates changed metadata and reads it', () => {
      log.name = 'This is a log!';
      expect(log.name).toBe('This is a log!');
      expect(getLastChange(log, 'name'))
        .toBeGreaterThan(getLastChange(log, 'done'));
    });
  });

  const formattedLog = {
    name: 'This is a log!',
    timestamp: expect.any(Number),
    done: false,
    type: 'farm_activity',
    area: [],
    asset: [],
    files: [],
    geofield: [],
    images: [],
    notes: { value: '', format: 'farm_format' },
    movement: { area: [], geometry: '' },
    log_category: [],
    log_owner: [],
    inventory: [],
    membership: { group: [] },
    quantity: [],
    flags: [],
    data: '',
    equipment: [],
  };
  describe('formatLogForServer', () => {
    const lastSync = Date.now() + 1;
    const log = createLog({ localID: 1, name: 'This is a log!' }, lastSync);
    it('formats a log for the server', () => {
      expect(formatLogForServer(log)).toMatchObject(formattedLog);
    });
  });
  describe('getLastSync', () => {
    const lastSync = Date.now() + 1;
    const log = createLog({ localID: 1, name: 'This is a log!' }, lastSync);
    it('gets timestamp of last syncing event', () => {
      expect(getLastSync(log)).toBe(lastSync);
    });
  });

  describe('mergeLogFromServer', () => {
    const lastSync = Date.now() + 1;
    const log = createLog({ localID: 1, name: 'This is a log!' }, lastSync);
    it('merges a log with no conflicts', () => {
      const serverLog = {
        ...formattedLog,
        changed: lastSync + 5,
        name: 'This is a server log!',
      };
      mergeLogFromServer(log, serverLog);
      expect(log.name).toBe('This is a server log!');
    });
  });

  describe('getConflicts & resolveConflict', () => {
    const now = Date.now();
    const props = { localID: 1, name: 'This is a log!', changed: now - 3000 };
    const log = createLog(props, now);
    it('create a merge conflict, gets conflicts, resolve conflict, get no conflicts', () => {
      const serverChanged = now + 3000;
      const serverLog = {
        ...formattedLog,
        changed: serverChanged,
        name: 'This is a server log!',
      };
      const conflicts = {
        name: [{
          changed: serverChanged,
          data: 'This is a server log!',
        }],
      };
      log.name = 'This is a server log';
      mergeLogFromServer(log, serverLog);
      expect(getConflicts(log)).toMatchObject(conflicts);
      resolveConflict(log, 'name', 'This log is resolved!');
      expect(getConflicts(log)).toMatchObject({});
      expect(log.name).toBe('This log is resolved!');
    });
  });

  describe('getLogTypes & setLogTypes', () => {
    it('gets and sets log types', () => {
      const newLogTypes = {
        ...defaultResources.log,
        farm_seeding: {
          label: 'Seeding',
          label_plural: 'Seedings',
          fields: {
            area: {
              label: 'Areas',
              type: 'taxonomy_term_reference',
              required: 0,
              data_schema: [{ id: null }],
            },
            asset: {
              label: 'Assets',
              type: 'entityreference',
              required: 0,
              data_schema: [{ id: null }],
            },
          },
        },
      };
      expect(getLogTypes()).toMatchObject(defaultResources.log);
      setLogTypes(newLogTypes);
      expect(getLogTypes()).toMatchObject(newLogTypes);
    });
  });
});
