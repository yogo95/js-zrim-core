/**
 * Contains the exception NotFound
 */

const util = require('util'),
  BaseTypeError = require("./BaseTypeError")
;

/**
 * @description Indicate the argument is invalid
 * @constructor
 */
function IllegalArgumentException() {
  if (!(this instanceof IllegalArgumentException)) {
    return new(Function.prototype.bind.apply(IllegalArgumentException, Array.prototype.concat.apply([null], arguments)));
  }

  BaseTypeError.apply(this, arguments);
}

util.inherits(IllegalArgumentException, BaseTypeError);

exports = module.exports = IllegalArgumentException;
