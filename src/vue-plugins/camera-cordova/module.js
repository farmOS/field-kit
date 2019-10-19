// A Vuex module & utlities for accessing the camera via Cordova
export default {
  actions: {
    /*
    called when the get photo button is tapped; setPhotoLoc sets the captured
    image URI to a variable in the store called photo_loc
    */
    getPhotoLoc({ commit, rootState }) {
      function handleResponse(photoLoc) {
        // commit('setPhotoLoc', photoLoc);
        const prevLog = rootState.farm.logs[rootState.farm.currentLogIndex];
        const dataURL = `data:image/jpeg;base64,${photoLoc}`;
        const nowStamp = (Date.now() / 1000).toFixed(0);
        const props = {
          images: { data: prevLog.images.data.concat(dataURL), changed: nowStamp },
          isCachedLocally: false,
          wasPushedToServer: false,
        };
        commit('updateLog', { index: rootState.farm.currentLogIndex, props });
      }
      function handleError(error) { // eslint-disable-line no-unused-vars
      }
      getPhotoFromCamera() // eslint-disable-line no-use-before-define
        .then(handleResponse, handleError);
    },
    loadPhotoBlob({ commit, rootState }, file) {
      const prevLog = rootState.farm.logs[rootState.farm.currentLogIndex];
      const nowStamp = (Date.now() / 1000).toFixed(0);
      readFileData(file).then((data) => { // eslint-disable-line no-use-before-define
        const props = {
          images: { data: prevLog.images.data.concat(data), changed: nowStamp },
          isCachedLocally: false,
          wasPushedToServer: false,
        };
        commit('updateLog', { index: rootState.farm.currentLogIndex, props });
      });
    },
  },
};

/*
Utilizes the Cordova camera plugin to obtain an image URI
*/
function getPhotoFromCamera() {
  return new Promise((resolve, reject) => {
    function onSuccess(imageURI) {
      resolve(imageURI);
    }
    function onFail(message) {
      reject(message);
    }

    const options = {
      quality: 50,
      destinationType: Camera.DestinationType.DATA_URL, // eslint-disable-line no-undef
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

function readFileData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
