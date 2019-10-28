import { parse, stringify } from 'wellknown';
import { circle, polygon, intersect } from '@turf/turf';

function compare(geojson1, geojson2) {
  return JSON.stringify(geojson1.coordinates) === JSON.stringify(geojson2.coordinates);
}

// Takes an array of WKT strings and returns a single WKT string.
export function mergeGeometries(wkts) {
  // First, filter out empty strings and return a value if there are less than
  // two values to merge.
  const validWKTs = wkts.filter(wkt => !!wkt);
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
    // Handle nulls first.
    if (!cur) {
      return acc;
    }
    // Handle non-GeometryCollections.
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

// Takes 2 strings of WKT and removes the second from the first.
export function removeGeometry(minuend, subtrahend) {
  // First handle case that either string is empty.
  if (minuend === '') {
    return '';
  }
  if (subtrahend === '') {
    return minuend;
  }

  // Next convert strings to GeoJSON for comparison.
  const minGeoJSON = parse(minuend);
  const subGeoJSON = parse(subtrahend);

  // Check whether each is a GeometryCollection, compare them accordingly, and
  // finally return the difference of the two, converted back to WKT.
  if (minGeoJSON.type !== 'GeometryCollection' && subGeoJSON.type !== 'GeometryCollection') {
    return compare(minGeoJSON, subGeoJSON) ? '' : minuend;
  }
  if (minGeoJSON.type === 'GeometryCollection' && subGeoJSON.type !== 'GeometryCollection') {
    const difGeoJSON = {
      type: 'GeometryCollection',
      geometries: minGeoJSON.geometries.filter(minGeom => !compare(minGeom, subGeoJSON)),
    };
    const difference = difGeoJSON.geometries.length > 0 ? stringify(difGeoJSON) : '';
    return difference;
  }
  if (minGeoJSON.type === 'GeometryCollection' && subGeoJSON.type === 'GeometryCollection') {
    const difGeoJSON = {
      type: 'GeometryCollection',
      geometries: minGeoJSON.geometries.filter((minGeom) => {
        const isMatch = subGeoJSON.geometries.some(subGeom => compare(minGeom, subGeom));
        return !isMatch;
      }),
    };
    const difference = difGeoJSON.geometries.length > 0 ? stringify(difGeoJSON) : '';
    return difference;
  }
  if (minGeoJSON.type !== 'GeometryCollection' && subGeoJSON.type === 'GeometryCollection') {
    const isMatch = subGeoJSON.geometries.some(subGeom => compare(minGeoJSON, subGeom));
    return isMatch ? '' : minuend;
  }
  throw new Error('Format(s) not recognized as valid WKT.');
}

export function isNearby(location, wkt, radius) {
  const geoJSON = parse(wkt);
  const radiusAroundLocation = circle(location, radius, { units: 'kilometers' });
  const feature = polygon(geoJSON.coordinates);
  const intersection = intersect(radiusAroundLocation, feature);
  return intersection !== null;
}
