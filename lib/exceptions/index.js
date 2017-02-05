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

exports = module.exports = exceptions;
