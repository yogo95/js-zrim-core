/**
 * Contains the exception NotFound
 */

const util = require('util'),
  BaseException = require("./BaseException")
;

/**
 * @description Indicate the argument is invalid
 * @constructor
 */
function IllegalArgumentException() {
  if (!(this instanceof IllegalArgumentException)) {
    return new(Function.prototype.bind.apply(IllegalArgumentException, Array.prototype.concat.apply([null], arguments)));
  }

  BaseException.apply(this, arguments);
}

util.inherits(IllegalArgumentException, BaseException);

exports = module.exports = IllegalArgumentException;
