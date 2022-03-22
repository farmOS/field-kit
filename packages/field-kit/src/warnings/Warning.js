const excludeProperties = ['cause', 'message', 'name', 'stack'];

function getProperties(error, exclude = excludeProperties) {
  const names = Object.getOwnPropertyNames(error)
    .filter(name => exclude.every(exName => name !== exName));
  return names.map(n => [n, error[n]]);
}

export default class Warning extends Error {
  constructor(message, error = new Error(message), options = {}, ...rest) {
    // Note that if the constructor options contain a `cause`, it will override
    // the original error.
    super(message, { cause: error, ...options }, ...rest);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, Warning);
    }

    this.name = 'Warning';

    // Hoist any custom properties from the error and/or the provided options.
    const optionProperties = Object.keys(options);
    const exclude = excludeProperties.concat(optionProperties);
    const cause = options.cause instanceof Error ? options.cause : error;
    getProperties(cause, exclude).forEach(([key, val]) => { this[key] = val; });
  }
}
