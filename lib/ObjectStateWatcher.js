const RunnableObject = require('./RunnableObject'),
  BaseObject = require('./BaseObject'),
  exceptions = require('./exceptions'),
  _ = require('lodash'),
  util = require('util'),
  Joi = require('joi');

/**
 * Help to observe state in objects.
 * This could help to change state of an object with dependencies.
 *
 * The object emit 'synchronized' when all objects are synchronized.
 * The object emit 'desynchronized' when all objects are not synchronized.
 *
 * @implements {RunnableObject}
 * @constructor
 */
function ObjectStateWatcher() {
  if (!(this instanceof ObjectStateWatcher)) {
    return new (Function.prototype.bind.apply(ObjectStateWatcher, Array.prototype.concat.apply([null], arguments)))();
  }

  RunnableObject.apply(this, arguments);
}

RunnableObject._applyPrototypeTo(ObjectStateWatcher, {
  signals: {
    synchronized: "synchronized",
    desynchronized: "desynchronized"
  }
});

/**
 * @inheritDoc
 */
ObjectStateWatcher.prototype._initFromConstructor = function (options) {
  RunnableObject.prototype._initFromConstructor.apply(this, arguments);

  this.properties.objectDescriptions = [];
  this.properties.stateWaiting = "Ready";
  this.properties.synchronized = false;
};

/**
 * Help to know if the objects are synchronized
 * @return {boolean} true if the objects are synchronized, otherwise false
 */
ObjectStateWatcher.prototype.isSynchronized = function () {
  return this.properties.synchronized;
};

const _handleInitializationOptionsSchema = Joi.object().keys({
  objects: Joi.array().items(Joi.object().type(BaseObject)).required(),
  stateWaiting: Joi.string().trim().min(1).required()
}).unknown().required();
/**
 * @typedef {Object} ObjectStateWatcher._handleInitialization~Options
 * @property {BaseObject[]} objects The object to watch
 * @property {string} stateWaiting The state to wait
 */
/**
 * @inheritDoc
 * @see ObjectStateWatcher._handleInitialization~Options
 */
ObjectStateWatcher.prototype._handleInitialization = function (options) {
  const __pretty_name__ = "_handleInitialization";

  return new Promise((resolve, reject) => {
    RunnableObject.prototype._handleInitialization.apply(this, arguments)
      .then(() => {
        Joi.validate(options, _handleInitializationOptionsSchema, error => {
          if (error) {
            this.logger.debug("[%s] Received invalid options: %s\n%s", __pretty_name__, error.message, error.stack);
            return setImmediate(reject, new exceptions.IllegalArgumentException("Invalid options: %s", error.message), error);
          }

          this.properties = _.assign(this.properties, {
            objectDescriptions: _.map(options.objects, (obj, index) => {
              return {
                object: obj,
                state: undefined,
                handler: this._createStateChangedHandler(index)
              };
            }),
            stateWaiting: options.stateWaiting
          });
          setImmediate(resolve);
        });
      })
      .catch(reject);
  });
};

/**
 * Create the handler for the stateChanged event
 * @param {number} index The object index in the internal list
 * @return {Function} The handler
 * @throws {Error} If the creation failed
 */
ObjectStateWatcher.prototype._createStateChangedHandler = function (index) {
  if (!_.isNumber(index) || index < 0) {
    throw new exceptions.IllegalArgumentException(util.format("Invalid index value"));
  }

  return this._stateChangedHandler.bind(this, index);
};

/**
 * Handle stateChanged event from an object.
 * @param {number} index The object index
 * @param {string} newState The new state
 */
ObjectStateWatcher.prototype._stateChangedHandler = function (index, newState) {
  this.properties.objectDescriptions[index].state = newState;
  setImmediate(() => this._updateSynchronizedState());
};

/**
 * Update the internal state for synchronized
 * @private
 */
ObjectStateWatcher.prototype._updateSynchronizedState = function () {
  const __pretty_name__ = "_updateSynchronizedState";

  // Determine the new state
  const counters = _.countBy(this.properties.objectDescriptions, 'state');
  this.logger.debug("[%s] Counter return : %j", __pretty_name__, counters);
  const synchronized = counters[this.properties.stateWaiting] === this.properties.objectDescriptions.length;

  // Check if the value changed
  if (synchronized === this.properties.synchronized) {
    // No change
    return;
  }

  this.properties.synchronized = synchronized;
  this.emit(synchronized ? ObjectStateWatcher.Signals.synchronized : ObjectStateWatcher.Signals.desynchronized);
};

/**
 * @inheritDoc
 */
ObjectStateWatcher.prototype._handleStart = function () {
  const __pretty_name__ = "_handleStart";

  return new Promise(resolve => {
    // Start listening on all objects

    _.each(this.properties.objectDescriptions, description => {
      description.object.on(BaseObject.Signals.currentStateChanged, description.handler);
      description.state = description.object.currentState;
    });

    setImmediate(resolve);
    setImmediate(() => this._updateSynchronizedState());
  });
};

/**
 * @inheritDoc
 */
ObjectStateWatcher.prototype._handlePause = function () {
  const __pretty_name__ = "_handlePause";

  return new Promise(resolve => {
    _.each(this.properties.objectDescriptions, description => {
      description.object.removeListener(BaseObject.Signals.currentStateChanged, description.handler);
    });

    setImmediate(resolve);
  });
};

/**
 * @inheritDoc
 */
ObjectStateWatcher.prototype._handleResume = function () {
  return this._handleStart();
};

/**
 * @inheritDoc
 */
ObjectStateWatcher.prototype._handleStop = function () {
  const __pretty_name__ = "_handleStop";

  return new Promise((resolve, reject) => {
    _.each(this.properties.objectDescriptions, description => {
      description.object.removeListener(BaseObject.Signals.currentStateChanged, description.handler);
    });

    setImmediate(resolve);
  });
};



exports = module.exports = ObjectStateWatcher;
