/**
 * Base loadable object
 */


const util = require('util'),
  IllegalStateException = require('./exceptions/IllegalStateException'),
  InitializableObject = require('./InitializableObject');

/**
 * @description Generic function that is loadable.
 * @implements {InitializableObject}
 * @constructor
 */
function LoadableObject() {
  if (!(this instanceof LoadableObject)) {
    return new(Function.prototype.bind.apply(LoadableObject, Array.prototype.concat.apply([null], arguments)));
  }

  InitializableObject.apply(this, arguments);
}

InitializableObject._applyPrototypeTo(LoadableObject, {
  states: {
    Loading: "Loading",
    UnLoading: "UnLoading"
  },
  signals: {
    loading: "loading",
    loadFailed: "loadFailed",
    loaded: "loaded",
    unLoading: "unLoading",
    unLoadFailed: "unLoadFailed",
    unLoaded: "unLoaded"
  }
});

/**
 * @description Tells if we are in a state that allows load
 * @return {boolean} <code>true</code> if it can load, otherwise <code>false</code>
 */
LoadableObject.prototype.canLoad = function () {
  return this.isReady() || this.currentState === LoadableObject.States.Initialized;
};

/**
 * @description Do the loading
 * @return {Promise} The promise object
 */
LoadableObject.prototype.load = function () {
  return new Promise((resolve, reject) => {
    if (!this.canLoad()) {
      let exception = new IllegalStateException(util.format("Invalid state '%s'", this.currentState));
      this.emit(LoadableObject.Signals.loadFailed, exception);
      return reject(exception);
    }

    let currentState = this.currentState;

    this.emit(LoadableObject.Signals.loading);
    this.currentState = LoadableObject.States.Loading;

    this._handleLoad()
      .then(() => {
        this.emit(LoadableObject.Signals.loaded);
        this.emit(LoadableObject.Signals.ready);
        this.currentState = LoadableObject.States.Ready;
        return resolve();
      })
      .catch(error => {
        this.emit(LoadableObject.Signals.loadFailed, error);
        this.currentState = currentState;
        return reject(error);
      });
  });
};

/**
 * @description Handle the connection. Override this function to manage the load
 * @return {Promise} The promise object
 */
LoadableObject.prototype._handleLoad = function () {
  return new Promise(resolve => resolve());
};

/**
 * @description Tells if we are in a state that allows unloading
 * @return {boolean} <code>true</code> if it can unLoad, otherwise <code>false</code>
 */
LoadableObject.prototype.canUnLoad = function () {
  return this.isReady();
};

/**
 * @description Disconnect
 * @return {Promise} The promise object
 */
LoadableObject.prototype.unLoad = function () {
  return new Promise((resolve, reject) => {
    if (!this.canUnLoad()) {
      let exception = new IllegalStateException(util.format("Invalid state '%s'", this.currentState));
      this.emit(LoadableObject.Signals.unLoadFailed, exception);
      return reject(exception);
    }

    let currentState = this.currentState;

    this.emit(LoadableObject.Signals.unLoading);
    this.currentState = LoadableObject.States.UnLoading;

    this._handleUnLoad()
      .then(() => {
        this.emit(LoadableObject.Signals.unLoaded);
        this.currentState = LoadableObject.States.Initialized;
        return resolve();
      })
      .catch(error => {
        this.emit(LoadableObject.Signals.unLoadFailed, error);
        this.currentState = currentState;
        return reject(error);
      });
  });
};

/**
 * @description Handle the disconnection. Override this function to manage the disconnection
 * @return {Promise} The promise object
 */
LoadableObject.prototype._handleUnLoad = function () {
  return new Promise(resolve => resolve());
};

/**
 * @description Override the finalization to unLoad before
 * @see BaseObject.finalize
 * @param {*} [options] The options given in the finalization function
 * @return {Promise} The promise object
 */
LoadableObject.prototype._handleFinalization = function (options) {
  return new Promise((resolve, reject) => {
    if (this.isReady()) {
      // Disconnection
      this.unLoad()
        .then(() => {
          InitializableObject.prototype._handleFinalization.call(this, options).then(resolve).catch(reject);
        })
        .catch(reject);
    } else {
      InitializableObject.prototype._handleFinalization.call(this, options).then(resolve).catch(reject);
    }
  });
};

exports = module.exports = LoadableObject;

