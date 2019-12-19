/**
 * A function which recursively removes properties from an object whose values
 * are `null`, `undefined`, `[]`, `{}` or `''`. It returns a new object with
 * those properties removed.
 */
function stripNullsFromObject(obj) {
  function stripNullsFromArray(arr) {
    return arr.reduce((acc, cur) => {
      if (typeof cur === 'object' && !Array.isArray(cur) && cur !== null) {
        const nestedObj = stripNullsFromObject(cur);
        if (Object.entries(nestedObj).length > 0) {
          return acc.concat(nestedObj);
        }
      }
      if (Array.isArray(cur)) {
        const nestedArr = stripNullsFromArray(cur);
        if (nestedArr.length > 0) {
          return acc.concat(nestedArr);
        }
      }
      if (typeof cur !== 'object' && (!!cur || cur === 0)) {
        return acc.concat(cur);
      }
      return acc;
    }, []);
  }

  return Object.entries(obj).reduce((acc, [key, val]) => {
    if (typeof val === 'object' && !Array.isArray(val) && val !== null) {
      const nestedObj = stripNullsFromObject(val);
      if (Object.entries(nestedObj).length > 0) {
        return {
          ...acc,
          [key]: nestedObj,
        };
      }
    }
    if (Array.isArray(val)) {
      const nestedArr = stripNullsFromArray(val);
      if (nestedArr.length > 0) {
        return {
          ...acc,
          [key]: nestedArr,
        };
      }
    }
    if (typeof val !== 'object' && (!!val || val === 0)) {
      return {
        ...acc,
        [key]: val,
      };
    }
    return acc;
  }, {});
}

export default stripNullsFromObject;
