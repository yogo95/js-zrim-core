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
 * @property {NotImplementedException} NotImplementedException No implementation available
 * @property {NotReadyException} NotReadyException The state is not ready and the action cannot be performed
 * @property {TimedOutException} TimedOutException Timed out
 * @property {RequirementsNotSatisfiedException} RequirementsNotSatisfiedException Requirements not found or invalid
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
exceptions.NotFoundException = require("./NotFoundException");
exceptions.OperationNotPermittedException = require("./OperationNotPermittedException");
exceptions.NotImplementedException = require("./NotImplementedException");
exceptions.NotReadyException = require("./NotReadyException");
exceptions.TimedOutException = require("./TimedOutException");
exceptions.RequirementsNotSatisfiedException = require("./RequirementsNotSatisfiedException");

exports = module.exports = exceptions;
