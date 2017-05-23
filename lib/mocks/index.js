/**
 * Contains mocks to be used in
 */

/**
 * @typedef {Function} MocksModule
 * @property {LoggerMock} LoggerMock Help to mock logger in the ProxyLogger
 */

/**
 * @type {MocksModule}
 */
function mocks() {

}

mocks.LoggerMock = require("./LoggerMock");

exports = module.exports = mocks;
