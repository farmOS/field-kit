import parseFilter from './parseFilter';

describe('parseFilter', () => {
  it('parses a complex filter', () => {
    const filter = {
      $or: [
        { type: 'activity' },
        { type: 'observation', status: 'done', count: { $gt: 35, $lt: 43 } },
        { status: 'pending' },
        { id: 1234 },
      ],
    };

    const predicate = parseFilter(filter);

    const logs = [
      {
        id: 1234,
        type: 'observation',
        status: 'done',
        count: 50,
      },
      {
        id: 1,
        type: 'observation',
        status: 'done',
        count: 42,
      },
      {
        id: 2,
        type: 'observation',
        status: 'done',
        count: 50,
      },
      {
        id: 3,
        type: 'activity',
        status: 'done',
        count: 50,
      },
    ];
    const result = logs.filter(predicate);
    expect(result).toMatchObject([
      {
        id: 1234,
        type: 'observation',
        status: 'done',
        count: 50,
      },
      {
        id: 1,
        type: 'observation',
        status: 'done',
        count: 42,
      },
      {
        id: 3,
        type: 'activity',
        status: 'done',
        count: 50,
      },
    ]);
  });
  const logsWithOwners = [
    {
      type: 'observation',
      owner: [
        { id: 1 },
      ],
    },
    {
      type: 'observation',
      owner: [
        { id: 2 },
      ],
    },
    {
      type: 'activity',
      owner: [
        { id: 2 },
      ],
    },
  ];
  const logsFilteredByOwner = [
    {
      type: 'observation',
      owner: [
        { id: 1 },
      ],
    },
    {
      type: 'activity',
      owner: [
        { id: 2 },
      ],
    },
  ];
  it('parses $in operator', () => {
    const filter = {
      $or: [
        { type: 'activity' },
        {
          type: 'observation',
          owner: { $in: [{ id: 1 }] },
        },
      ],
    };

    const predicate = parseFilter(filter);

    const result = logsWithOwners.filter(predicate);
    expect(result).toMatchObject(logsFilteredByOwner);
  });
  it('parses dot notation', () => {
    const filter = {
      $or: [
        { type: 'activity' },
        {
          type: 'observation',
          'owner.id': 1,
        },
      ],
    };

    const predicate = parseFilter(filter);

    const result = logsWithOwners.filter(predicate);
    expect(result).toMatchObject(logsFilteredByOwner);
  });
});
