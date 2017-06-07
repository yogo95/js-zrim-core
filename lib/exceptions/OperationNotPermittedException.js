/**
 * Contains the exception OperationNotPermittedException
 */

const BaseError = require("./BaseError");

/**
 * @description Tells the operation is not permitted
 * @constructor
 */
function OperationNotPermittedException() {
  return OperationNotPermittedException.prototype._construct.apply(this, arguments);
}

BaseError.extend(OperationNotPermittedException);

exports = module.exports = OperationNotPermittedException;
