/**
 * A generic contains to expose exceptions
 */

/**
 * @typedef {Function} BaseExceptionsModule
 * @property {IllegalStateException} IllegalStateException The illegal state exception
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
