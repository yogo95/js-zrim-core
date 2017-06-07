/**
 * Contains the exception TimedOutException
 */

const BaseError = require("./BaseError");

/**
 * @description The time is out.
 * @constructor
 */
function TimedOutException() {
  return TimedOutException.prototype._construct.apply(this, arguments);
}

BaseError.extend(TimedOutException);

exports = module.exports = TimedOutException;
