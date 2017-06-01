/**
 * Contains the exception TimedOutException
 */

const util = require('util'),
  BaseException = require("./BaseException")
;

/**
 * @description The time is out.
 * @constructor
 */
function TimedOutException() {
  if (!(this instanceof TimedOutException)) {
    return new (Function.prototype.bind.apply(TimedOutException, Array.prototype.concat.apply([null], arguments)))();
  }

  BaseException.apply(this, arguments);
}

util.inherits(TimedOutException, BaseException);

exports = module.exports = TimedOutException;
