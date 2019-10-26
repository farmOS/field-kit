// A Vuex module & utlities for accessing the camera via Cordova
export default {
  actions: {
    /*
    called when the get photo button is tapped
    */
    getPhotoFromCamera({ commit, rootState }, index) {
      function handleResponse(photoLoc) {
        const prevLog = rootState.farm.logs[index];
        const dataURL = `data:image/jpeg;base64,${photoLoc}`;
        const nowStamp = (Date.now() / 1000).toFixed(0);
        const props = {
          images: { data: prevLog.images.data.concat(dataURL), changed: nowStamp },
          isCachedLocally: false,
          wasPushedToServer: false,
        };
        commit('updateLog', { index, props });
      }
      function handleError(error) { // eslint-disable-line no-unused-vars
      }
      getPhotoFromCamera() // eslint-disable-line no-use-before-define
        .then(handleResponse, handleError);
    },
    loadPhotoBlob({ commit, rootState }, { file, index }) {
      const prevLog = rootState.farm.logs[index];
      const nowStamp = (Date.now() / 1000).toFixed(0);
      readFileData(file).then((data) => { // eslint-disable-line no-use-before-define
        const props = {
          images: { data: prevLog.images.data.concat(data), changed: nowStamp },
          isCachedLocally: false,
          wasPushedToServer: false,
        };
        commit('updateLog', { index, props });
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
