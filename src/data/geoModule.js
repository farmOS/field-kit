// A utlity for obtaining geolocation via Cordova and checking it against areas with turf.js

// Importing turf geolibrary
import * as turf from '@turf/turf'

export default {
  actions: {
    getGeolocation({ commit, rootState }) {
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
        console.log("SETTING GEOLOCATION AS:");
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

    checkInside({ rootState }, params) {
      // For each polygon I need lon,lat pairs in a nested numeric array, as in [[o,a],[o,a]]
      function parsePoly(poly) {
        const coordPairs = poly.split(", ");
        const points = [];
        for (var i = 0; i < coordPairs.length; i++) {
          const pair = coordPairs[i].split(" ");
          points.push([Number(pair[0]), Number(pair[1])]);
        }
        return (points);
      }
      // If the geometry contains multiple polygons, I need to separate them before parsing
      function geoJSONify(geometry) {
        const geoJSON = [];
        if (geometry.includes("GEOMETRY")) {
          const polys = geometry.slice(30, -3).split(")), POLYGON ((");
          for (var i = 0; i < polys.length; i++) {
            geoJSON.push(parsePoly(polys[i]));
          }
        } else {
          geoJSON.push(parsePoly(geometry.slice(10, -2)));
        }
        return geoJSON;
      }

      console.log("DOING CHECKINSIDE WITH");
      console.log(params.point);
      const geomJSON = geoJSONify(params.polygon);
      console.log(geomJSON);

      // Now I'll check whether the point is inside the polygon with turf
      const point = turf.point(params.point);
      const polygon = turf.polygon(geomJSON);
      const isInside = turf.inside(point, polygon);
      console.log(`TURF.INSIDE RESULTS: ${isInside}`);
      // Output the boolean result
      return isInside;
    },
  },
};
