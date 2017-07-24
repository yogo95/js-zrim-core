/**
 * Contains the exception RemoteException
 */

const BaseError = require("./../BaseError");

/**
 * @description Tells when something is related to a remote issue
 * @constructor
 */
function RemoteException() {
  return RemoteException.prototype._construct.apply(this, arguments);
}

BaseError.extend(RemoteException);

exports = module.exports = RemoteException;
