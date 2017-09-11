/**
 * Contains the exception RemoteServiceException
 */

const RemoteException = require("./RemoteException");

/**
 * @description Tells when something is related to a remote service issue
 * @constructor
 */
function RemoteServiceException() {
  return RemoteServiceException.prototype._construct.apply(this, arguments);
}

RemoteException.extend(RemoteServiceException);

exports = module.exports = RemoteServiceException;
