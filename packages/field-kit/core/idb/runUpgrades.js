// Recusive function for running async upgrades sequentially.
export const run = (event, upgrades) => {
  if (upgrades.length > 0) {
    const head = upgrades[0];
    const tail = upgrades.slice(1);
    // Wrap every onUpgrade call so we can be sure it returns a promise.
    return Promise.resolve(head.onUpgrade(event, head.config))
      .then(() => run(event, tail));
  }
  return Promise.resolve();
};

// Recursive function for sorting and inserting the next upgrade into an array
// of upgrades, sorted in ascending order by version #.
const sortByVersion = (arr, next) => {
  if (!next) { return arr; }
  const last = arr[arr.length - 1];
  const rest = arr.slice(0, arr.length - 1);
  if (arr.length < 1 || next.version > last.version) {
    return arr.concat(next);
  }
  return sortByVersion(rest, next).concat(last);
};

// Function that takes a minimum version # and returns a reducer function for
// filtering by that minimum and sorting in ascending order.
const filterAndSort = (min = 0) => (acc, cur) => {
  if (cur.version > min) {
    return sortByVersion(acc, cur);
  }
  return acc;
};

const runUpgrades = config => (event) => {
  const reducer = filterAndSort(event.oldVersion);
  const sortedUpgrades = config.stores
    .flatMap(({ upgrades, ...rest }) => ([
      ...upgrades.map(u => ({ ...u, config: rest })),
    ]))
    .reduce(reducer, []);
  return run(event, sortedUpgrades);
};

export default runUpgrades;
