// Recusive function for running async upgrades sequentially.
export const runUpgrades = deps => (upgrades) => {
  if (upgrades.length > 0) {
    const tail = upgrades.slice(1);
    // Wrap every onUpgrade call so we can be sure it returns a promise.
    return Promise.resolve(upgrades[0].onUpgrade(deps))
      .then(() => runUpgrades(deps)(tail));
  }
  return undefined;
};

// Recursive function for sorting and inserting the next upgrade into an array
// of upgrades, sorted in ascending order by version #.
export const sortByVersion = (arr, next) => {
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
export const filterAndSort = (min = 0) => (acc, cur) => {
  if (cur.version > min) {
    return sortByVersion(acc, cur);
  }
  return acc;
};
