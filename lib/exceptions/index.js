/**
 * A generic contains to expose exceptions
 */

/**
 * @typedef {Function} BaseExceptionsModule
 * @property {IllegalStateException} IllegalStateException The illegal state exception
 * @property {BaseException} BaseException The base exception
 * @property {BaseTypeError} BaseTypeError The base exception for TypeError
 * @property {IllegalArgumentException} IllegalArgumentException The illegal argument exception
 * @property {NotFoundException} NotFound The not found exception
 * @property {OperationNotPermittedException} OperationNotPermittedException The operation not permitted exception
 */

/**
 * @type {BaseExceptionsModule}
 */
function exceptions() {

}

exceptions.IllegalStateException = require("./IllegalStateException");
exceptions.BaseException = require("./BaseException");
exceptions.BaseTypeError = require("./BaseTypeError");
exceptions.IllegalArgumentException = require("./IllegalArgumentException");
exceptions.NotFoundException = require("./NotFound");
exceptions.OperationNotPermittedException = require("./OperationNotPermittedException");

exports = module.exports = exceptions;
