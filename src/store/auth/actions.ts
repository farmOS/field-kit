/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
// TODO: Do some typescripting conversion
import { ActionTree } from 'vuex';
import { StateInterface } from '../index';
import { AuthStateInterface } from './state';
import farm, { setHost } from '../farmClient';

const actions: ActionTree<AuthStateInterface, StateInterface> = {
  authorize({ commit }, payload): Promise<void> {
      // const url = (process.env.NODE_ENV === 'development')
      //   ? ''
      //   : `https://${payload.farmosUrl}`;
      const url = `https://${payload.farmosUrl}`
      const { username, password, router } = payload;
      const storage = window.localStorage;
      setHost(url);

      function handleLoginError(error: { status: number; data: { error_description: any; error: string; }; message: any; }) {
        if (error.status === 401) {
          const resetUrl = `${url}/user/password`;
          const err = new Error(
            `The username or password you entered was incorrect. Please try again, or <a href="${resetUrl}">reset your password</a>.`,
          );
          commit('alert', err);
        } else if (error.status === 400) {
          // Other OAuth related errors.
          let err = new Error(
            `The OAuth Password Authorization flow failed. Error message: ${error.data.error_description}`,
          );

          if (error.data.error === 'invalid_client') {
            const oauthConfigUrl = `${url}/admin/config/farm/oauth`;
            err = new Error(
              `The OAuth client for farmOS Field Kit is not enabled on your farmOS server. Enable it <a href=${oauthConfigUrl}>here</a>.`,
            );
          }
          commit('alert', err);
        } else {
          const err = new Error(
            `Unable to reach the server. Please check that you have the correct URL and that your device has a network connection. Status: ${error.message}`,
          );
          commit('alert', err);
        }
      }

      // Return a promise so the component knows when the action completes.
      return new Promise<void>((resolve) => {
        farm().authorize(username, password)
          .then((tokenResponse: string) => {
            // Save our host and token to the persistant store.
            setHost(url);
            storage.setItem('host', url);
            storage.setItem('token', JSON.stringify(tokenResponse));

            // Go back 1 page, or reroute to home page
            if (window.history.length > 1) {
              window.history.back();
              resolve();
              return;
            }
            router.push('/');
            resolve();
          })
          // TODO: Confirm and change the data type for error param
          .catch((error: { response: any; }) => {
            const err = error.response ? error.response : error;
            handleLoginError(err);
            resolve();
          });
      });
    },

    logout({ commit }) {
      // TODO: Confirm and change the data type for success param
      farm().revokeTokens().then((success: any) => {
        if (!success) {
          const errorPayload = {
            message: 'Unable to reach the server. Access tokens have been cleared locally, but were not revoked fromt the farmOS server.',
            errorCode: 'Revoke Error',
            level: 'warning',
            show: true,
          };
          commit('alert', errorPayload);
        }
      });
    },

    updateUserAndSiteInfo({ commit }, response) {
      const token = JSON.parse(localStorage.getItem('token') || '{}');
      const safeSet = (key: string, mutation: string, res: boolean | null) => {
        let value;
        if (typeof res === 'string') {
          value = res;
        }
        if (typeof res === 'object'
          || typeof res === 'number'
          || typeof res === 'boolean') {
          value = JSON.stringify(res);
        }
        // Explicit reassignment here b/c `typeof null === 'object'`.
        if (res === null) {
          value = undefined;
        }
        if (value) {
          localStorage.setItem(key, value);
          commit(mutation, res);
        }
      };
      const setResponseProps = (res: { name: boolean | null; user: { name: boolean | null; mail: boolean | null; uid: boolean | null; }; mapbox_api_key: boolean | null; system_of_measurement: boolean | null; url: any; }) => {
        safeSet('farmName', 'changeFarmName', res.name);
        safeSet('username', 'changeUsername', res.user?.name);
        safeSet('email', 'changeEmail', res.user?.mail);
        safeSet('uid', 'changeUid', res.user?.uid);
        safeSet('mapboxAPIKey', 'changeMapboxAPIKey', res.mapbox_api_key);
        safeSet('systemOfMeasurement', 'changeSystemOfMeasurement', res.system_of_measurement);
        safeSet('isLoggedIn', 'setLoginStatus', true);

        // Just add the url to store so the main menu can display it correctly,
        // but don't overwrite localStorage b/c that url needs to be set by the
        // login procedure, otherwise login breaks in the dev env.
        if (res.url) {
          commit('changeFarmUrl', res.url);
        }
        // Return the response so it's passed to successive chained actions.
        return res;
      };
      if (token) {
        farm().area.geojson().then((geojson: boolean | null) => {
          safeSet('areaGeoJSON', 'setAreaGeoJSON', geojson);
        });
        if (response) {
          return setResponseProps(response);
        }
        return farm().info().then(setResponseProps);
      }
      return null;
    },

    loadCachedUserAndSiteInfo({ commit }) {
      // Helper so we don't overwrite defaults if the key isn't in LS.
      const safeLoad = (mutation: string, key: string) => {
        let value;
        try {
          value = JSON.parse(localStorage.getItem(key) || '{}');
        } catch (e) {
          value = localStorage.getItem(key);
        }
        if (value) {
          commit(mutation, value);
        }
      };

      safeLoad('changeUsername', 'username');
      safeLoad('changeEmail', 'email');
      safeLoad('changeUid', 'uid');
      safeLoad('changeMapboxAPIKey', 'mapboxAPIKey');
      safeLoad('changeSystemOfMeasurement', 'systemOfMeasurement');
      safeLoad('setLoginStatus', 'isLoggedIn');
      safeLoad('changeFarmName', 'farmName');
      safeLoad('changeFarmUrl', 'host');
      safeLoad('setUseGeolocation', 'useGeolocation');
      safeLoad('setAreaGeoJSON', 'areaGeoJSON');
    },

    deleteCachedUserAndSiteInfo({ commit }) {
      commit('changeFarmName', '');
      commit('changeFarmUrl', '');
      commit('changeUsername', '');
      commit('changeEmail', '');
      commit('changeUid', '');
      commit('changeMapboxAPIKey', '');
      commit('changeSystemOfMeasurement', 'metric');
      commit('setLoginStatus', false);
      commit('setAreaGeoJSON', { type: 'FeatureCollection', features: [] });
      localStorage.clear();
    }
};

export default actions;
