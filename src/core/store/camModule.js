// A Vuex module & utlities for accessing the camera via Cordova
export default {
  actions: {
    /*
    called when the get photo button is tapped
    */
    getPhotoFromCamera({ dispatch, rootState }, index) {
      function handleResponse(photoLoc) {
        const prevLog = rootState.farm.logs[index];
        const dataURL = `data:image/jpeg;base64,${photoLoc}`;
        const props = {
          images: prevLog.images.data.concat(dataURL),
          isCachedLocally: false,
          wasPushedToServer: false,
        };
        dispatch('updateLog', { index, props });
      }
      function handleError(error) { // eslint-disable-line no-unused-vars
      }
      getPhotoFromCamera() // eslint-disable-line no-use-before-define
        .then(handleResponse, handleError);
    },
    loadPhotoBlob({ dispatch, rootState }, { file, index }) {
      const prevLog = rootState.farm.logs[index];
      readFileData(file).then((data) => { // eslint-disable-line no-use-before-define
        const props = {
          images: prevLog.images.data.concat(data),
          isCachedLocally: false,
          wasPushedToServer: false,
        };
        dispatch('updateLog', { index, props });
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

function readFileData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
