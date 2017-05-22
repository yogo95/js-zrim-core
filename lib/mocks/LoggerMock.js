const _ = require("lodash");


/**
 * Mock a logger
 * @property {function} debug The debug function
 * @property {function} info The info function
 * @property {function} warn The warning function
 * @property {function} warning The warning function
 * @property {function} error The error function
 * @property {function} crit The crit function
 * @property {function} critical The critical function
 * @property {function} fatal The fatal function
 * @constructor
 */
function LoggerMock() {

}

/**
 * Create a log function
 * @property {string} levelName The level name
 * @return {function} The log function
 */
LoggerMock.createLogFunction = function (levelName) {
  return function () {

  };
};

LoggerMock.Levels = [
  "debug",
  "info",
  "warn",
  "warning",
  "error",
  "crit",
  "critical",
  "fatal"
];

_.each(LoggerMock.Levels, function (levelName) {
  LoggerMock.prototype[levelName] = LoggerMock.createLogFunction(levelName);
});


exports = module.exports = LoggerMock;
