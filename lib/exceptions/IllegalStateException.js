/**
 * Contains the exception IllegalStateException
 */

const BaseError = require("./BaseError");

/**
 * @description Tells you the current state is invalid for this request
 * @constructor
 */
function IllegalStateException() {
  return IllegalStateException.prototype._construct.apply(this, arguments);
}

BaseError.extend(IllegalStateException);

exports = module.exports = IllegalStateException;
