/**
 * Contains the exception SecurityException
 */

const BaseError = require("./../BaseError");

/**
 * @description Tells when something is related to a security issue
 * @constructor
 */
function SecurityException() {
  return SecurityException.prototype._construct.apply(this, arguments);
}

BaseError.extend(SecurityException);

exports = module.exports = SecurityException;
