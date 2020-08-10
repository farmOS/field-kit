/* eslint-disable no-undef */
import fromEntries from 'object.fromentries';
import farmLog from './farmLog';
import defaultResources from '../core/store/defaultResources';

// Shim fromEntries for testing b/c it's not supported in Node.
if (!Object.fromEntries) {
  fromEntries.shim();
}

// const syncDate = 1580565564;
const syncDate = 1580000000;
const {
  createLog,
  updateLog,
  formatLogForServer,
  mergeLogFromServer,
} = farmLog(defaultResources.log, syncDate);

describe('createLog', () => {
  it('creates a new log w/o initial props', () => {
    expect(createLog())
      .toMatchObject({
        area: {
          changed: expect.any(Number),
          data: [],
          conflicts: [],
        },
        asset: {
          changed: expect.any(Number),
          data: [],
          conflicts: [],
        },
        files: {
          changed: expect.any(Number),
          data: [],
          conflicts: [],
        },
        geofield: {
          changed: expect.any(Number),
          data: null,
          conflicts: [],
        },
        images: {
          changed: expect.any(Number),
          data: [],
          conflicts: [],
        },
        notes: {
          changed: expect.any(Number),
          data: null,
          conflicts: [],
        },
        movement: {
          changed: expect.any(Number),
          data: null,
          conflicts: [],
        },
        log_category: {
          changed: expect.any(Number),
          data: null,
          conflicts: [],
        },
        log_owner: {
          changed: expect.any(Number),
          data: null,
          conflicts: [],
        },
        inventory: {
          changed: expect.any(Number),
          data: null,
          conflicts: [],
        },
        membership: {
          changed: expect.any(Number),
          data: null,
          conflicts: [],
        },
        quantity: {
          changed: expect.any(Number),
          data: null,
          conflicts: [],
        },
        flags: {
          changed: expect.any(Number),
          data: null,
          conflicts: [],
        },
        data: {
          changed: expect.any(Number),
          data: null,
          conflicts: [],
        },
        equipment: {
          changed: expect.any(Number),
          data: null,
          conflicts: [],
        },
        name: {
          changed: expect.any(Number),
          data: '',
          conflicts: [],
        },
        type: {
          changed: expect.any(Number),
          data: 'farm_activity',
          conflicts: [],
        },
        timestamp: {
          changed: expect.any(Number),
          data: expect.any(Number),
          conflicts: [],
        },
        done: {
          changed: expect.any(Number),
          data: false,
          conflicts: [],
        },
        isCachedLocally: false,
        wasPushedToServer: false,
        isReadyToSync: false,
        modules: [],
      });
  });

  it('creates a new log w initial props', () => {
    expect(createLog({ name: 'A new log', notes: 'here are some notes' }))
      .toMatchObject({
        area: {
          changed: expect.any(Number),
          data: [],
          conflicts: [],
        },
        asset: {
          changed: expect.any(Number),
          data: [],
          conflicts: [],
        },
        files: {
          changed: expect.any(Number),
          data: [],
          conflicts: [],
        },
        geofield: {
          changed: expect.any(Number),
          data: null,
          conflicts: [],
        },
        images: {
          changed: expect.any(Number),
          data: [],
          conflicts: [],
        },
        notes: {
          changed: expect.any(Number),
          data: 'here are some notes',
          conflicts: [],
        },
        movement: {
          changed: expect.any(Number),
          data: null,
          conflicts: [],
        },
        log_category: {
          changed: expect.any(Number),
          data: null,
          conflicts: [],
        },
        log_owner: {
          changed: expect.any(Number),
          data: null,
          conflicts: [],
        },
        inventory: {
          changed: expect.any(Number),
          data: null,
          conflicts: [],
        },
        membership: {
          changed: expect.any(Number),
          data: null,
          conflicts: [],
        },
        quantity: {
          changed: expect.any(Number),
          data: null,
          conflicts: [],
        },
        flags: {
          changed: expect.any(Number),
          data: null,
          conflicts: [],
        },
        data: {
          changed: expect.any(Number),
          data: null,
          conflicts: [],
        },
        equipment: {
          changed: expect.any(Number),
          data: null,
          conflicts: [],
        },
        name: {
          changed: expect.any(Number),
          data: 'A new log',
          conflicts: [],
        },
        type: {
          changed: expect.any(Number),
          data: 'farm_activity',
          conflicts: [],
        },
        timestamp: {
          changed: expect.any(Number),
          data: expect.any(Number),
          conflicts: [],
        },
        done: {
          changed: expect.any(Number),
          data: false,
          conflicts: [],
        },
        isCachedLocally: false,
        wasPushedToServer: false,
        isReadyToSync: false,
        modules: [],
      });
  });
});

const isInt = string => /^[-+]?(\d+|Infinity)$/.test(string);
const reviver = (key, val) => (typeof val === 'string' && isInt(val) ? +val : val);
const parser = log => JSON.parse(JSON.stringify(log), reviver);

describe('updateLog', () => {
  it('can reformat old logs', () => {
    expect(updateLog(parser({
      log_owner: {
        data: [
          {
            uri: 'http://localhost:80/user/1',
            id: '1',
            resource: 'user',
          },
        ],
        changed: '1573832704',
      },
      notes: { data: 'yep some notes', changed: '1573832704' },
      quantity: { data: [], changed: '1573832704' },
      log_category: { data: [], changed: '1573832704' },
      equipment: { data: [], changed: '1573832704' },
      id: '255',
      localID: 2,
      name: { data: 'apply input', changed: '1573832704' },
      type: { data: 'farm_activity', changed: '1573832704' },
      timestamp: { data: '1551753643', changed: '1573832704' },
      images: { data: [], changed: '1573832704' },
      done: { data: false, changed: '1579140679' },
      isCachedLocally: true,
      isReadyToSync: false,
      wasPushedToServer: false,
      // NOTE: I've manually changed `remoteUri` to `url` to reflect the DB
      // migration that's been written to handle this instead.
      url: '/log/255',
      asset: {
        data: [
          {
            uri: 'http://localhost:80/farm_asset/11',
            id: '11',
            resource: 'farm_asset',
          }],
        changed: '1573832704',
      },
      movement: { data: { area: [], geometry: '' }, changed: null },
      modules: ['my-logs'],
      area: { data: [{ uri: 'http://localhost:80/taxonomy_term/11', id: '11', resource: 'taxonomy_term' }], changed: '1573832704' },
      geofield: {
        data: [{
          geom: 'POLYGON ((-75.53643733263014 42.54424760416683, -75.5360350012779 42.54427527000766, -75.53589016199109 42.54412508386721, -75.53547173738478 42.54316467447933, -75.53547173738478 42.54301053332517, -75.53564876317976 42.54289196294764, -75.53582578897475 42.54281291590414, -75.53588747978209 42.54302634269183, -75.53643733263014 42.54424760416683))',
          geo_type: 'polygon',
          lat: '42.543592098100',
          lon: '-75.535910393822',
          left: '-75.536437332630',
          top: '42.544275270008',
          right: '-75.535471737385',
          bottom: '42.542812915904',
          srid: null,
          latlon: '42.543592098100,-75.535910393822',
          schemaorg_shape: '42.542812915904,-75.536437332630 42.542812915904,-75.535471737385 42.544275270008,-75.535471737385 42.544275270008,-75.536437332630 42.542812915904,-75.536437332630',
        }],
        changed: '1573832704',
      },
    })))
      .toMatchObject({
        area: {
          changed: 1573832704,
          data: [
            {
              uri: 'http://localhost:80/taxonomy_term/11',
              id: 11,
              resource: 'taxonomy_term',
            },
          ],
          conflicts: [],
        },
        asset: {
          changed: 1573832704,
          data: [
            {
              uri: 'http://localhost:80/farm_asset/11',
              id: 11,
              resource: 'farm_asset',
            },
          ],
          conflicts: [],
        },
        files: {
          changed: expect.any(Number),
          data: [],
          conflicts: [],
        },
        geofield: {
          changed: 1573832704,
          data: [
            {
              geom: 'POLYGON ((-75.53643733263014 42.54424760416683, -75.5360350012779 42.54427527000766, -75.53589016199109 42.54412508386721, -75.53547173738478 42.54316467447933, -75.53547173738478 42.54301053332517, -75.53564876317976 42.54289196294764, -75.53582578897475 42.54281291590414, -75.53588747978209 42.54302634269183, -75.53643733263014 42.54424760416683))',
              geo_type: 'polygon',
              lat: '42.543592098100',
              lon: '-75.535910393822',
              left: '-75.536437332630',
              top: '42.544275270008',
              right: '-75.535471737385',
              bottom: '42.542812915904',
              srid: null,
              latlon: '42.543592098100,-75.535910393822',
              schemaorg_shape: '42.542812915904,-75.536437332630 42.542812915904,-75.535471737385 42.544275270008,-75.535471737385 42.544275270008,-75.536437332630 42.542812915904,-75.536437332630',
            },
          ],
          conflicts: [],
        },
        images: {
          changed: 1573832704,
          data: [],
          conflicts: [],
        },
        notes: {
          changed: 1573832704,
          data: 'yep some notes',
          conflicts: [],
        },
        movement: {
          changed: null,
          data: {
            area: [],
            geometry: '',
          },
          conflicts: [],
        },
        log_category: {
          changed: 1573832704,
          data: [],
          conflicts: [],
        },
        log_owner: {
          changed: 1573832704,
          data: [
            {
              uri: 'http://localhost:80/user/1',
              id: 1,
              resource: 'user',
            },
          ],
          conflicts: [],
        },
        inventory: {
          changed: expect.any(Number),
          data: null,
          conflicts: [],
        },
        membership: {
          changed: expect.any(Number),
          data: null,
          conflicts: [],
        },
        quantity: {
          changed: 1573832704,
          data: [],
          conflicts: [],
        },
        flags: {
          changed: expect.any(Number),
          data: null,
          conflicts: [],
        },
        data: {
          changed: expect.any(Number),
          data: null,
          conflicts: [],
        },
        equipment: {
          changed: 1573832704,
          data: [],
          conflicts: [],
        },
        name: {
          changed: 1573832704,
          data: 'apply input',
          conflicts: [],
        },
        type: {
          changed: 1573832704,
          data: 'farm_activity',
          conflicts: [],
        },
        timestamp: {
          changed: 1573832704,
          data: 1551753643,
          conflicts: [],
        },
        done: {
          changed: 1579140679,
          data: false,
          conflicts: [],
        },
        url: '/log/255',
        id: 255,
        localID: 2,
        isCachedLocally: true,
        wasPushedToServer: false,
        isReadyToSync: false,
        modules: [
          'my-logs',
        ],
      });
  });

  it('updates a newly created log', () => {
    expect(updateLog(createLog(), { name: 'A new log', notes: 'here are some notes' }))
      .toMatchObject({
        area: {
          changed: expect.any(Number),
          data: [],
          conflicts: [],
        },
        asset: {
          changed: expect.any(Number),
          data: [],
          conflicts: [],
        },
        files: {
          changed: expect.any(Number),
          data: [],
          conflicts: [],
        },
        geofield: {
          changed: expect.any(Number),
          data: null,
          conflicts: [],
        },
        images: {
          changed: expect.any(Number),
          data: [],
          conflicts: [],
        },
        notes: {
          changed: expect.any(Number),
          data: 'here are some notes',
          conflicts: [],
        },
        movement: {
          changed: expect.any(Number),
          data: null,
          conflicts: [],
        },
        log_category: {
          changed: expect.any(Number),
          data: null,
          conflicts: [],
        },
        log_owner: {
          changed: expect.any(Number),
          data: null,
          conflicts: [],
        },
        inventory: {
          changed: expect.any(Number),
          data: null,
          conflicts: [],
        },
        membership: {
          changed: expect.any(Number),
          data: null,
          conflicts: [],
        },
        quantity: {
          changed: expect.any(Number),
          data: null,
          conflicts: [],
        },
        flags: {
          changed: expect.any(Number),
          data: null,
          conflicts: [],
        },
        data: {
          changed: expect.any(Number),
          data: null,
          conflicts: [],
        },
        equipment: {
          changed: expect.any(Number),
          data: null,
          conflicts: [],
        },
        name: {
          changed: expect.any(Number),
          data: 'A new log',
          conflicts: [],
        },
        type: {
          changed: expect.any(Number),
          data: 'farm_activity',
          conflicts: [],
        },
        timestamp: {
          changed: expect.any(Number),
          data: expect.any(Number),
          conflicts: [],
        },
        done: {
          changed: expect.any(Number),
          data: false,
          conflicts: [],
        },
        isCachedLocally: false,
        wasPushedToServer: false,
        isReadyToSync: false,
        modules: [],
      });
  });
});

describe('formatLogForServer', () => {
  it('formats a newly created log for the server', () => {
    expect(formatLogForServer(createLog()))
      .toMatchObject(
        expect.objectContaining({
          area: [],
          asset: [],
          files: [],
          geofield: null,
          images: [],
          notes: { value: '', format: 'farm_format' },
          movement: null,
          log_category: null,
          log_owner: null,
          inventory: null,
          membership: null,
          quantity: null,
          flags: null,
          data: null,
          equipment: null,
          name: '',
          type: 'farm_activity',
          timestamp: expect.any(Number),
          done: false,
        }),
      );
  });
});

describe('mergeLogFromServer', () => {
  it('merges a log from the server with its local copy', () => {
    expect(mergeLogFromServer(
      {
        area: [
          {
            uri: 'http://localhost:80/taxonomy_term/11',
            id: 11,
            resource: 'taxonomy_term',
          },
        ],
        asset: [
          {
            uri: 'http://localhost:80/farm_asset/11',
            id: 11,
            resource: 'farm_asset',
          },
        ],
        files: [],
        geofield: [
          {
            geom: 'POLYGON ((-75.53643733263014 42.54424760416683, -75.5360350012779 42.54427527000766, -75.53589016199109 42.54412508386721, -75.53547173738478 42.54316467447933, -75.53547173738478 42.54301053332517, -75.53564876317976 42.54289196294764, -75.53582578897475 42.54281291590414, -75.53588747978209 42.54302634269183, -75.53643733263014 42.54424760416683))',
            geo_type: 'polygon',
            lat: 42.5435920981,
            lon: -75.535910393822,
            left: -75.53643733263,
            top: 42.544275270008,
            right: -75.535471737385,
            bottom: 42.542812915904,
            srid: null,
            latlon: '42.543592098100,-75.535910393822',
            schemaorg_shape: '42.542812915904,-75.536437332630 42.542812915904,-75.535471737385 42.544275270008,-75.535471737385 42.544275270008,-75.536437332630 42.542812915904,-75.536437332630',
          },
        ],
        images: [],
        notes: {
          value: 'yep some notes',
          format: 'farm_format',
        },
        movement: {
          area: [],
          geometry: 0,
        },
        log_category: [],
        log_owner: [
          {
            uri: 'http://localhost:80/user/1',
            id: 1,
            resource: 'user',
          },
        ],
        inventory: null,
        membership: null,
        quantity: [],
        flags: null,
        data: null,
        equipment: [],
        name: 'apply input',
        type: 'farm_activity',
        timestamp: 1551753643,
        done: false,
        id: 255,
        changed: 1580565564,
        url: 'https://test.farmos.net/log/179',
      },
      {
        area: {
          changed: 1573832704,
          data: [
            {
              uri: 'http://localhost:80/taxonomy_term/11',
              id: 11,
              resource: 'taxonomy_term',
            },
          ],
          conflicts: [],
        },
        asset: {
          changed: 1573832704,
          data: [
            {
              uri: 'http://localhost:80/farm_asset/11',
              id: 11,
              resource: 'farm_asset',
            },
          ],
          conflicts: [],
        },
        files: {
          changed: 1580567553,
          data: [],
          conflicts: [],
        },
        geofield: {
          changed: 1573832704,
          data: [
            {
              geom: 'POLYGON ((-75.53643733263014 42.54424760416683, -75.5360350012779 42.54427527000766, -75.53589016199109 42.54412508386721, -75.53547173738478 42.54316467447933, -75.53547173738478 42.54301053332517, -75.53564876317976 42.54289196294764, -75.53582578897475 42.54281291590414, -75.53588747978209 42.54302634269183, -75.53643733263014 42.54424760416683))',
              geo_type: 'polygon',
              lat: '42.543592098100',
              lon: '-75.535910393822',
              left: '-75.536437332630',
              top: '42.544275270008',
              right: '-75.535471737385',
              bottom: '42.542812915904',
              srid: null,
              latlon: '42.543592098100,-75.535910393822',
              schemaorg_shape: '42.542812915904,-75.536437332630 42.542812915904,-75.535471737385 42.544275270008,-75.535471737385 42.544275270008,-75.536437332630 42.542812915904,-75.536437332630',
            },
          ],
          conflicts: [],
        },
        images: {
          changed: 1573832704,
          data: [],
          conflicts: [],
        },
        notes: {
          changed: 1580000001,
          data: {
            value: 'some different notes',
            format: 'farm_format',
          },
          conflicts: [],
        },
        movement: {
          changed: 1573832704,
          data: {
            area: [],
            geometry: 0,
          },
          conflicts: [],
        },
        log_category: {
          changed: 1573832704,
          data: [],
          conflicts: [],
        },
        log_owner: {
          changed: 1573832704,
          data: [
            {
              uri: 'http://localhost:80/user/1',
              id: 1,
              resource: 'user',
            },
          ],
          conflicts: [],
        },
        inventory: {
          changed: 1580567553,
          data: null,
          conflicts: [],
        },
        membership: {
          changed: 1580567553,
          data: null,
          conflicts: [],
        },
        quantity: {
          changed: 1573832704,
          data: [],
          conflicts: [],
        },
        flags: {
          changed: 1580567553,
          data: null,
          conflicts: [],
        },
        data: {
          changed: 1580567553,
          data: null,
          conflicts: [],
        },
        equipment: {
          changed: 1573832704,
          data: [],
          conflicts: [],
        },
        name: {
          changed: 1573832704,
          data: 'apply input',
          conflicts: [],
        },
        type: {
          changed: 1573832704,
          data: 'farm_activity',
          conflicts: [],
        },
        timestamp: {
          changed: 1573832704,
          data: 1551753643,
          conflicts: [],
        },
        done: {
          changed: 1579140679,
          data: false,
          conflicts: [],
        },
        url: 'https://test.farmos.net/log/179',
        id: 255,
        localID: 2,
        isCachedLocally: true,
        wasPushedToServer: false,
        isReadyToSync: false,
        modules: [
          'my-logs',
        ],
      },
    )).toMatchObject({
      area: {
        changed: 1573832704,
        data: [
          {
            uri: 'http://localhost:80/taxonomy_term/11',
            id: 11,
            resource: 'taxonomy_term',
          },
        ],
        conflicts: [],
      },
      asset: {
        changed: 1573832704,
        data: [
          {
            uri: 'http://localhost:80/farm_asset/11',
            id: 11,
            resource: 'farm_asset',
          },
        ],
        conflicts: [],
      },
      files: {
        changed: 1580567553,
        data: [],
        conflicts: [],
      },
      geofield: {
        changed: 1573832704,
        data: [
          {
            geom: 'POLYGON ((-75.53643733263014 42.54424760416683, -75.5360350012779 42.54427527000766, -75.53589016199109 42.54412508386721, -75.53547173738478 42.54316467447933, -75.53547173738478 42.54301053332517, -75.53564876317976 42.54289196294764, -75.53582578897475 42.54281291590414, -75.53588747978209 42.54302634269183, -75.53643733263014 42.54424760416683))',
            geo_type: 'polygon',
            lat: '42.543592098100',
            lon: '-75.535910393822',
            left: '-75.536437332630',
            top: '42.544275270008',
            right: '-75.535471737385',
            bottom: '42.542812915904',
            srid: null,
            latlon: '42.543592098100,-75.535910393822',
            schemaorg_shape: '42.542812915904,-75.536437332630 42.542812915904,-75.535471737385 42.544275270008,-75.535471737385 42.544275270008,-75.536437332630 42.542812915904,-75.536437332630',
          },
        ],
        conflicts: [],
      },
      images: {
        changed: 1573832704,
        data: [],
        conflicts: [],
      },
      notes: {
        changed: 1580000001,
        data: {
          value: 'some different notes',
          format: 'farm_format',
        },
        conflicts: [
          {
            changed: 1580565564,
            data: {
              value: 'yep some notes',
              format: 'farm_format',
            },
          },
        ],
      },
      movement: {
        changed: 1573832704,
        data: {
          area: [],
          geometry: 0,
        },
        conflicts: [],
      },
      log_category: {
        changed: 1573832704,
        data: [],
        conflicts: [],
      },
      log_owner: {
        changed: 1573832704,
        data: [
          {
            uri: 'http://localhost:80/user/1',
            id: 1,
            resource: 'user',
          },
        ],
        conflicts: [],
      },
      inventory: {
        changed: 1580567553,
        data: null,
        conflicts: [],
      },
      membership: {
        changed: 1580567553,
        data: null,
        conflicts: [],
      },
      quantity: {
        changed: 1573832704,
        data: [],
        conflicts: [],
      },
      flags: {
        changed: 1580567553,
        data: null,
        conflicts: [],
      },
      data: {
        changed: 1580567553,
        data: null,
        conflicts: [],
      },
      equipment: {
        changed: 1573832704,
        data: [],
        conflicts: [],
      },
      name: {
        changed: 1573832704,
        data: 'apply input',
        conflicts: [],
      },
      type: {
        changed: 1573832704,
        data: 'farm_activity',
        conflicts: [],
      },
      timestamp: {
        changed: 1573832704,
        data: 1551753643,
        conflicts: [],
      },
      done: {
        changed: 1579140679,
        data: false,
        conflicts: [],
      },
      url: 'https://test.farmos.net/log/179',
      modules: [
        'my-logs',
      ],
      id: 255,
    });
  });
});
