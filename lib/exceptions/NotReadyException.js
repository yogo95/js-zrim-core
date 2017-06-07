/**
 * Contains the exception NotReadyException
 */

const IllegalStateException = require("./IllegalStateException");

/**
 * @description Tells the action cannot be performed because the state is not ready
 * @constructor
 */
function NotReadyException() {
  return NotReadyException.prototype._construct.apply(this, arguments);
}

IllegalStateException.extend(NotReadyException);

exports = module.exports = NotReadyException;
