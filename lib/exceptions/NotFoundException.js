/**
 * Contains the exception NotFound
 */

const util = require('util'),
  BaseException = require("./BaseException")
;

/**
 * @description Tells when something is not found
 * @constructor
 */
function NotFoundException() {
  if (!(this instanceof NotFoundException)) {
    return new(Function.prototype.bind.apply(NotFoundException, Array.prototype.concat.apply([null], arguments)));
  }

  BaseException.apply(this, arguments);
}

util.inherits(NotFoundException, BaseException);

exports = module.exports = NotFoundException;
