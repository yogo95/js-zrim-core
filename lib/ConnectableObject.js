/**
 * Base connectable object
 */


const util = require('util'),
  IllegalStateException = require('./exceptions/IllegalStateException'),
  InitializableObject = require('./InitializableObject');

/**
 * @description Generic function that is connectable.
 * @implements {InitializableObject}
 * @constructor
 */
function ConnectableObject() {
  if (!(this instanceof ConnectableObject)) {
    return new Function.prototype.bind.apply(ConnectableObject, Array.prototype.concat.apply([null], arguments))();
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
 * @description Do the connection
 * @return {Promise} The promise object
 */
ConnectableObject.prototype.connect = function () {
  return new Promise((resolve, reject) => {
    if (!this.canConnect()) {
      let exception = new IllegalStateException(util.format("Invalid state '%s'", this.currentState));
      this.emit(ConnectableObject.Signals.connectionFailed, exception);
      return reject(exception);
    }

    let currentState = this.currentState;

    this.emit(ConnectableObject.Signals.connecting);
    this.currentState = ConnectableObject.States.Connecting;

    this._handleConnection()
      .then(() => {
        this.emit(ConnectableObject.Signals.connected);
        this.emit(ConnectableObject.Signals.ready);
        this.currentState = ConnectableObject.States.Ready;
        return resolve();
      })
      .catch(error => {
        this.emit(ConnectableObject.Signals.connectionFailed, error);
        this.currentState = currentState;
        return reject(error);
      });
  });
};

/**
 * @description Handle the connection. Override this function to manage the connection
 * @return {Promise} The promise object
 */
ConnectableObject.prototype._handleConnection = function () {
  return new Promise(resolve => resolve());
};

/**
 * @description Tells if we are in a state that allows disconnection
 * @return {boolean} <code>true</code> if it can disconnect, otherwise <code>false</code>
 */
ConnectableObject.prototype.canDisconnect = function () {
  return this.isReady();
};

/**
 * @description Disconnect
 * @return {Promise} The promise object
 */
ConnectableObject.prototype.disconnect = function () {
  return new Promise((resolve, reject) => {
    if (!this.canDisconnect()) {
      let exception = new IllegalStateException(util.format("Invalid state '%s'", this.currentState));
      this.emit(ConnectableObject.Signals.disconnectionFailed, exception);
      return reject(exception);
    }

    let currentState = this.currentState;

    this.emit(ConnectableObject.Signals.disconnecting);
    this.currentState = ConnectableObject.States.Disconnecting;

    this._handleDisconnection()
      .then(() => {
        this.emit(ConnectableObject.Signals.disconnected);
        this.currentState = ConnectableObject.States.Initialized;
        return resolve();
      })
      .catch(error => {
        this.emit(ConnectableObject.Signals.disconnectionFailed, error);
        this.currentState = currentState;
        return reject(error);
      });
  });
};

/**
 * @description Handle the disconnection. Override this function to manage the disconnection
 * @return {Promise} The promise object
 */
ConnectableObject.prototype._handleDisconnection = function () {
  return new Promise(resolve => resolve());
};

/**
 * @description Override the finalization to disconnect before
 * @see BaseObject.finalize
 * @param {*} [options] The options given in the finalization function
 * @return {Promise} The promise object
 */
ConnectableObject.prototype._handleFinalization = function (options) {
  return new Promise((resolve, reject) => {
    if (this.isReady()) {
      // Disconnection
      this.disconnect()
        .then(() => {
          InitializableObject.prototype._handleFinalization.call(this, options).then(resolve).catch(reject);
        })
        .catch(reject);
    } else {
      InitializableObject.prototype._handleFinalization.call(this, options).then(resolve).catch(reject);
    }
  });
};

/**
 * @description Call this function when the connection is lost. This will change the state
 * @return {Promise} The promise object
 */
ConnectableObject.prototype._onConnectionLost = function () {
  return new Promise(resolve => {
    this.emit(ConnectableObject.Signals.connectionLost);
    this.currentState = ConnectableObject.States.Initialized;
    return resolve();
  });
};

/**
 * @description Call this function when the connection is retrieved. This will change the state
 * @return {Promise} The promise object
 */
ConnectableObject.prototype._onReconnected = function () {
  return new Promise(resolve => {
    this.emit(ConnectableObject.Signals.reconnected);
    this.currentState = ConnectableObject.States.Ready;
    return resolve();
  });
};


exports = module.exports = ConnectableObject;

