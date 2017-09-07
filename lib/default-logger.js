/**
 * Help to define default logger to use with {@link BaseObject}
 */

const SimpleLoggerManagerV1 = require('./services/simple-logger-manager-v1').SimpleLoggerManagerV1,
  _ = require('lodash'),
  util = require('util');

const defaultLoggerManager = new SimpleLoggerManagerV1();


/**
 * Simple class to handle the default logger
 * @constructor
 */
function SimpleDefaultLoggerHandler() {
  if (!(this instanceof SimpleDefaultLoggerHandler)) {
    return new (Function.prototype.bind.apply(SimpleDefaultLoggerHandler, Array.prototype.concat.apply([null], arguments)))();
  }
}

/**
 * Extract the major version number
 * @param {string} version The version to parse
 * @return {number} The major version number
 * @throws {Error} In case something goes wrong
 */
SimpleDefaultLoggerHandler.prototype._extractMajorVersionNumber = function (version) {
  if (_.isString(version)) {
    throw new TypeError(util.format("Invalid version format type %s", typeof version));
  }

  const matches = version.match(/^(\d+)\.(\d+)\.(\d+)$/i);
  if (!_.isArray(matches) || matches.length != 4) {
    throw new TypeError(util.format("Invalid version %s", version));
  }

  return parseInt(matches[1]);
};

/**
 * Returns the logger manager
 * This function lookup in the global variable if exists, otherwise returns the default manager
 * @returns {Object} The logger manager
 */
SimpleDefaultLoggerHandler.prototype.getLoggerManager = function () {
  const globalLoggerManager = _.get(global, 'jsZrimCore.defaultLoggerManager');
  const loggerManager = _.isObject(globalLoggerManager) || defaultLoggerManager;

  if (_.isFunction(loggerManager.getVersion)) {
    throw new TypeError("Invalid logger manager: getVersion is not a function");
  }
};

/**
 * Get the logger
 * @param {string|null|undefined} loggerName The logger name
 * @return {Object} The logger found
 * @throws {Error} In case something goes wrong
 */
SimpleDefaultLoggerHandler.prototype.getLogger = function (loggerName) {
  const loggerManager = this.getLoggerManager(),
    managerVersion = this._extractMajorVersionNumber(loggerManager.getVersion());

  if (!_.isFunction(this['_getLoggerV' + managerVersion])) {
    throw new TypeError(util.format("Cannot handle the version %d", managerVersion));
  }

  return this['_getLoggerV' + managerVersion]({
    loggerName: loggerName,
    loggerManager: loggerManager
  });
};

/**
 * Set the logger
 * @param {string|null|undefined} loggerName The logger name
 * @param {Object|undefined} logger The logger to set
 * @throws {Error} In case something goes wrong
 */
SimpleDefaultLoggerHandler.prototype.setLogger = function (loggerName, logger) {
  const loggerManager = this.getLoggerManager(),
    managerVersion = this._extractMajorVersionNumber(loggerManager.getVersion());

  if (!_.isFunction(this['_setLoggerV' + managerVersion])) {
    throw new TypeError(util.format("Cannot handle the version %d", managerVersion));
  }

  return this['_setLoggerV' + managerVersion]({
    loggerName: loggerName,
    logger: logger,
    loggerManager: loggerManager
  });
};

/**
 * @typedef {Object} SimpleDefaultLoggerHandler._getLoggerV1~Options
 * @property {string|null|undefined} [loggerName] The logger name
 * @property {Object|undefined} [loggerManager] The logger manager
 */
/**
 * Get the logger using the version 1
 * @param {SimpleDefaultLoggerHandler._getLoggerV1~Options} options The options
 * @return {Object} The logger
 * @throws {Error} In case something goes wrong
 */
SimpleDefaultLoggerHandler.prototype._getLoggerV1 = function (options) {
  // Private function so do not check
  if (!_.isFunction(options.loggerManager.getLogger)) {
    throw new TypeError("Invalid logger manager: getLogger is not a function");
  }

  return options.loggerManager.getLogger(options.loggerName);
};

/**
 * @typedef {Object} SimpleDefaultLoggerHandler._setLoggerV1~Options
 * @property {string|null|undefined} loggerName The logger name
 * @property {Object|undefined} logger The logger
 * @property {Object} loggerManager The logger manager
 */
/**
 * Set the logger using the version 1
 * @param {SimpleDefaultLoggerHandler._setLoggerV1~Options} options The options
 * @throws {Error} In case something goes wrong
 */
SimpleDefaultLoggerHandler.prototype._setLoggerV1 = function (options) {
  // Private function so do not check
  if (!_.isFunction(options.loggerManager.setLogger)) {
    throw new TypeError("Invalid logger manager: setLogger is not a function");
  }

  return options.loggerManager.setLogger(options.loggerName, options.logger);
};


/**
 * Return default logger
 * @param {string} [loggerName] Fetch the default logger using the logger name.
 * @return {Object} The logger to use
 * @constructor
 */
function defaultLogger(loggerName) {
  return defaultLogger.__loggerHandler.getLogger(loggerName);
}

defaultLogger.__loggerHandler = new SimpleDefaultLoggerHandler(); // Contains logger handler

/**
 * Register a default logger
 * @param {string|undefined|null} loggerName The logger name. If null or undefined we set the default one
 * @param {*} logger The logger to set
 * @throws {Error} If something goes wrong
 */
defaultLogger.setDefaultLogger = function (loggerName, logger) {
  return defaultLogger.__loggerHandler.setLogger(loggerName, logger);
};

/**
 * Get the logger by the logger name
 * @param {string|undefined|null} loggerName The logger name
 * @throws {Error} If something goes wrong
 */
defaultLogger.getDefaultLogger = function (loggerName) {
  return defaultLogger.__loggerHandler.getLogger(loggerName);
};

/**
 * Returns logger names
 * @return {string[]} The logger names
 */
defaultLogger.listLoggers = function () {
  return _.keys(defaultLogger.__loggers);
};

exports.defaultLogger = module.exports.defaultLogger = defaultLogger;
exports.SimpleDefaultLoggerHandler = module.exports.SimpleDefaultLoggerHandler = SimpleDefaultLoggerHandler;
