/* eslint-disable no-undef */
import { sortByVersion, filterAndSort, runUpgrades } from './createFieldModule';

describe('sortByVersion', () => {
  it('inserts an object into an array in ascending order', () => {
    expect(sortByVersion([
      { version: 1 },
      { version: 3 },
      { version: 4 },
    ], { version: 2 })).toMatchObject([
      { version: 1 },
      { version: 2 },
      { version: 3 },
      { version: 4 },
    ]);
  });

  it('handles an empty array', () => {
    expect(sortByVersion([], { version: 1 }))
      .toMatchObject([{ version: 1 }]);
  });

  it('handles an undefined 2nd param', () => {
    expect(sortByVersion([{ version: 1 }]))
      .toMatchObject([{ version: 1 }]);
  });
});

describe('filterAndSort', () => {
  it('filters out objects with a version # below the minimum', () => {
    expect([
      { version: 1 },
      { version: 2 },
      { version: 3 },
      { version: 4 },
    ].reduce(filterAndSort(2), []))
      .toMatchObject([
        { version: 3 },
        { version: 4 },
      ]);
  });

  it('sorts an array of objects by version number, with no minimum', () => {
    expect([
      { version: 2 },
      { version: 1 },
      { version: 4 },
      { version: 3 },
    ].reduce(filterAndSort(undefined), []))
      .toMatchObject([
        { version: 1 },
        { version: 2 },
        { version: 3 },
        { version: 4 },
      ]);
  });

  it('filters out versions below min, and sorts in ascending order', () => {
    expect([
      { version: 2 },
      { version: 1 },
      { version: 4 },
      { version: 3 },
    ].reduce(filterAndSort(2), []))
      .toMatchObject([
        { version: 3 },
        { version: 4 },
      ]);
  });
});

describe('runUpgrades', () => {
  let str = '';
  const upgrades = [
    {
      version: 1,
      onUpgrade() {
        return new Promise((resolve) => {
          setTimeout(() => {
            str += this.version;
            resolve();
          }, 300);
        });
      },
    },
    {
      version: 2,
      onUpgrade() {
        str += this.version;
      },
    },
    {
      version: 3,
      onUpgrade() {
        return new Promise((resolve) => {
          setTimeout(() => {
            str += this.version;
            resolve();
          }, 100);
        });
      },
    },
    {
      version: 4,
      onUpgrade() {
        return new Promise((resolve) => {
          setTimeout(() => {
            str += this.version;
            resolve();
          }, 0);
        });
      },
    },
  ];

  it('runs in correct order', () => runUpgrades()(upgrades)
    .then(() => {
      expect(str).toBe('1234');
    }));
});
