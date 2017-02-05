/**
 * Object that can be initialize.
 */

var util = require('util'),
    _ = require('lodash'),
    IllegalStateException = require('./exceptions/illegalStateException'),
    BaseObject = require('./baseObject')
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
 * @name InitializableObject.init~Callback
 * @type {callback}
 * @param {Error|undefined} [error] The error if occurred
 */
/**
 * @description Initialize the manager
 * @param {*} options The options to initialize the object
 * @param {function} callback The callback {@link InitializableObject.init~Callback}
 */
InitializableObject.prototype.initialize = function (options, callback) {
    var __pretty_name__ = "init";

    if (!_.isFunction(callback)) {
        callback = InitializableObject._emptyCallback;
    }

    if (!this.canInitialize()) {
        this.logger.error("[%s] Cannot initialize. State '%s' must be NotInitialized", __pretty_name__, this.currentState);
        return callback(new IllegalStateException(util.format("Invalid current state %s", this.currentState)));
    }

    var currentState = this.currentState,
        _this = this
        ;

    this.currentState = InitializableObject.States.Initializing;
    this.emit(InitializableObject.Signals.initializing);

    this._handleInitialization(options, function _finalizationDone(error) {
        if (error) {
            _this.emit(InitializableObject.Signals.initializationFailed, error);
            _this.currentState = currentState;
            return callback(error);
        }

        _this.currentState = InitializableObject.States.Initialized;
        _this.emit(InitializableObject.Signals.initializationSucceed);
        return callback();
    });
};
/**
 * @description Alias of {@link InitializableObject.initialize}
 * @param {*} options The options to initialize the object
 * @param {function} callback The callback {@link InitializableObject.init~Callback}
 */
InitializableObject.prototype.init = function (options, callback) {
    this.initialize.apply(this, arguments);
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
 * @param {*} options The options given by the initialization function
 * @param {function} callback The callback function ({@link InitializableObject.init~Callback})
 * @private
 */
InitializableObject.prototype._handleInitialization = function (options, callback) {
    return callback();
};

/**
 * @name InitializableObject.finalize~Callback
 * @type {callback}
 * @param {Error|undefined} [error] The error if occurred
 */
/**
 * @description Finalize the manager the manager
 * @param {*} [options] The options
 * @param {function} callback The callback {@link InitializableObject.finalize~Callback}
 */
InitializableObject.prototype.finalize = function (options, callback) {
    var __pretty_name__ = "finalize";

    if (arguments.length === 0) {
        callback = InitializableObject._emptyCallback;
    } else {
        callback = arguments[arguments.length - 1];
    }

    if (options === callback) {
        options = undefined;
    }

    if (!_.isFunction(callback)) {
        callback = InitializableObject._emptyCallback;
    }

    if (!this.canFinalize()) {
        this.logger.error("[%s] Cannot finalize. State must be Initialized or Ready", __pretty_name__);
        return callback(new IllegalStateException(util.format("Invalid current state %s", this.currentState)));
    }

    var currentState = this.currentState,
        _this = this
        ;

    this.currentState = InitializableObject.States.Finalizing;
    this.emit(InitializableObject.Signals.finalizing);

    this._handleFinalization(options, function _finalizationDone(error) {
        if (error) {
            _this.emit(InitializableObject.Signals.finalizationFailed, error);
            _this.currentState = currentState;
            return callback(error);
        }

        _this.currentState = InitializableObject.States.NotInitialized;
        _this.emit(InitializableObject.Signals.finalizationSucceed);
        return callback();
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
 * @param {*} options The options given in the finalization function
 * @param {function} callback The callback function ({@link InitializableObject.finalize~Callback})
 * @private
 */
InitializableObject.prototype._handleFinalization = function (options, callback) {
    return callback();
};


exports = module.exports = InitializableObject;
