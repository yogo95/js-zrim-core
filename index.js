/**
 * Main entry point for Generic Managers
 */

// Contains sub module
/**
 * @typedef {Function} GenericManagerModule
 * @property {BaseObject} BaseObject The base object
 * @property {ConnectableObject} ConnectableObject The connectable object
 * @property {ProxyLogger} ProxyLogger The proxy logger
 * @property {BaseExceptionsModule} ProxyLogger The proxy logger
 */

/**
 * @type GenericManagerModule
 */
function requireSubModule() {

}

requireSubModule.BaseObject = require("./lib/BaseObject");
requireSubModule.InitializableObject = require("./lib/InitializableObject");
requireSubModule.ConnectableObject = require("./lib/ConnectableObject");
requireSubModule.ProxyLogger = require("./lib/ProxyLogger");

// Contains exceptions
requireSubModule.exceptions = require("./lib/exceptions/index");
requireSubModule.common = require("./lib/common/index");

exports = module.exports = requireSubModule;
