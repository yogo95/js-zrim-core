/**
 * Contains the exception NotReadyException
 */

const util = require('util'),
  IllegalStateException = require("./IllegalStateException")
;

/**
 * @description Tells the action cannot be performed because the state is not ready
 * @constructor
 */
function NotReadyException() {
  if (!(this instanceof NotReadyException)) {
    return new (Function.prototype.bind.apply(NotReadyException, Array.prototype.concat.apply([null], arguments)))();
  }

  IllegalStateException.apply(this, arguments);
}

util.inherits(NotReadyException, IllegalStateException);

exports = module.exports = NotReadyException;
