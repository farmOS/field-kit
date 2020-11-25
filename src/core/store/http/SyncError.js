export default class SyncError extends Error {
  constructor(errors, opts = {}) {
    super();

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SyncError);
    }

    this.name = 'SyncError';
    this.loginRequired = opts.loginRequired || false;
    this.data = errors;

    if (typeof errors === 'string') {
      this.message = errors;
    }

    if (Array.isArray(errors)) {
      // Concatenate the errors into a single string.
      this.message = errors.reduce((msg, { reason, localLog, message }) => {
        const status = reason.response?.status;
        const data = reason.response?.data;
        const description = data?.error_description;
        // 400, 401 and 403 errors indicate bad credentials; login is required.
        if (status >= 400
          && status <= 403) {
          this.loginRequired = true;
          return `${msg}${status} error: ${description || reason.message}<br>`;
        }
        // If the error is a 404, this means the log was deleted on the server.
        // We are keeping 404 errors silent for now.
        if (status === 404) {
          return msg;
        }
        // If there's any status code, it's some other HTTP error, probably 406 or
        // something in the 500 range. Just print it as is with the status code.
        if (status !== undefined) {
          return `${msg}${status} error: ${description || data || reason.message}.<br>`;
        }
        // If there's no status code, it's either a Network Error or runtime error.
        // Check navigator.onLine to confirm the former.
        if (!navigator.onLine) {
          return `${msg}${description || reason.message}. Check your internet connection.<br>`;
        }
        // Otherwise, it's a runtime error thrown sometime during the request
        // procedure; display the log name (if available) along with the error message
        // so we can debug.
        return localLog
          ? `${msg}Error while syncing "${localLog.name}": ${message || description || data || reason.message}<br>`
          : `${msg}Error while syncing: ${description || data || reason.message}<br>`;
      }, '');
    }
  }
}
