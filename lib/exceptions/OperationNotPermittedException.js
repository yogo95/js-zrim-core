/**
 * Contains the exception OperationNotPermittedException
 */

const util = require('util'),
  BaseException = require("./BaseException")
;

/**
 * @description Tells the operation is not permitted
 * @constructor
 */
function OperationNotPermittedException() {
  if (!(this instanceof OperationNotPermittedException)) {
    return new(Function.prototype.bind.apply(OperationNotPermittedException, Array.prototype.concat.apply([null], arguments)));
  }

  BaseException.apply(this, arguments);
}

util.inherits(OperationNotPermittedException, BaseException);

exports = module.exports = OperationNotPermittedException;
