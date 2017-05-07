/**
 * Contains the exception IllegalStateException
 */

const util = require('util'),
  BaseException = require("./BaseException")
;

/**
 * @description Tells you the current state is invalid for this request
 * @constructor
 */
function IllegalStateException() {
  if (!(this instanceof IllegalStateException)) {
    return new(Function.prototype.bind.apply(IllegalStateException, Array.prototype.concat.apply([null], arguments)));
  }

  BaseException.apply(this, arguments);
}

util.inherits(IllegalStateException, BaseException);

exports = module.exports = IllegalStateException;
