/**
 * Contains the exception NotFound
 */

const BaseTypeError = require("./BaseTypeError");

/**
 * @description Indicate the argument is invalid
 * @constructor
 */
function IllegalArgumentException() {
  return IllegalArgumentException.prototype._construct.apply(this, arguments);
}

BaseTypeError.extend(IllegalArgumentException);

exports = module.exports = IllegalArgumentException;
