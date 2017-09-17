/**
 * Base Runnable object
 */

const util = require('util'),
  _ = require("lodash"),
  IllegalStateException = require('./exceptions/IllegalStateException'),
  OperationNotPermittedException = require('./exceptions/OperationNotPermittedException'),
  InitializableObject = require('./InitializableObject');

/**
 * @description Generic function that is connectable.
 * @implements {InitializableObject}
 * @constructor
 */
function RunnableObject() {
  if (!(this instanceof RunnableObject)) {
    return new (Function.prototype.bind.apply(RunnableObject, Array.prototype.concat.apply([null], arguments)))();
  }

  InitializableObject.apply(this, arguments);
}

InitializableObject._applyPrototypeTo(RunnableObject, {
  states: {
    Starting: "Starting",
    Running: "Running",
    Pausing: "Pausing",
    Paused: "Paused",
    Resuming: "Resuming",
    Stopping: "Stopping",
    Finishing: "Finishing"
  },
  signals: {
    starting: "starting",
    startFailed: "startFailed",
    started: "started",
    paused: "paused",
    pausing: "pausing",
    pauseFailed: "pauseFailed",
    resuming: "resuming",
    resumed: "resumed",
    resumeFailed: "resumeFailed",
    stopping: "stopping",
    stopFailed: "stopFailed",
    stopped: "stopped",
    finished: "finished",
    finishedWithError: "finishedWithError"
  }
});

/**
 * Check if the object can be paused
 * @return {boolean} true if the object can be paused, otherwise false
 */
RunnableObject.prototype.canPause = function () {
  return true;
};

/**
 * Start the process. If the current state is not ready, the action will failed.
 * @see RunnableObject._handleStart
 * @return {Promise} The promise object
 */
RunnableObject.prototype.start = function () {
  const __pretty_name__ = "start";

  return new Promise((resolve, reject) => {
    if (this.currentState !== RunnableObject.States.Ready) {
      this.logger.debug("[%s] Cannot start with the current state %s", __pretty_name__, this.currentState);
      reject(new IllegalStateException(util.format("Start is not permitted with state %s", this.currentState)));
    } else {
      this.logger.debug("[%s] Ask to handle start", __pretty_name__);
      this.currentState = RunnableObject.States.Starting;
      this.emit(RunnableObject.Signals.starting);
      this._handleStart()
        .then(() => {
          this.logger.debug("[%s] Start succeed", __pretty_name__);
          this.currentState = RunnableObject.States.Running;
          this.emit(RunnableObject.Signals.started);
          resolve();
        })
        .catch(error => {
          this.logger.error("[%s] Handler reported error : %s\n%s", __pretty_name__, error.message, error.stack);
          this.emit(RunnableObject.Signals.startFailed, error);
          this.currentState = RunnableObject.States.Ready;
          reject(error);
        });
    }
  });
};

/**
 * Override this function to handle the start action.
 * Returning error will failed the start process and set the current state to the previous state.
 * @return {Promise} The promise object
 */
RunnableObject.prototype._handleStart = function () {
  const __pretty_name__ = "_handleStart";

  return new Promise(resolve => {
    this.logger.debug("[%s] default impl.", __pretty_name__);
    resolve();
  });
};

RunnableObject.prototype.stop = function () {
  const __pretty_name__ = "stop";

  return new Promise((resolve, reject) => {
    if (_.indexOf(
      [
        RunnableObject.States.Running,
        RunnableObject.States.Paused
      ], this.currentState) === -1) {
      this.logger.debug("[%s] Cannot stop with the current state %s", __pretty_name__, this.currentState);
      reject(new IllegalStateException(util.format("Stop is not permitted with state %s", this.currentState)));
    } else {
      const currentState = this.currentState;
      this.logger.debug("[%s] Ask to handle stop", __pretty_name__);
      this.currentState = RunnableObject.States.Stopping;
      this.emit(RunnableObject.Signals.stopping);
      this._handleStop()
        .then(() => {
          this.logger.debug("[%s] Stop succeed", __pretty_name__);
          this.currentState = RunnableObject.States.Ready;
          this.emit(RunnableObject.Signals.stopped);
          resolve();
        })
        .catch(error => {
          this.logger.error("[%s] Handler reported error : %s\n%s", __pretty_name__, error.message, error.stack);
          this.emit(RunnableObject.Signals.stopFailed, error);
          this.currentState = currentState;
          reject(error);
        });
    }
  });
};

/**
 * Override this function to handle the stop request.
 * In case of error the object will keep its previous state
 * @return {Promise} The promise object
 */
RunnableObject.prototype._handleStop = function () {
  const __pretty_name__ = "_handleStop";

  return new Promise(resolve => {
    this.logger.debug("[%s] default impl.", __pretty_name__);
    resolve();
  });
};

/**
 * Put in pause the object. This can only work if the object accept the action.
 * In case of error, the object keeps its previous state.
 * @see RunnableObject._handlePause
 * @return {Promise} The promise object
 */
RunnableObject.prototype.pause = function () {
  const __pretty_name__ = "pause";

  return new Promise((resolve, reject) => {
    if (!this.canPause()) {
      this.logger.debug("[%s] Ask to pause but the action is not permitted", __pretty_name__);
      reject(new OperationNotPermittedException(util.format("Pause is not permitted")));
      return;
    }

    if (this.currentState === RunnableObject.States.Paused || this.currentState === RunnableObject.States.Pausing) {
      this.logger.debug("[%s] Already paused/pausing (%s). Do nothing", __pretty_name__, this.currentState);
      resolve();
    } else if (this.currentState !== RunnableObject.States.Running) {
      this.logger.debug("[%s] Cannot pause with the current state %s", __pretty_name__, this.currentState);
      reject(new IllegalStateException(util.format("Pause is not permitted with state %s", this.currentState)));
    } else {
      this.logger.debug("[%s] Ask to handle pause", __pretty_name__);
      this.currentState = RunnableObject.States.Pausing;
      this.emit(RunnableObject.Signals.pausing);
      this._handlePause()
        .then(() => {
          this.logger.debug("[%s] Pause succeed", __pretty_name__);
          this.currentState = RunnableObject.States.Paused;
          this.emit(RunnableObject.Signals.paused);
          resolve();
        })
        .catch(error => {
          this.logger.error("[%s] Handler reported error : %s\n%s", __pretty_name__, error.message, error.stack);
          this.emit(RunnableObject.Signals.pauseFailed, error);
          this.currentState = RunnableObject.States.Running;
          reject(error);
        });
    }
  });
};

/**
 * Override this function to handle pause action.
 * In case of error the object will keep its previous state
 * @return {Promise} The promise object.
 */
RunnableObject.prototype._handlePause = function () {
  const __pretty_name__ = "_handlePause";

  return new Promise(resolve => {
    this.logger.debug("[%s] default impl.", __pretty_name__);
    resolve();
  });
};

/**
 * Ask to resume the process.
 * This function will only works if the current state is paused.
 * If the current state is running or resuming, The function do nothing.
 * @see RunnableObject._handleResume
 * @return {Promise} The promise object
 */
RunnableObject.prototype.resume = function () {
  const __pretty_name__ = "resume";

  return new Promise((resolve, reject) => {
    if (!this.canPause()) {
      this.logger.debug("[%s] Ask to resume but the action is not permitted", __pretty_name__);
      reject(new OperationNotPermittedException(util.format("Resume is not permitted")));
      return;
    }

    if (this.currentState === RunnableObject.States.Running || this.currentState === RunnableObject.States.Resuming) {
      this.logger.debug("[%s] Already running/resuming (%s). Do nothing", __pretty_name__, this.currentState);
      resolve();
    } else if (this.currentState !== RunnableObject.States.Paused) {
      this.logger.debug("[%s] Cannot resume with the current state %s", __pretty_name__, this.currentState);
      reject(new IllegalStateException(util.format("Resume is not permitted with state %s", this.currentState)));
    } else {
      this.logger.debug("[%s] Ask to handle resuming", __pretty_name__);
      this.currentState = RunnableObject.States.Resuming;
      this.emit(RunnableObject.Signals.resuming);
      this._handleResume()
        .then(() => {
          this.logger.debug("[%s] Resume succeed", __pretty_name__);
          this.currentState = RunnableObject.States.Running;
          this.emit(RunnableObject.Signals.resumed);
          resolve();
        })
        .catch(error => {
          this.logger.error("[%s] Handler reported error : %s\n%s", __pretty_name__, error.message, error.stack);
          this.emit(RunnableObject.Signals.resumeFailed, error);
          this.currentState = RunnableObject.States.Paused;
          reject(error);
        });
    }
  });
};

/**
 * This function is called after an user ask to resume the process. In case of success
 *  the object go to state running.
 * In case of error, the object keeps its previous state
 * @return {Promise} The promise object
 */
RunnableObject.prototype._handleResume = function () {
  const __pretty_name__ = "_handleResume";

  return new Promise(resolve => {
    this.logger.debug("[%s] default impl.", __pretty_name__);
    resolve();
  });
};

/**
 * Called this function when the process finished by itself
 * @param {*} result The result value to emit
 * @return {Promise} The promise object
 */
RunnableObject.prototype._handleRunDone = function (result) {
  const __pretty_name__ = "_handleRunDone";

  return new Promise(resolve => {
    this.logger.debug("[%s] Handle the run done.", __pretty_name__);
    this.logger.debug("[%s] Set the state to %s.", __pretty_name__, RunnableObject.States.Finishing);
    this.currentState = RunnableObject.States.Finishing;

    this.emit(RunnableObject.Signals.finished, result);
    this.logger.debug("[%s] Set the state to %s.", __pretty_name__, RunnableObject.States.Ready);
    this.currentState = RunnableObject.States.Ready;

    resolve();
  });
};

/**
 * Handle the failure of the execution. This just emit the signal and change the state
 * @param {Error} error The error to handle
 * @return {Promise} The promise object
 */
RunnableObject.prototype._handleExecutionFailed = function (error) {
  const __pretty_name__ = "_handleExecutionFailed";

  return new Promise(resolve => {
    this.logger.debug("[%s] Handle the run failure.", __pretty_name__);
    this.logger.debug("[%s] Set the state to %s.", __pretty_name__, RunnableObject.States.Finishing);
    this.currentState = RunnableObject.States.Finishing;

    this.emit(RunnableObject.Signals.finishedWithError, error);
    this.logger.debug("[%s] Set the state to %s.", __pretty_name__, RunnableObject.States.Ready);
    this.currentState = RunnableObject.States.Ready;

    resolve();
  });
};

exports = module.exports = RunnableObject;
