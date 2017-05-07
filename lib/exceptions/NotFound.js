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
function NotFound() {
  if (!(this instanceof NotFound)) {
    return new(Function.prototype.bind.apply(NotFound, Array.prototype.concat.apply([null], arguments)));
  }

  BaseException.apply(this, arguments);
}

util.inherits(NotFound, BaseException);

exports = module.exports = NotFound;
