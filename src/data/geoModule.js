// A utlity for obtaining geolocation via Cordova

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
      console.log("DOING CHECKINSIDE WITH");
      console.log(params.point);
      const polyJSON = geoJSONify(params.polygon);
      console.log(polyJSON);

      // Now I'll check whether the point is inside the polygon with turf
      const point = turf.point(params.point);
      const polygon = turf.polygon(polyJSON);
      const isInside = turf.inside(point, polygon);
      console.log(`TURF.INSIDE RESULTS: ${isInside}`);

      // For geoJSON format, I need lon,lat pairs in double-nested numeric arrays, as in [[[o,a],[o,a]]]
      function geoJSONify(polyFarm) {
        const coordPairs = polyFarm.slice(10, -2).split(", ");
        const points = [];
        for (var i = 0; i < coordPairs.length; i++) {
          const pair = coordPairs[i].split(" ");
          points.push([Number(pair[0]), Number(pair[1])]);
        }
        return ([points]);
      }
    },
  },
};
