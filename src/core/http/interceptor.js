import { evolve, reduce } from 'ramda';
import { getHost } from './remote';
import asArray from '../utils/asArray';

function evaluateResponse(response = {}, errorMsg) {
  const { status, data = {} } = response;
  const defaultValues = {
    loginRequired: false,
    reschedule: false,
    notFound: false,
    message: '',
  };
  if (status === 400 && data.error === 'invalid_grant') {
    return {
      ...defaultValues,
      loginRequired: true,
      message: `${status} error: ${data.error_description || data.error}`,
    };
  }
  if (status === 400 && data.error === 'invalid_client') {
    const oauthConfigUrl = `https://${getHost()}/admin/config/farm/oauth`;
    return {
      ...defaultValues,
      loginRequired: true,
      message: 'The OAuth client for farmOS Field Kit is not enabled on your farmOS server. '
        + `If you are an administrator, you can enable it <a href=${oauthConfigUrl}>here</a>.`,
    };
  }
  if (status === 401) {
    const resetUrl = `https://${getHost()}/user/password`;
    return {
      ...defaultValues,
      loginRequired: true,
      message: 'The username or password you entered was incorrect. '
        + `Please try again, or <a href="${resetUrl}">reset your password</a>.`,
    };
  }
  if (status === 403) {
    return {
      ...defaultValues,
      loginRequired: true,
      message: `${status} error: ${data.error_description}`,
    };
  }
  if (status === 404) {
    return {
      ...defaultValues,
      notFound: true,
    };
  }
  const description = data.error_description
    || data.error
    || errorMsg
    || response.statusText
    || '';
  const infix = description ? ': ' : '';
  const message = `${status} error${infix}${description}.`;
  if (status >= 500) {
    return {
      ...defaultValues,
      message,
      reschedule: true,
    };
  }
  // Any other 4xx status codes or other unexpected errors.
  return {
    ...defaultValues,
    message,
  };
}

function evaluate(error) {
  const { config } = error;

  let loginRequired = false;
  let requested = false;
  let responded = false;
  let reschedule = null;
  let notFound = null;
  let message = '';

  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const result = evaluateResponse(error.response, error.message);
    loginRequired = loginRequired || result.loginRequired;
    requested = true;
    responded = true;
    reschedule = result.reschedule ? config : reschedule;
    notFound = result.notFound ? config : notFound;
    message = result.message;
  } else if (error.request) {
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    // http.ClientRequest in node.js
    requested = true;
    reschedule = config;
  } else {
    // Something happened in setting up the request that triggered an Error
    message = error.message || '';
  }
  return {
    loginRequired,
    requested,
    responded,
    reschedule,
    notFound,
    alert: [message, error],
  };
}

// Alerts are evaluated as tuples, then concatenated as a map, keyed by their
// message string in order to eliminate duplicates. Empty messages are omitted.
function addAlert(tuple, map) {
  const [message, error] = tuple;
  if (message !== '') {
    map.set(message, error);
  }
  return map;
}

export default function interceptor(syncResults, handler = () => {}, overrides = {}) {
  if (syncResults.rejected.length < 1) {
    // Early return if no errors were encountered, but make sure to run the
    // handler still, with default values that indicate all successful requests.
    handler({
      loginRequired: false,
      reschedule: [],
      connectivity: 1,
      notFound: [],
      alerts: [],
    });
    return syncResults;
  }
  function concatenate(accumulator, error) {
    // Skip it and return the accumulator if it's not a valid instance of Error.
    if (!(error instanceof Error)) return accumulator;
    const overrideHandler = overrides[error.response?.status];
    if (typeof overrideHandler === 'function') {
      // If a function is provided for this error's status code, just skip it
      // and pass the error to the override handler to deal with separately.
      overrideHandler(error);
      return accumulator;
    }
    const evaluation = evaluate(error);
    const additiveTransforms = evolve({
      loginRequired: bool1 => bool2 => bool1 || bool2,
      requested: bool => num => bool + num,
      responded: bool => num => bool + num,
      reschedule: obj => arr => [...arr, ...asArray(obj)],
      notFound: obj => arr => [...arr, ...asArray(obj)],
      alert: tuple => map => addAlert(tuple, map),
    }, evaluation);
    return evolve(additiveTransforms, accumulator);
  }
  const initEvaluation = {
    loginRequired: false,
    requested: 0,
    responded: 0,
    reschedule: [],
    notFound: [],
    alert: new Map(),
  };
  const {
    loginRequired, requested, responded, reschedule, notFound, alert,
  } = reduce(concatenate, initEvaluation, syncResults.rejected);
  // As long as the number of request attempts is non-zero, a quotient can be
  // calculated by division; otherwise, no requests were made, so the network
  // status is unknown, as denoted by -1, which will be ignored by updateStatus.
  const connectivity = requested > 0 ? responded / requested : -1;
  const evaluation = {
    loginRequired,
    reschedule,
    connectivity,
    notFound,
    alerts: Array.from(alert).map(([message, error]) =>
      new Error(message, { cause: error })),
  };
  handler(evaluation);
  return syncResults;
}
