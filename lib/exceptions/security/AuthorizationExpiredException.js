/**
 * Contains the exception : authorization previously given expired
 */

const SecurityException = require("./SecurityException");

/**
 * @description The authorization previously given expired
 * @constructor
 */
function AuthorizationExpiredException() {
  return AuthorizationExpiredException.prototype._construct.apply(this, arguments);
}

SecurityException.extend(AuthorizationExpiredException);

exports = module.exports = AuthorizationExpiredException;
