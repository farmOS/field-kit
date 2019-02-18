// A utlity for obtaining geolocation via Cordova and checking it against areas with turf.js

import * as turf from 'turf';

export default {
  actions: {
    getGeolocation({ commit }) {
      const currentLoc = {};
      function onSuccess(position) {
        currentLoc.Latitude = position.coords.latitude;
        currentLoc.Longitude = position.coords.longitude;
        currentLoc.Altitude = position.coords.altitude;
        currentLoc.Accuracy = position.coords.accuracy;
        currentLoc.AltitudeAccuracy = position.coords.altitudeAccuracy;
        currentLoc.Heading = position.coords.heading;
        currentLoc.Speed = position.coords.speed;
        currentLoc.Timestamp = position.timestamp;
        console.log('SETTING GEOLOCATION AS:');
        console.log(currentLoc);
        // Set 'geolocation' variable in the app store
        commit('setGeoloc', currentLoc);
      }
      function onError(error) {
        console.log(`Code: ${error.code} Message: ${error.message}`);
      }
      // Use the Cordova geolocation plugin to get current location from the device OR browser
      navigator.geolocation.getCurrentPosition(onSuccess, onError);
    },

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

      const geometry = params.area.field_farm_geofield[0].geom;
      const geomJSON = geoJSONify(geometry);

      // Now I'll check whether the point is inside the polygon (isInside)
      // OR if the point is within [radius] km of the polygon border (isNear)
      const circle = turf.circle(params.point, params.radius, { units: 'kilometers' });
      const polygon = turf.polygon(geomJSON);
      const isInside = turf.inside(params.point, polygon);
      const isNear = turf.intersect(circle, polygon) !== null;
      console.log(`${params.area.name} ISINSIDE RESULTS: ${isInside}; ISNEAR RESULTS: ${isNear}`);
      if (isInside || isNear) {
        commit('addLocalArea', params.area);
      }
    },
  },
};
