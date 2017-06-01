/**
 * Contains the exception NotImplementedException
 */

const util = require('util'),
  BaseException = require("./BaseException")
;

/**
 * @description Tells you there is not implementation do handle the action
 * @constructor
 */
function NotImplementedException() {
  if (!(this instanceof NotImplementedException)) {
    return new (Function.prototype.bind.apply(NotImplementedException, Array.prototype.concat.apply([null], arguments)))();
  }

  BaseException.apply(this, arguments);
}

util.inherits(NotImplementedException, BaseException);

exports = module.exports = NotImplementedException;
