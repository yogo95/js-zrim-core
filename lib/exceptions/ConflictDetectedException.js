/**
 * Contains the exception ConflictDetectedException
 */

const BaseError = require("./BaseError");

/**
 * @description A conflict has been detected
 * @constructor
 */
function ConflictDetectedException() {
  return ConflictDetectedException.prototype._construct.apply(this, arguments);
}

BaseError.extend(ConflictDetectedException);

exports = module.exports = ConflictDetectedException;
