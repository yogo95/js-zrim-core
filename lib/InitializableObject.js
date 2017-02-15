/**
 * Object that can be initialize.
 */

const util = require("util"),
  _ = require("lodash"),
  IllegalStateException = require("./exceptions/IllegalStateException"),
  BaseObject = require("./BaseObject")
  ;

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
 * @description Initialize the manager
 * @param {*} [options] The options to initialize the object
 * @return {Promise} The promise object
 */
InitializableObject.prototype.initialize = function (options) {
  const __pretty_name__ = "init";

  const _this = this;
  return new Promise((resolve, reject) => {
    if (!_this.canInitialize()) {
      _this.logger.error("[%s] Cannot initialize. State '%s' must be NotInitialized", __pretty_name__, _this.currentState);
      return reject(new IllegalStateException(util.format("Invalid current state %s", _this.currentState)));
    }

    let currentState = this.currentState;

    _this.currentState = InitializableObject.States.Initializing;
    _this.emit(InitializableObject.Signals.initializing);
    _this._handleInitialization(options)
      .then(() => {
        _this.currentState = InitializableObject.States.Initialized;
        _this.emit(InitializableObject.Signals.initializationSucceed);
        return resolve();
      })
      .catch(error => {
        _this.emit(InitializableObject.Signals.initializationFailed, error);
        _this.currentState = currentState;
        return reject(error);
      });
  });
};
/**
 * @description Alias of {@link InitializableObject.initialize}
 * @param {*} options The options to initialize the object
 * @return {Promise} The promise object
 */
InitializableObject.prototype.init = function (options) {
  return this.initialize.apply(this, arguments);
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
 * @param {*} [options] The options given by the initialization function
 * @return {Promise} The promise
 */
InitializableObject.prototype._handleInitialization = function (options) {
  return new Promise(resolve => resolve());
};

/**
 * @description Finalize the manager the manager
 * @param {*} [options] The options
 * @return {Promise} The promise function
 */
InitializableObject.prototype.finalize = function (options) {
  const __pretty_name__ = "finalize";

  const _this = this;
  return new Promise((resolve, reject) => {
    if (!_this.canFinalize()) {
      _this.logger.error("[%s] Cannot finalize. State must be Initialized or Ready", __pretty_name__);
      return reject(new IllegalStateException(util.format("Invalid current state %s", _this.currentState)));
    }

    let currentState = this.currentState;
    _this.currentState = InitializableObject.States.Finalizing;
    _this.emit(InitializableObject.Signals.finalizing);

    _this._handleFinalization(options)
      .then(() => {
        _this.currentState = InitializableObject.States.NotInitialized;
        _this.emit(InitializableObject.Signals.finalizationSucceed);
        return resolve();
      })
      .catch(error => {
        _this.emit(InitializableObject.Signals.finalizationFailed, error);
        _this.currentState = currentState;
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
 * @param {*} [options] The options given in the finalization function
 * @return {Promise} The promise object
 */
InitializableObject.prototype._handleFinalization = function (options) {
  return new Promise(resolve => resolve());
};


exports = module.exports = InitializableObject;
