/**
 * Help to define default logger to use with {@link BaseObject}
 */

const winston = require('winston'),
  _ = require('lodash'),
  util = require('util');

const DEFAULT_NAME = '____default____',
  DEFAULT_LOGGER = winston;

/**
 * A simple logger manager which implement the version 1
 * @constructor
 */
function SimpleLoggerManagerV1() {
  if (!(this instanceof SimpleLoggerManagerV1)) {
    return new (Function.prototype.bind.apply(SimpleLoggerManagerV1, Array.prototype.concat.apply([null], arguments)))();
  }

  // Contains the loggers
  this._loggers = {};
}

/**
 * Returns the version number
 * @return {string} The version number
 */
SimpleLoggerManagerV1.prototype.getVersion = function () {
  return "1.0.0";
};

/**
 * Returns the logger
 * @param {string|null|undefined} [loggerName] The logger name requested
 * @return {Logger} The logger found or created
 * @throws {Error} in case something goes wrong
 */
SimpleLoggerManagerV1.prototype.getLogger = function (loggerName) {
  if (!_.isString(loggerName) && !_.isNil(loggerName)) {
    throw new TypeError(util.format("Invalid logger name type '%s'", typeof loggerName));
  }

  if (_.isNil(loggerName) || loggerName.length === 0) {
    loggerName = DEFAULT_NAME;
  }

  const logger = this._loggers[loggerName];
  return logger || this._loggers[DEFAULT_NAME] || DEFAULT_LOGGER;
};

/**
 * Returns the logger
 * @param {string|null|undefined} [loggerName] The logger name requested
 * @param {Object|undefined} logger The logger to set
 * @throws {Error} in case something goes wrong
 */
SimpleLoggerManagerV1.prototype.setLogger = function (loggerName, logger) {
  if (!_.isString(loggerName) && !_.isNil(loggerName)) {
    throw new TypeError(util.format("Invalid logger name type '%s'", typeof loggerName));
  }

  if (_.isNil(loggerName) || loggerName.length === 0) {
    loggerName = DEFAULT_NAME;
  }

  this._loggers[loggerName] = logger;
};

/**
 * Returns the logger names
 * @return {string[]} The logger names
 */
SimpleLoggerManagerV1.prototype.listLoggerNames = function () {
  const loggerNames = _.filter(_.keys(this._loggers), loggerName => {
    return loggerName !== DEFAULT_NAME;
  });

  return loggerNames;
};


exports.SimpleLoggerManagerV1 = module.exports.SimpleLoggerManagerV1 = SimpleLoggerManagerV1;
