// A Vuex module & utlities for accessing the camera via Cordova
export default {
  actions: {
    /*
    called when the get photo button is tapped; setPhotoLoc sets the captured
    image URI to a variable in the store called photo_loc
    */
    getPhotoLoc({ commit }) {
      function handleResponse(photoLoc) {
        commit('setStatusText', `Took the following photo: ${photoLoc}`);
        commit('setPhotoLoc', photoLoc);
      }
      function handleError(error) {
        commit('setStatusText', `Error capturing photo: ${error}`);
      }
      getPhotoFromCamera() // eslint-disable-line no-use-before-define
        .then(handleResponse, handleError);
    },
  },
};

/*
Utilizes the Cordova camera plugin to obtain an image URI
*/
function getPhotoFromCamera() {
  return new Promise((resolve, reject) => {
    console.log('GETTING IMAGE FROM CAMERA');

    function onSuccess(imageURI) {
      console.log(`RETRIEVED THE FOLLOWING IMAGE: ${imageURI}`);
      resolve(imageURI);
    }
    function onFail(message) {
      console.log(`FAILED TO RETRIEVE IMAGE BECAUSE: ${message}`);
      reject(message);
    }

    const options = {
      quality: 50,
      destinationType: Camera.DestinationType.FILE_URI, // eslint-disable-line no-undef
    };
    navigator.camera.getPicture(onSuccess, onFail, options);
  });
}

/*
Turns an image URI into a base64 encoded file
Thanks to ourCodeWorld https://ourcodeworld.com/articles/read/80/how-to-convert-a-image-from-the-device-to-base64-with-javascript-in-cordova
*/
/*
TODO: This might need to be moved to logFactory.js when the time comes, or deleted.
It was only being used by formatState, which I removed after replacing it with logfactory
for formatting logs prior to sending them to the server. This may need to be replaced
too, since I don't think Alex ever got it to work, but it could be useful for reference
and could even gain new life if it turns out the problem was on the server-end, not here.
*/
function getFileContentAsBase64(path, callback) { // eslint-disable-line no-unused-vars
  function fail() {
    console.log('Cannot find requested file');
  }

  function gotFile(fileEntry) {
    fileEntry.file((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const content = this.result;
        callback(content);
      };
      // The most important point, use the readAsDatURL Method from the file plugin
      reader.readAsDataURL(file);
    });
  }

  window.resolveLocalFileSystemURL(path, gotFile, fail);
}
