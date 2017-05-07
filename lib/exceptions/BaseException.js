const util = require('util'),
  javaScriptHelper = require("../common/JavaScriptHelper")()
;

/**
 * @description Base exception to have inheritance
 * @see https://www.bennadel.com/blog/2828-creating-custom-error-objects-in-node-js-with-error-capturestacktrace.htm
 * @constructor
 */
function BaseException() {
  if (!(this instanceof BaseException)) {
    return new(Function.prototype.bind.apply(BaseException, Array.prototype.concat.apply([null], arguments)));
  }

  const argsLength = arguments.length;

  this.name = javaScriptHelper.extractFunctionNameFromInstance(this);
  this.message = arguments[0] || "Illegal state exception";
  if (argsLength > 0 && (arguments[argsLength - 1] instanceof Error)) {
    this.cause = arguments[argsLength - 1];
  }
  Error.captureStackTrace(this, BaseException);
}

util.inherits(BaseException, Error);

exports = module.exports = BaseException;
