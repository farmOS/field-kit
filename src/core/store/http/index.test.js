import { partitionResponses, flattenResponses } from './index';

describe('flattenResponses', () => {
  it('flattens all the promises', () => {
    const resolvedResponses = [
      {
        status: 'fulfilled',
        value: {
          list: [
            { id: 1 },
            { id: 2 },
          ],
        },
      },
      {
        status: 'fulfilled',
        value: {
          list: [
            { id: 2 },
            { id: 3 },
          ],
        },
      },
    ];
    const flattenedResponses = [{ id: 1 }, { id: 2 }, { id: 3 }];
    expect(flattenResponses(resolvedResponses))
      .toMatchObject(flattenedResponses);
  });
});

describe('partitionResponses', () => {
  it('splits responses into two arrays, "fulfilled" and "rejected"', () => {
    const responses = [
      {
        status: 'fulfilled',
        value: 1,
      },
      {
        status: 'rejected',
        reason: 2,
      },
      {
        status: 'fulfilled',
        value: 3,
      },
      {
        status: 'fulfilled',
        value: 4,
      },
      {
        status: 'rejected',
        reason: 5,
      },
    ];
    const partitionedResponses = [
      [
        {
          status: 'fulfilled',
          value: 1,
        },
        {
          status: 'fulfilled',
          value: 3,
        },
        {
          status: 'fulfilled',
          value: 4,
        },
      ],
      [
        {
          status: 'rejected',
          reason: 2,
        },
        {
          status: 'rejected',
          reason: 5,
        },
      ],
    ];
    expect(partitionResponses(responses)).toMatchObject(partitionedResponses);
  });
});
