/**
 * Object that can be initialize.
 */

const util = require("util"),
  exceptions = require("./exceptions"),
  _ = require('lodash'),
  Joi = require('joi'),
  BaseObject = require("./BaseObject");

/**
 * @description Generic function that is connectable.
 * @implements {BaseObject}
 * @constructor
 */
function InitializableObject() {
  if (!(this instanceof InitializableObject)) {
    return new (Function.prototype.bind.apply(InitializableObject, Array.prototype.concat.apply([null], arguments)))();
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
      return reject(new exceptions.IllegalStateException(util.format("Invalid current state %s", this.currentState)));
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
 * @typedef {Object} InitializableObject._enableObjectStateWatcher~Options
 * @property {BaseObject[]} objects The object to watch
 * @property {string} stateWaiting The state to wait
 * @property {Object|null} [nativeEngineOptions] The native options to use for {@link ObjectStateWatcher}
 * @property {string|null} [synchronizedState] The state to set when synchronized (default: Ready)
 * @property {string|null} [desynchronizedState] The state to set when desynchronized (default NotInitialized)
 */
const _enableObjectStateWatcherSchemaOptions = Joi.object().keys({
  objects: Joi.array().items(
    Joi.object().keys({
      on: Joi.func().required()
    }).unknown().required()
  ).required(),
  stateWaiting: Joi.string().required(),
  nativeEngineOptions: Joi.object().allow(null).unknown(),
  synchronizedState: Joi.string().allow(null),
  desynchronizedState: Joi.string().allow(null)
}).unknown().required();
/**
 * Call this function to enable the object state watcher
 * @param {InitializableObject._enableObjectStateWatcher~Options} options The options
 * @return {Promise} The promise function. On resolve the object state watcher is started
 */
InitializableObject.prototype._enableObjectStateWatcher = function (options) {
  const __pretty_name__ = '_enableObjectStateWatcher';

  return new Promise((resolve, reject) => {
    Joi.validate(options, _enableObjectStateWatcherSchemaOptions, (error, validatedOptions) => {
      if (error) {
        this.logger.debug("[%s] Received invalid options: %s\n%s", __pretty_name__, error.message, error.stack);
        return reject(new exceptions.IllegalArgumentException(util.format("Invalid options: %s", error.message), error));
      }

      const objectStateWatcherLib = require('./object-state-watcher');

      const internalContext = {
        instance: new objectStateWatcherLib.ObjectStateWatcher(),
        synchronizedState: validatedOptions.synchronizedState || InitializableObject.States.Ready,
        desynchronizedState: validatedOptions.desynchronizedState || InitializableObject.States.NotInitialized,
        onSynchronized: () => setImmediate(() => {
          this.logger.debug("[%s] Objects synchronized (stateWaiting=%s, newState=%s)",
            __pretty_name__, validatedOptions.stateWaiting, internalContext.synchronizedState
          );
          this.currentState = internalContext.synchronizedState;
          this._onObjectStateWatcherSynchronized();
        }),
        onDesynchronized: () => setImmediate(() => {
          this.logger.debug("[%s] Objects desynchronized (stateWaiting=%s, newState=%s)",
            __pretty_name__, validatedOptions.stateWaiting, internalContext.desynchronizedState
          );
          this.currentState = internalContext.desynchronizedState;
          this._onObjectStateWatcherDesynchronized();
        })
      };

      const watcherOptions = _.assign({}, {
        objects: options.objects,
        stateWaiting: validatedOptions.stateWaiting
      }, options.nativeEngineOptions);

      this.logger.debug("[%s] Initialize the state watcher", __pretty_name__);
      internalContext.instance.initialize(watcherOptions)
        .then(() => {
          this.logger.debug("[%s] State watcher initialized, listen events", __pretty_name__);
          internalContext.instance.on(objectStateWatcherLib.ObjectStateWatcher.Signals.synchronized, internalContext.onSynchronized);
          internalContext.instance.on(objectStateWatcherLib.ObjectStateWatcher.Signals.desynchronized, internalContext.onDesynchronized);

          return internalContext.instance.start();
        })
        .then(() => {
          this.logger.debug("[%s] State watcher started with success", __pretty_name__);
          this.properties._objectStateWatcherContext = internalContext;
          resolve();
        })
        .catch(error => {
          this.logger.error("[%s] Failed to initialize the state watcher: %s\n%s", __pretty_name__, error.message, error.stack);
          internalContext.instance.removeListener(objectStateWatcherLib.ObjectStateWatcher.Signals.synchronized, internalContext.onSynchronized);
          internalContext.instance.removeListener(objectStateWatcherLib.ObjectStateWatcher.Signals.desynchronized, internalContext.onDesynchronized);
          return reject(error);
        });
    });
  });
};

/**
 * This function is called after the object state watcher sent the signal synchronized
 */
InitializableObject.prototype._onObjectStateWatcherSynchronized = function () {

};


/**
 * This function is called after the object state watcher sent the signal desynchronized
 */
InitializableObject.prototype._onObjectStateWatcherDesynchronized = function () {

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
      return reject(new exceptions.IllegalStateException(util.format("Invalid current state %s", this.currentState)));
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
 * Override this function to change the behaviour of the finalization function
 * @see InitializableObject.finalize
 * @param {InitializableObject.finalize~Options|*} [options] The options given in the finalization function
 * @return {Promise} The promise object
 */
InitializableObject.prototype._handleFinalization = function (options) {
  const __pretty_name__ = '_handleFinalization';

  return Promise.resolve({})
    .then(() => {
      if (this.properties._objectStateWatcherContext && this.properties._objectStateWatcherContext.instance.canStop()) {
        this.logger.debug("[%s] Stop the object watcher", __pretty_name__);
        return this.properties._objectStateWatcherContext.instance.stop();
      } else {
        return Promise.resolve({});
      }
    })
    .then(() => {
      if (this.properties._objectStateWatcherContext && this.properties._objectStateWatcherContext.instance.canFinalize()) {
        this.logger.debug("[%s] Finalize the object watcher", __pretty_name__);
        return this.properties._objectStateWatcherContext.instance.finalize(options);
      } else {
        return Promise.resolve({});
      }
    })
    .then(() => {
      if (this.properties._objectStateWatcherContext) {
        delete this.properties._objectStateWatcherContext;
      }
    });
};

/**
 * Returns if the object watcher is enabled of not
 * @return {boolean} true if enabled, otherwise false
 */
InitializableObject.prototype._isObjectStateWatcherEnabled = function () {
  return _.isObjectLike(this.properties._objectStateWatcherContext);
};

exports = module.exports = InitializableObject;
