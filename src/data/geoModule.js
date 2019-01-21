// A utlity for obtaining geolocation via Cordova
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
      navigator.geolocation.getCurrentPosition(onSuccess, onError);
    },
  },
};
