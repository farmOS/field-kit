// A utlity for obtaining geolocation via Cordova and checking it against areas with turf.js

import * as turf from '@turf/turf';

export default {
  actions: {
    checkInNear({ commit }, params) {
      // For each polygon I need lon,lat pairs in a nested numeric array, as in [[o,a],[o,a]]
      function parsePoly(poly) {
        const coordPairs = poly.split(', ');
        const points = [];
        coordPairs.forEach((coordStr) => {
          const pair = coordStr.split(' ');
          points.push([Number(pair[0]), Number(pair[1])]);
        });
        return (points);
      }
      // If the geometry contains multiple polygons, I need to separate them before parsing
      function geoJSONify(geometry) {
        const geoJSON = [];
        if (geometry.includes('GEOMETRY')) {
          const polys = geometry.slice(30, -3).split(')), POLYGON ((');
          polys.forEach((pol) => {
            geoJSON.push(parsePoly(pol));
          });
        } else {
          geoJSON.push(parsePoly(geometry.slice(10, -2)));
        }
        return geoJSON;
      }

      const geometry = params.area.geofield[0].geom;
      const geomJSON = geoJSONify(geometry);

      // Now I'll check whether the point is inside the polygon (isInside)
      // OR if the point is within [radius] km of the polygon border (isNear)
      const circle = turf.circle(params.point, params.radius, { units: 'kilometers' });
      const polygon = turf.polygon(geomJSON);
      const isInside = turf.inside(params.point, polygon);
      const isNear = turf.intersect(circle, polygon) !== null;
      if (isInside || isNear) {
        commit('addLocalArea', params.area);
      }
    },
  },
};
