/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { filter } from 'ramda';
import createQuery from './createQuery';

describe('createQuery', () => {
  const logs = [
    {
      localID: 1,
      type: 'farm_activity',
    },
    {
      localID: 2,
      type: 'farm_activity',
    },
    {
      localID: 3,
      type: 'farm_activity',
    },
    {
      localID: 4,
      type: 'farm_activity',
    },
    {
      localID: 5,
      type: 'farm_activity',
    },
    {
      localID: 6,
      type: 'farm_activity',
    },
    {
      localID: 7,
      type: 'farm_activity',
    },
    {
      localID: 8,
      type: 'farm_activity',
    },
    {
      localID: 9,
      type: 'farm_observation',
    },
    {
      localID: 10,
      type: 'farm_input',
    },
  ];
  it('Filters out logs by type and by localID', () => {
    const filters = { type: 'farm_observation' };
    const pass = { localIDs: [1, 2, 4, 5] };
    const filteredLogs = [
      {
        localID: 1,
        type: 'farm_activity',
      },
      {
        localID: 2,
        type: 'farm_activity',
      },
      {
        localID: 4,
        type: 'farm_activity',
      },
      {
        localID: 5,
        type: 'farm_activity',
      },
      {
        localID: 9,
        type: 'farm_observation',
      },
    ];
    expect(filter(createQuery(filters, pass), logs))
      .toMatchObject(filteredLogs);
  });
  it('Filters out logs of multiple types and by localID', () => {
    const filters = { type: ['farm_observation', 'farm_input'] };
    const pass = { localIDs: [1, 2, 4, 5] };
    const filteredLogs = [
      {
        localID: 1,
        type: 'farm_activity',
      },
      {
        localID: 2,
        type: 'farm_activity',
      },
      {
        localID: 4,
        type: 'farm_activity',
      },
      {
        localID: 5,
        type: 'farm_activity',
      },
      {
        localID: 9,
        type: 'farm_observation',
      },
      {
        localID: 10,
        type: 'farm_input',
      },
    ];
    expect(filter(createQuery(filters, pass), logs))
      .toMatchObject(filteredLogs);
  });
});
