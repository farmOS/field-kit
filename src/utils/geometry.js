import { parse, stringify } from 'wellknown';

function compare(geojson1, geojson2) {
  return JSON.stringify(geojson1.coordinates) === JSON.stringify(geojson2.coordinates);
}

// Takes an array of WKT strings and returns a single WKT string
// eslint-disable-next-line import/prefer-default-export
export function mergeGeometries(wkts) {
  // First, filter out empty strings and return a value if there are less than
  // two values to merge.
  const validWKTs = wkts.filter(wkt => wkt !== '');
  if (validWKTs.length === 0) {
    return '';
  }
  if (validWKTs.length === 1) {
    return validWKTs[0];
  }

  // Next convert the WKT's to GeoJSON so they can be merged.
  const geojsons = validWKTs.map(parse);
  const initGeoJSON = {
    type: 'GeometryCollection',
    geometries: [],
  };
  const mergedGeoJSON = geojsons.reduce((acc, cur) => {
    // Handle non-GeometryCollections first.
    if (cur.type !== 'GeometryCollection') {
      const isDuplicate = acc.geometries.some(prev => compare(prev, cur));
      if (isDuplicate) {
        return acc;
      }
      return {
        type: 'GeometryCollection',
        geometries: acc.geometries.concat(cur),
      };
    }
    // Otherwise treat the current value as a GeometryCollection.
    const filteredGeometries = cur.geometries.filter((curGeom) => {
      const isDuplicate = acc.geometries.some(prev => compare(prev, curGeom));
      return !isDuplicate;
    });
    return {
      type: 'GeometryCollection',
      geometries: acc.geometries.concat(filteredGeometries),
    };
  }, initGeoJSON);

  // Finally, convert the GeoJSON back to WKT and return it.
  const mergedWKT = stringify(mergedGeoJSON);
  return mergedWKT;
}
