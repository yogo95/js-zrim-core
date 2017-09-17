/**
 * This class is used to wait object to be ready
 */

const BaseObject = require("./BaseObject")
;

const _ = require("lodash"),
  util = require("util"),
  uuid = require("uuid/v4")
;

/**
 * The default timeout in milliseconds
 * @type {number}
 */
const DEFAULT_WAIT_TIMEOUT_MS = 5000;

/**
 * A object that wait every object is ready
 * @implements {BaseObject}
 * @constructor
 */
function ObjectStateWaiter() {
  if (!(this instanceof ObjectStateWaiter)) {
    return new Function.prototype.bind.apply(ObjectStateWaiter, Array.prototype.concat.apply([null], arguments))();
  }

  BaseObject.apply(this, arguments);

  this.properties.timeout = DEFAULT_WAIT_TIMEOUT_MS;

  // The object to watch
  this.properties.watchContainers = [];

  // The sate waiting
  this.properties.stateToWait = undefined;
}

BaseObject._applyPrototypeTo(ObjectStateWaiter);

/**
 * Append a object to watch. This won't change the current wait
 * @param {BaseObject|BaseObject[]} obj The object to watch
 * @return {ObjectStateWaiter} itself
 */
ObjectStateWaiter.prototype.watch = function (obj) {
  const __pretty_name__ = "watch";

  const _this = this;
  _.each(arguments, function (arg, index) {
    if (_.isArray(arg)) {
      _.each(arg, function (el, arrayIndex) {
        if (el instanceof BaseObject) {
          _this._watch(el);
        } else {
          _this.logger.warn("[%s][Arg:%s][Idx:%d] Invalid object type '%s'", __pretty_name__, index, arrayIndex, typeof el);
        }
      });
    } else if (obj instanceof BaseObject) {
      _this._watch(arg);
    } else {
      _this.logger.warn("[%s][Arg:%s] Invalid object type '%s'", __pretty_name__, index, typeof arg);
    }
  });

  return this;
};

/**
 * Append a object to watch. This won't change the current wait
 * @param {EventEmitter|BaseObject} obj The object to watch
 * @return {ObjectStateWaiter} itself
 */
ObjectStateWaiter.prototype._watch = function (obj) {
  const __pretty_name__ = "_watch";

  if (!(obj instanceof BaseObject)) {
    this.logger.warn("[%s] The object must be an instance of BaseObject", __pretty_name__, typeof obj);
    return this;
  }

  let watchContainer = {
    id: uuid(),
    object: obj
  };

  this.logger.debug("[%s] Add new watch container with the identifier %s", __pretty_name__, watchContainer.id);
  this.properties.watchContainers.push(watchContainer);
  return this;
};

/**
 * Set the timeout value. This won't change the timeout value if it's waiting
 * @param {Number|undefined} [ms] The timeout in milliseconds or undefined to use the default one
 * @return {ObjectStateWaiter} itself
 */
ObjectStateWaiter.prototype.timeout = function (ms) {
  if (_.isNumber(ms) && ms > 0) {
    this.properties.timeout = ms;
  } else if (_.isNil(ms)) {
    this.properties.timeout = DEFAULT_WAIT_TIMEOUT_MS;
  }

  return this;
};

/**
 * Returns the timeout in milliseconds configured
 * @return {Number} The timeout configured
 */
ObjectStateWaiter.prototype.getTimeout = function () {
  return this.properties.timeout;
};

/**
 * Set the state to wait.
 * @param {string|undefined} [stateName] The state name to wait
 * @return {ObjectStateWaiter} itself
 */
ObjectStateWaiter.prototype.stateName = function (stateName) {
  if (_.isString(stateName) && stateName.length > 0) {
    this.properties.stateName = stateName;
  } else if (_.isNil(stateName)) {
    this.properties.stateName = undefined;
  }

  return this;
};

/**
 * Returns the state name to wait configured configured
 * @return {string|undefined} The state name configured
 */
ObjectStateWaiter.prototype.getStateName = function () {
  return this.properties.stateName;
};

/**
 * Wait until the object are ready or the timeout reach
 * @return {Promise} The promise object
 */
ObjectStateWaiter.prototype.wait = function () {
  const __pretty_name__ = "watch";

  const _this = this;
  return new Promise((resolve, reject) => {

    let watchContainers = _.concat([], this.properties.watchContainers),
      stateNameWaiting = this.getStateName(),
      timeoutTimerId = undefined,
      timeoutMs = this.getTimeout()
    ;
    if (watchContainers.length === 0) {
      this.logger.debug("[%s] Nothing to wait for", __pretty_name__);
      return resolve();
    }

    /**
     * Remove all listener
     * @private
     */
    function _removeListeners() {
      _.each(watchContainers, watchContainer => {
        _this.logger.debug("[%s][id:%s] Remove listeners", __pretty_name__, watchContainer.id);
        watchContainer.object.removeListener(BaseObject.Signals.currentStateChanged, watchContainer.watchSignalCurrentStateChanged);
      });
    }

    /**
     * Handle the timeout
     * @private
     */
    function _timeoutHandler() {
      _this.logger.error("[%s] Timeout after %d ms", __pretty_name__, timeoutMs);
      _removeListeners();

      // Create the report
      let reportLine = _.map(watchContainers, function (watchContainer) {
        return util.format("[id:%s] currentState=%s ready=%s", watchContainer.id, watchContainer.object.currentState, watchContainer.object.isReady());
      });

      let error = new Error(util.format("Timeout after %d ms.\nReport:%s\n", timeoutMs, _.join(reportLine, "\n")));
      reject(error);
    }

    /**
     * Use to refresh the current state
     * @private
     */
    function _refreshCurrentState() {
      let counter = _.countBy(watchContainers, 'object.currentState');
      _this.logger.debug("[%s] Counter return : %j", __pretty_name__, counter);
      if (counter[stateNameWaiting] === watchContainers.length) {
        _this.logger.debug("[%s] Everything %s", __pretty_name__, stateNameWaiting);
        setImmediate(_handleAllReady);
      }
    }

    /**
     * Handle the batch that everything is ready
     * @private
     */
    function _handleAllReady() {
      _this.logger.debug("[%s] Clear the timer", __pretty_name__);
      clearTimeout(timeoutTimerId);

      _this.logger.debug("[%s] Call the internal callback to indicate it's ready", __pretty_name__);
      resolve();
    }

    this.logger.debug("[%s] Start creating listener for containers", __pretty_name__);
    _.each(watchContainers, watchContainer => {
      this.logger.debug("[%s][id:%s] Create lister for currentStateChanged", __pretty_name__, watchContainer.id);

      watchContainer.watchSignalCurrentStateChanged = function (newState, previousState) {
        _this.logger.debug("[on:currentStateChanged][id:%s] Current state changed from %s to %s", watchContainer.id, newState, previousState);
        if (watchContainer.object.currentState === stateNameWaiting) {
          _this.logger.debug("[on:currentStateChanged][id:%s] is %s", watchContainer.id, newState, previousState, stateNameWaiting);
          setImmediate(_refreshCurrentState);
        }
      };

      watchContainer.object.on(BaseObject.Signals.currentStateChanged, watchContainer.watchSignalCurrentStateChanged);
    });


    this.logger.debug("[%s] Start timer of %d ms", __pretty_name__, timeoutMs);
    timeoutTimerId = setTimeout(_timeoutHandler, timeoutMs);

    this.logger.debug("[%s] Force to refresh the current state", __pretty_name__);
    setImmediate(_refreshCurrentState);
  });
};


exports = module.exports = ObjectStateWaiter;
