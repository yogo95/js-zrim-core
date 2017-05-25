const util = require('util'),
  javaScriptHelper = require("../common/JavaScriptHelper")()
;

/**
 * @description Base exception to have inheritance (From TypeError)
 * @see TypeError
 * @see https://www.bennadel.com/blog/2828-creating-custom-error-objects-in-node-js-with-error-capturestacktrace.htm
 * @constructor
 */
function BaseTypeError() {
  if (!(this instanceof BaseTypeError)) {
    return new(Function.prototype.bind.apply(BaseTypeError, Array.prototype.concat.apply([null], arguments)));
  }

  const argsLength = arguments.length;

  this.name = javaScriptHelper.extractFunctionNameFromInstance(this);
  this.message = arguments[0] || "Type Error";
  if (argsLength > 0 && (arguments[argsLength - 1] instanceof Error)) {
    this.cause = arguments[argsLength - 1];
  }
  Error.captureStackTrace(this, BaseTypeError);
}

util.inherits(BaseTypeError, TypeError);

exports = module.exports = BaseTypeError;
