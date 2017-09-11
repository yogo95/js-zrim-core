/**
 * Contains the exception UnavailableRemoteServiceException
 */

const RemoteServiceException = require("./RemoteServiceException");

/**
 * @description Sued to indicate that the remote service is unavailable
 * @constructor
 */
function UnavailableRemoteServiceException() {
  return UnavailableRemoteServiceException.prototype._construct.apply(this, arguments);
}

RemoteServiceException.extend(UnavailableRemoteServiceException);

exports = module.exports = UnavailableRemoteServiceException;
