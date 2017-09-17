const InitializableObject = require("./InitializableObject");

/**
 * Same as {@link InitializableObject} but when the initialization succeed, the object become ready
 * @implements {InitializableObject}
 * @constructor
 */
function SimpleInitializableObject() {
  if (!(this instanceof InitializableObject)) {
    return new Function.prototype.bind.apply(InitializableObject, Array.prototype.concat.apply([null], arguments))();
  }

  InitializableObject.apply(this, arguments);
  this.on(SimpleInitializableObject.Signals.initializationSucceed, () => {
    this.currentState = SimpleInitializableObject.States.Ready;
  });
}

InitializableObject._applyPrototypeTo(SimpleInitializableObject);

exports = module.exports = SimpleInitializableObject;
