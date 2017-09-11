
/**
 * @typedef {Function} BaseRemoteErrorModule
 * @property {RemoteException} RemoteException Remote exception
 * @property {RemoteServiceException} RemoteServiceException Remote service exception
 * @property {UnavailableRemoteServiceException} UnavailableRemoteServiceException Unavailable remote service exception
 */

/**
 * @type {BaseRemoteErrorModule}
 */
function remoteExceptions() {

}

remoteExceptions.RemoteException = require("./RemoteException");
remoteExceptions.RemoteServiceException = require("./RemoteServiceException");
remoteExceptions.UnavailableRemoteServiceException = require("./UnavailableRemoteServiceException");

exports = module.exports = remoteExceptions;
