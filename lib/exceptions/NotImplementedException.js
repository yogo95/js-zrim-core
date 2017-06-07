/**
 * Contains the exception NotImplementedException
 */

const BaseError = require("./BaseError");

/**
 * @description Tells you there is not implementation do handle the action
 * @constructor
 */
function NotImplementedException() {
  return NotImplementedException.prototype._construct.apply(this, arguments);
}

BaseError.extend(NotImplementedException);

exports = module.exports = NotImplementedException;
