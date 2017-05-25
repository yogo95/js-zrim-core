/**
 * Contains mocks to be used in
 */

/**
 * @typedef {Function} ServicesModule
 * @property {ConverterService} ConverterService Help to manager converters
 */

/**
 * @type {ServicesModule}
 */
function services() {

}

services.ConverterService = require("./ConverterService");

exports = module.exports = services;
