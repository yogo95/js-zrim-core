/**
 * Contains mocks to be used in
 */

/**
 * @typedef {Function} ServicesModule
 * @property {ConverterService} ConverterService Help to manager converters
 * @property {SimpleLoggerManagerV1} SimpleLoggerManagerV1 A simple logger manager using v1 features
 */

/**
 * @type {ServicesModule}
 */
function services() {

}

services.ConverterService = require("./ConverterService");
services.SimpleLoggerManagerV1 = require("./simple-logger-manager-v1").SimpleLoggerManagerV1;

exports = module.exports = services;
