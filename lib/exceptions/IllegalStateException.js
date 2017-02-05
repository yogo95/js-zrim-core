/**
 * Contains the exception IllegalStateException
 */

var util = require('util');

/**
 * @description Tells you the current state is invalid for this request
 * @constructor
 */
function IllegalStateException() {
  if (!(this instanceof IllegalStateException)) {
    return new(Function.prototype.bind.apply(IllegalStateException, Array.prototype.concat.apply([null], arguments)));
  }

  Error.apply(this, arguments);
}

util.inherits(IllegalStateException, Error);

exports = module.exports = IllegalStateException;
