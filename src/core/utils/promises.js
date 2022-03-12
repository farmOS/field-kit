export function PromiseQueue(init) {
  this.init = Promise.resolve().then(init);
  this.pending = this.init;
  this.push = (next) => {
    const promise = this.pending.then(next);
    this.pending = promise;
    return promise;
  };
}

export function PromisePool(cb, timeout) {
  const pushMany = (...args) => this.pool.push(args);
  this.complete = false;
  this.pool = [];
  this.push = cb.length > 1 ? pushMany : this.pool.push;
  this.promise = new Promise((resolve, reject) => {
    setTimeout(() => {
      cb(this.pool).then(resolve).catch(reject);
      this.complete = true;
    }, timeout);
  });
}

export const pool = (cb, timeout) => {
  let _pool = new PromisePool(cb, timeout);
  return (args) => {
    if (_pool.complete) {
      _pool = new PromisePool(cb, timeout);
    }
    _pool.push(args);
    return _pool;
  };
};
