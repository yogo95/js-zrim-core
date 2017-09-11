/**
 * Contains the exception authentication required
 */

const SecurityException = require("./SecurityException");

/**
 * @description Authentication required
 * @constructor
 */
function AuthenticationRequiredException() {
  return AuthenticationRequiredException.prototype._construct.apply(this, arguments);
}

SecurityException.extend(AuthenticationRequiredException);

exports = module.exports = AuthenticationRequiredException;
