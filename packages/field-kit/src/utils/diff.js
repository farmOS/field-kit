import {
  addIndex, curryN, map, reduce, remove,
} from 'ramda';

// Map any array to its index numbers, eg, ['foo', 'bar', 'bax'] => [0, 1, 2].
// This is used to keep track of the original index of items as they are diffed.
const toIndices = addIndex(map)((_, i) => i);

/**
 * @typedef {Function} diff A utility for comparing two arrays of items, helpful
 * for finding changes in a list from a previous state to the next. Using a
 * predicate function, it iterates through all items in both lists looking for
 * matches between the two lists. It returns a tuple of four lists, additions,
 * removals, and two lists of indices: the first list, additions, contains all
 * items that were not included in the previous list (2nd param) but were
 * included in the next list (3rd param), while the second list in the tuple,
 * removals, contains all items that were included in the previous list but not
 * in the next. The last two lists contain the original indices of the items in
 * the additions and removals lists, respectively.
 * @template T An item from either list, likely an object with id or primary key.
 * @param {(prev: T, nx: T) => Boolean} predicate A predicate function that takes
 * an item from the previous list as its first param and an item from the next
 * list to evaluate if they are equivalent and return true if so.
 * @param {[T]} previous An array of items representing the previous state.
 * @param {[T]} next An array of items representing the next state.
 * @returns {[[T], [T], [Number], [Number]]}
 */
const diff = curryN(3, (predicate, previous = [], next = []) =>
  addIndex(reduce)(([additions, removals, is, js], nx, i) => {
    const j = removals.findIndex(pre => predicate(pre, nx));
    if (j >= 0) {
      return [
        additions,
        remove(j, 1, removals),
        is,
        remove(j, 1, js),
      ];
    }
    return [
      [...additions, nx],
      removals,
      [...is, i],
      js,
    ];
  }, [[], previous, [], toIndices(previous)], next));

export default diff;
