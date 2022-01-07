import { authErrorMessage } from './auth';

export default class SyncError extends Error {
  constructor(results, opts = {}) {
    super();

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SyncError);
    }

    const defaultMsg = 'Encountered an error while syncing with a remote farmOS instance.';

    this.name = 'SyncError';
    this.loginRequired = opts.loginRequired || false;
    this.message = opts.message || defaultMsg;
    this.data = results.data || [];
    this.fulfilled = results.fulfilled || [];
    this.rejected = results.rejected || [];

    if (typeof results === 'string') {
      this.message = results;
    }

    if (Array.isArray(results.rejected)) {
      // Concatenate the errors into a single string.
      this.message = opts.message || results.rejected.reduce((message, reason) => {
        const { config, data, status } = reason.response || {};
        // 400, 401 and 403 errors indicate bad credentials; login is required.
        if (status >= 400 && status <= 403) {
          // Early return so we don't repeat login error messages, unless it's a
          // 403 which could have multiple causes.
          if (this.loginRequired === true && status !== 403) return message;
          this.loginRequired = true;
          return `${message}${authErrorMessage(reason.response)}.<br>`;
        }
        // If the error is a 404, this means the log was deleted on the server.
        // We are keeping 404 errors silent for now.
        if (status === 404) {
          return message;
        }
        // If there's any status code, it's some other HTTP error, probably 406 or
        // something in the 500 range. Just print it as is with the status code.
        if (status !== undefined) {
          return `${message}${status} error: ${data || reason.message}.<br>`;
        }
        // If there's no status code, it's either a Network Error or runtime error.
        // Check navigator.onLine to confirm the former.
        if (!navigator.onLine) {
          return `${message}${reason.message}. Check your internet connection.<br>`;
        }
        // Otherwise, it's a runtime error thrown sometime during the request
        // procedure; display the entity name (if available) along with the error message
        // so we can debug.
        const name = config.data?.attributes?.name ? ` "${config.data.attributes.name}"` : '';
        const submessage = typeof data === 'string' ? data : reason.message;
        return `${message}Error while syncing${name}${submessage && `: ${submessage}`}.<br>`;
      }, '');
    }
  }
}
