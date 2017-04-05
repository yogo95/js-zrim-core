/**
 * Contains the exception IllegalStateException
 */

var util = require('util');

/**
 * @description Tells you the current state is invalid for this request
 * @see https://www.bennadel.com/blog/2828-creating-custom-error-objects-in-node-js-with-error-capturestacktrace.htm
 * @constructor
 */
function IllegalStateException() {
  if (!(this instanceof IllegalStateException)) {
    return new(Function.prototype.bind.apply(IllegalStateException, Array.prototype.concat.apply([null], arguments)));
  }

  this.name = "IllegalStateException";
  this.message = arguments[0] || "Illegal state exception";
  Error.captureStackTrace(this, IllegalStateException);
}

util.inherits(IllegalStateException, Error);

exports = module.exports = IllegalStateException;
