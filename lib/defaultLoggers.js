/**
 * Help to define default logger to use with {@link BaseObject}
 */

const winston = require('winston'),
  _ = require('lodash'),
  util = require('util');

const DEFAULT_NAME = '____default____',
  DEFAULT_LOGGER = winston;


/**
 * Return default logger
 * @param {string} [loggerName] Fetch the default logger using the logger name.
 * @return {Object} The logger to use
 * @constructor
 */
function defaultLogger(loggerName) {
  return defaultLogger.getDefaultLogger(loggerName);
}

defaultLogger.__loggers = {}; // Contains logger

/**
 * Register a default logger
 * @param {string|undefined|null} loggerName The logger name. If null or undefined we set the default one
 * @param {*} logger The logger to set
 * @throws {Error} If something goes wrong
 */
defaultLogger.setDefaultLogger = function (loggerName, logger) {
  if (!_.isString(loggerName) && !_.isNil(loggerName)) {
    throw new TypeError(util.format("Invalid logger name type '%s'", typeof loggerName));
  }

  if (_.isNil(loggerName)) {
    loggerName = DEFAULT_NAME;
  }

  defaultLogger.__loggers[loggerName] = logger;
};

/**
 * Get the logger by the logger name
 * @param {string|undefined|null} loggerName The logger name
 * @throws {Error} If something goes wrong
 */
defaultLogger.getDefaultLogger = function (loggerName) {
  if (!_.isString(loggerName) && !_.isNil(loggerName)) {
    throw new TypeError(util.format("Invalid logger name type '%s'", typeof loggerName));
  }

  if (_.isNil(loggerName)) {
    loggerName = DEFAULT_NAME;
  }

  let logger = defaultLogger.__loggers[loggerName];
  return logger || defaultLogger.__loggers[DEFAULT_NAME] || DEFAULT_LOGGER;
};

/**
 * Returns logger names
 * @return {string[]} The logger names
 */
defaultLogger.listLoggers = function () {
  return _.keys(defaultLogger.__loggers);
};

exports = module.exports = defaultLogger;
