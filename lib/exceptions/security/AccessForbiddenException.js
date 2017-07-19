/**
 * Contains the exception fo access forbidden due to a restricted area
 */

const SecurityException = require("./SecurityException");

/**
 * @description Access forbidden
 * @constructor
 */
function AccessForbiddenException() {
  return AccessForbiddenException.prototype._construct.apply(this, arguments);
}

SecurityException.extend(AccessForbiddenException);

exports = module.exports = AccessForbiddenException;
