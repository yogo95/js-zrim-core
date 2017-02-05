/**
 * Base connectable object
 */


var util = require('util'),
  _ = require('lodash'),
  IllegalStateException = require('./exceptions/IllegalStateException'),
  InitializableObject = require('./InitializableObject')
  ;

/**
 * @description Generic function that is connectable.
 * @implements {InitializableObject}
 * @constructor
 */
function ConnectableObject() {
  if (!(this instanceof ConnectableObject)) {
    return new(Function.prototype.bind.apply(ConnectableObject, Array.prototype.concat.apply([null], arguments)));
  }

  InitializableObject.apply(this, arguments);
}

InitializableObject._applyPrototypeTo(ConnectableObject, {
  states: {
    Connecting: "Connecting",
    Disconnecting: "Disconnecting"
  },
  signals: {
    connecting: "connecting",
    connectionFailed: "connectionFailed",
    connected: "connected",
    connectionLost: "connectionLost",
    reconnected: "reconnected",
    disconnecting: "disconnecting",
    disconnectionFailed: "disconnectionFailed",
    disconnected: "disconnected"
  }
});

/**
 * @description Tells if we are in a state that allows connection
 * @return {boolean} <code>true</code> if it can connect, otherwise <code>false</code>
 */
ConnectableObject.prototype.canConnect = function () {
  return this.isReady() || this.currentState === ConnectableObject.States.Initialized;
};

/**
 * @typedef {callback} ConnectableObject.connect~Callback
 * @param {Error|undefined} [error] The error if occurred
 */
/**
 * @description Do the connection
 * @param {function} callback The callback ({@link ConnectableObject.connect~Callback})
 */
ConnectableObject.prototype.connect = function (callback) {
  if (!_.isFunction(callback)) {
    callback = ConnectableObject._emptyCallback;
  }

  if (!this.canConnect()) {
    var exception = new IllegalStateException(util.format("Invalid state '%s'", this.currentState));
    this.emit(ConnectableObject.Signals.connectionFailed, exception);
    return callback(exception);
  }

  var currentState = this.currentState,
    _this = this
    ;

  this.emit(ConnectableObject.Signals.connecting);
  this.currentState = ConnectableObject.States.Connecting;

  this._handleConnection(function (error) {
    if (error) {
      _this.emit(ConnectableObject.Signals.connectionFailed, error);
      _this.currentState = currentState;
      return callback(error);
    }

    _this.emit(ConnectableObject.Signals.connected);
    _this.emit(ConnectableObject.Signals.ready);
    _this.currentState = ConnectableObject.States.Ready;
    return callback();
  });
};

/**
 * @description Handle the connection. Override this function to manage the connection
 * @param {Function} callback The callback function ({@link ConnectableObject.connect~Callback})
 * @private
 */
ConnectableObject.prototype._handleConnection = function (callback) {
  return callback();
};

/**
 * @description Tells if we are in a state that allows disconnection
 * @return {boolean} <code>true</code> if it can disconnect, otherwise <code>false</code>
 */
ConnectableObject.prototype.canDisconnect = function () {
  return this.isReady();
};

/**
 * @typedef {callback} ConnectableObject.disconnect~Callback
 * @param {Error|undefined} [error] The error if occurred
 */
/**
 * @description Disconnect
 * @param {function} callback The callback ({@link ConnectableObject.disconnect~Callback})
 */
ConnectableObject.prototype.disconnect = function (callback) {
  if (!_.isFunction(callback)) {
    callback = ConnectableObject._emptyCallback;
  }

  if (!this.canDisconnect()) {
    var exception = new IllegalStateException(util.format("Invalid state '%s'", this.currentState));
    this.emit(ConnectableObject.Signals.disconnectionFailed, exception);
    return callback(exception);
  }

  var currentState = this.currentState,
    _this = this
    ;

  this.emit(ConnectableObject.Signals.disconnecting);
  this.currentState = ConnectableObject.States.Disconnecting;

  this._handleDisconnection(function (error) {
    if (error) {
      _this.emit(ConnectableObject.Signals.disconnectionFailed, error);
      _this.currentState = currentState;
      return callback(error);
    }

    _this.emit(ConnectableObject.Signals.disconnected);
    _this.currentState = ConnectableObject.States.Initialized;
    return callback();
  });
};

/**
 * @description Handle the disconnection. Override this function to manage the disconnection
 * @param {Function} callback The callback function ({@link ConnectableObject.disconnect~Callback})
 * @private
 */
ConnectableObject.prototype._handleDisconnection = function (callback) {
  return callback();
};

/**
 * @description Override the finalization to disconnect before
 * @see BaseObject.finalize
 * @param {*} options The options given in the finalization function
 * @param {function} callback The callback function ({@link BaseObject.finalize~Callback})
 * @private
 */
ConnectableObject.prototype._handleFinalization = function (options, callback) {
  if (this.isReady()) {
    // Disconnection
    this.disconnect(function (error) {
      if (error) {
        return callback(error);
      }

      InitializableObject.prototype._handleFinalization.call(this, options, callback);
    });
  } else {
    InitializableObject.prototype._handleFinalization.apply(this, arguments);
  }
};

/**
 * @typedef {Function} ConnectableObject._onConnectionLost~Callback
 */
/**
 * @description Call this function when the connection is lost. This will change the state
 * @param {Function} callback Called when the change is done ({@link ConnectableObject._onConnectionLost~Callback})
 * @private
 */
ConnectableObject.prototype._onConnectionLost = function (callback) {
  if (!_.isFunction(callback)) {
    callback = ConnectableObject._emptyCallback;
  }

  this.emit(ConnectableObject.Signals.connectionLost);
  this.currentState = ConnectableObject.States.Initialized;
  return callback();
};

/**
 * @typedef {Function} ConnectableObject._onConnectionLost~Callback
 */
/**
 * @description Call this function when the connection is retrieved. This will change the state
 * @param {Function} callback Called when the change is done ({@link ConnectableObject._onConnectionLost~Callback})
 * @private
 */
ConnectableObject.prototype._onReconnected = function (callback) {
  if (!_.isFunction(callback)) {
    callback = ConnectableObject._emptyCallback;
  }

  this.emit(ConnectableObject.Signals.reconnected);
  this.currentState = ConnectableObject.States.Ready;
  return callback();
};


exports = module.exports = ConnectableObject;

