/**
 * Object that can be initialize.
 */

const util = require("util"),
  IllegalStateException = require("./exceptions/IllegalStateException"),
  BaseObject = require("./BaseObject");

/**
 * @description Generic function that is connectable.
 * @implements {BaseObject}
 * @constructor
 */
function InitializableObject() {
  if (!(this instanceof InitializableObject)) {
    return new(Function.prototype.bind.apply(InitializableObject, Array.prototype.concat.apply([null], arguments)));
  }

  BaseObject.apply(this, arguments);
  this.properties.currentState = InitializableObject.States.NotInitialized;
  this.properties._initialized = false; // Help to know if the object is initialized or not
}

BaseObject._applyPrototypeTo(InitializableObject, {
  states: {
    NotInitialized: "NotInitialized",
    Initializing: "Initializing",
    Initialized: "Initialized",
    Finalizing: "Finalizing"
  },
  signals: {
    initializing: "initializing",
    initializationSucceed: "initializationSucceed",
    initializationFailed: "initializationFailed",
    finalizing: "finalizing",
    finalizationSucceed: "finalizationSucceed",
    finalizationFailed: "finalizationFailed"
  }
});

/**
 * The base options for initialization
 * @typedef {Object} InitializableObject.initialize~Options
 */
/**
 * @description Initialize the manager
 * @param {InitializableObject.initialize~Options|*} [options] The options to initialize the object
 * @return {Promise} The promise object
 */
InitializableObject.prototype.initialize = function (options) {
  const __pretty_name__ = "init";

  return new Promise((resolve, reject) => {
    if (!this.canInitialize()) {
      this.logger.error("[%s] Cannot initialize. State '%s' must be NotInitialized", __pretty_name__, this.currentState);
      return reject(new IllegalStateException(util.format("Invalid current state %s", this.currentState)));
    }

    let currentState = this.currentState;

    this.currentState = InitializableObject.States.Initializing;
    this.emit(InitializableObject.Signals.initializing);
    this._handleInitialization(options)
      .then(() => {
        this.currentState = InitializableObject.States.Initialized;
        this.emit(InitializableObject.Signals.initializationSucceed);
        this.properties._initialized = true;
        return resolve();
      })
      .catch(error => {
        this.emit(InitializableObject.Signals.initializationFailed, error);
        this.currentState = currentState;
        return reject(error);
      });
  });
};
/**
 * @description Alias of {@link InitializableObject.initialize}
 * @param {InitializableObject.initialize~Options|*} options The options to initialize the object
 * @return {Promise} The promise object
 */
InitializableObject.prototype.init = function (options) {
  return this.initialize.apply(this, arguments);
};

/**
 * Help to know if the object is initialized or not
 * @return {boolean} true if initialized, otherwise false
 */
InitializableObject.prototype.isInitialized = function () {
  return this.properties._initialized;
};

/**
 * @description Help to know if we can initialize of or
 * @return {boolean} <code>true</code> if we can initalize, otherwise <code>false</code>
 */
InitializableObject.prototype.canInitialize = function () {
  return this.currentState === InitializableObject.States.NotInitialized;
};

/**
 * @description Override this function to change the behaviour of the initialization
 * @see InitializableObject.init
 * @param {InitializableObject.initialize~Options|*} [options] The options given by the initialization function
 * @return {Promise} The promise
 */
InitializableObject.prototype._handleInitialization = function (options) {
  return new Promise(resolve => resolve());
};

/**
 * Options given to the finalization
 * @typedef {Object} InitializableObject.finalize~Options
 */
/**
 * @description Finalize the manager the manager
 * @param {InitializableObject.finalize~Options|*} [options] The options
 * @return {Promise} The promise function
 */
InitializableObject.prototype.finalize = function (options) {
  const __pretty_name__ = "finalize";

  return new Promise((resolve, reject) => {
    if (!this.canFinalize()) {
      this.logger.error("[%s] Cannot finalize. State must be Initialized or Ready", __pretty_name__);
      return reject(new IllegalStateException(util.format("Invalid current state %s", this.currentState)));
    }

    let currentState = this.currentState;
    this.currentState = InitializableObject.States.Finalizing;
    this.emit(InitializableObject.Signals.finalizing);

    this._handleFinalization(options)
      .then(() => {
        this.currentState = InitializableObject.States.NotInitialized;
        this.emit(InitializableObject.Signals.finalizationSucceed);
        this.properties._initialized = false;
        return resolve();
      })
      .catch(error => {
        this.emit(InitializableObject.Signals.finalizationFailed, error);
        this.currentState = currentState;
        return reject(error);
      });
  });
};

/**
 * @description Help to know if we can finalize the object or not
 * @return {boolean} <code>true</code> if we can finalize, otherwise <code>false</code>
 */
InitializableObject.prototype.canFinalize = function () {
  return this.currentState === InitializableObject.States.Initialized || this.currentState === InitializableObject.States.Ready;
};

/**
 * @description Override this function to change the behaviour of the finalization function
 * @see InitializableObject.finalize
 * @param {InitializableObject.finalize~Options|*} [options] The options given in the finalization function
 * @return {Promise} The promise object
 */
InitializableObject.prototype._handleFinalization = function (options) {
  return new Promise(resolve => resolve());
};


exports = module.exports = InitializableObject;
