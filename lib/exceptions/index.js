/**
 * A generic contains to expose exceptions
 */

/**
 * @typedef {Function} BaseExceptionsModule
 * @property {IllegalStateException} IllegalStateException The illegal state exception
 * @property {BaseException} BaseException The base exception
 * @property {IllegalArgumentException} IllegalArgumentException The illegal argument exception
 * @property {NotFound} NotFound The not found exception
 * @property {OperationNotPermittedException} OperationNotPermittedException The operation not permitted exception
 */

/**
 * @type BaseExceptionsModule
 */
function exceptions() {

}

exceptions.IllegalStateException = require("./IllegalStateException");
exceptions.BaseException = require("./BaseException");
exceptions.IllegalArgumentException = require("./IllegalArgumentException");
exceptions.NotFound = require("./NotFound");
exceptions.OperationNotPermittedException = require("./OperationNotPermittedException");

exports = module.exports = exceptions;
