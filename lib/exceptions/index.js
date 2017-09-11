/**
 * A generic contains to expose exceptions
 */

/**
 * @typedef {Function} BaseExceptionsModule
 * @property {GenericBaseErrorTemplate} GenericBaseErrorTemplate Helper to create generic error
 * @property {IllegalStateException} IllegalStateException The illegal state exception
 * @property {BaseError} BaseError The base error
 * @property {BaseTypeError} BaseTypeError The base exception for TypeError
 * @property {IllegalArgumentException} IllegalArgumentException The illegal argument exception
 * @property {NotFoundException} NotFound The not found exception
 * @property {OperationNotPermittedException} OperationNotPermittedException The operation not permitted exception
 * @property {NotImplementedException} NotImplementedException No implementation available
 * @property {NotReadyException} NotReadyException The state is not ready and the action cannot be performed
 * @property {TimedOutException} TimedOutException Timed out
 * @property {RequirementsNotSatisfiedException} RequirementsNotSatisfiedException Requirements not found or invalid
 * @property {ConflictDetectedException} ConflictDetectedException Conflict detected
 * @property {BaseSecurityErrorModule} BaseSecurityErrorModule Contains security exceptions
 * @property {BaseRemoteErrorModule} BaseRemoteErrorModule Contains remote exceptions
 */

/**
 * @type {BaseExceptionsModule}
 */
function exceptions() {

}

exceptions.IllegalStateException = require("./IllegalStateException");
exceptions.BaseError = require("./BaseError");
exceptions.BaseTypeError = require("./BaseTypeError");
exceptions.IllegalArgumentException = require("./IllegalArgumentException");
exceptions.NotFoundException = require("./NotFoundException");
exceptions.OperationNotPermittedException = require("./OperationNotPermittedException");
exceptions.NotImplementedException = require("./NotImplementedException");
exceptions.NotReadyException = require("./NotReadyException");
exceptions.TimedOutException = require("./TimedOutException");
exceptions.RequirementsNotSatisfiedException = require("./RequirementsNotSatisfiedException");
exceptions.GenericBaseErrorTemplate = require("./GenericBaseErrorTemplate");
exceptions.ConflictDetectedException = require("./ConflictDetectedException");

exceptions.security = require("./security");
exceptions.remote = require("./remote");

exports = module.exports = exceptions;
