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
 * @property {DependencyManager} DependencyManager The dependency manager
 * @property {DependencyEntry} DependencyEntry The dependency manager entry
 */

/**
 * @type GenericManagerModule
 */
function requireSubModule() {

}

requireSubModule.BaseObject = require("./lib/BaseObject");
requireSubModule.InitializableObject = require("./lib/InitializableObject");
requireSubModule.SimpleInitializableObject = require("./lib/SimpleInitializableObject");
requireSubModule.ConnectableObject = require("./lib/ConnectableObject");
requireSubModule.LoadableObject = require("./lib/LoadableObject");
requireSubModule.ProxyLogger = require("./lib/ProxyLogger");
requireSubModule.DependencyEntry = require("./lib/DependencyEntry");
requireSubModule.DependencyManager = require("./lib/DependencyManager");
requireSubModule.RunnableObject = require("./lib/RunnableObject");

// Contains exceptions
requireSubModule.exceptions = require("./lib/exceptions/index");
requireSubModule.common = require("./lib/common/index");
// Contains mocks
requireSubModule.mocks = require("./lib/mocks/index");
// Services
requireSubModule.services = require("./lib/services/index");

exports = module.exports = requireSubModule;
