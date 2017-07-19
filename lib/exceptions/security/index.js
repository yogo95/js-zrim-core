/**
 * A generic contains to expose exceptions
 */

/**
 * @typedef {Function} BaseSecurityErrorModule
 * @property {SecurityException} SecurityException Security exception
 * @property {AuthenticationRequiredException} AuthenticationRequiredException Authentication required
 * @property {AccessForbiddenException} AccessForbiddenException Access forbidden
 * @property {AuthorizationExpiredException} AuthorizationExpiredException The authorization previously given expired
 */

/**
 * @type {BaseSecurityErrorModule}
 */
function securityExceptions() {

}

securityExceptions.SecurityException = require("./SecurityException");
securityExceptions.AuthenticationRequiredException = require("./AuthenticationRequiredException");
securityExceptions.AccessForbiddenException = require("./AccessForbiddenException");
securityExceptions.AuthorizationExpiredException = require("./AuthorizationExpiredException");

exports = module.exports = securityExceptions;
