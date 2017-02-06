/**
 * A proxy logger to add prefix in the string argument
 */

var _ = require('lodash'),
  javaScriptHelper = require("./common/index").JavaScriptHelper()
  ;

/**
 * @typedef {Object} ProxyLogger~Properties
 * @description Contains the initialization
 * @property {Object|undefined} target The logger
 * @property {string|undefined} prefixes The prefixes
 */
/**
 * @typedef {Object} ProxyLogger~Options
 * @description Contains the initialization
 * @property {Object|undefined} target The logger
 * @property {string|undefined} prefixLog The log prefix
 */
/**
 * @description Extend the current logger to add new feature
 * @property {ProxyLogger~Properties} properties Contains the protected data
 * @property {Object|undefined} target The logger to proxy
 * @property {function} log The log function
 * @property {function} debug The debug log
 * @property {function} info The info log
 * @property {function} warn The warn log
 * @property {function} error The error log
 * @property {function} fatal The fatal log
 * @property {function} critical The critical log
 * @private
 */
function ProxyLogger(options) {
  if (!(this instanceof ProxyLogger)) {
    return new(Function.prototype.bind.apply(ProxyLogger, Array.prototype.concat.apply([null], arguments)));
  }

  // Configure properties object
  this.properties = _.assign(_.merge({}, this.properties), {
    target: undefined,
    prefixLog: undefined,
    // All prefix
    prefixes: []
  });

  var _this = this;

  if (options !== null && _.isObjectLike(options)) {
    if (_.isString(options.prefixes)) {
      this.properties.prefixes.push(options.prefixes);
    } else if (_.isArray(options.prefixes)) {
      _.each(options.prefixes, function (prefix) {
        if (_.isString(prefix) && prefix.length > 0) {
          _this.properties.prefixes.push(prefix);
        }
      });
    }

    if (_.isObjectLike(options.target)) {
      this.properties.target = options.target;
    }
  }

  // Generate the prefix
  this.properties.prefixLog = this.generatePrefixLog(this.properties.prefixes);
}

// Define the property container
Object.defineProperty(ProxyLogger.prototype, "properties", {
  value: {},
  enumerable: false,
  writable: true
});

Object.defineProperty(ProxyLogger.prototype, 'target', {
  enumerable: false,
  get: function () {
    return this.properties.target;
  },
  set: function (target) {
    if (_.isNil(target)) {
      this.properties.target = undefined;
    } else if (_.isObjectLike(target)) {
      this.properties.target = target;
    }
  }
});

/**
 * Generate the prefix log to use
 * @param {string|string[]|undefined} prefixes all prefixes
 * @return {undefined|string} The prefix to use
 */
ProxyLogger.prototype.generatePrefixLog = function (prefixes) {
  var prefixGenerated = undefined;
  if (_.isString(prefixes)) {
    prefixGenerated = "[" + prefixes + "]";
  } else if (_.isArray(prefixes)) {
    prefixGenerated = "";
    _.each(prefixes, function (prefix) {
      if (_.isString(prefix)) {
        prefixGenerated += "[" + prefix + "]";
      }
    });
  }

  return prefixGenerated;
};

/**
 * Find the root target. In case of the current target is the ProxyLogger, then we
 * must get the target from the parent
 * @return {Object|undefined} The target or undefined if no target
 */
ProxyLogger.prototype.getRootTarget = function () {
  if (_.isNil(this.properties.target)) {
    return undefined;
  } else if (this.properties.target instanceof ProxyLogger) {
    return this.properties.target.getRootTarget();
  } else {
    return this.properties.target;
  }
};

/**
 * Base function to log something. It will call the real log function
 * @param {string} levelName The level name
 */
ProxyLogger.prototype.log = function (levelName) {
  if (typeof levelName !== 'string') {
    return;
  }

  var target = this.getRootTarget();

  if (target && _.isFunction(target[levelName])) {
    // Add in the first argument the name of the manager
    var args = _.slice(arguments, 1);
    // Check if we have the instance name
    if (this.properties.prefixLog) {
      if (args.length > 0 && _.isString(args[0])) {
        if (args[0][0] === '[') {
          args[0] = this.properties.prefixLog + args[0];
        } else {
          args[0] = this.properties.prefixLog + " " + args[0];
        }
      }
    }

    target[levelName].apply(target, args);
  }
};

/**
 * @description Help to know if the debug mode is enable when you'd like to log a huge amount of data only in debug mode
 * @return {boolean} true if debug is enabled, otherwise false
 */
ProxyLogger.prototype.isDebugEnabled = function () {
  var target = this.getRootTarget();
  if (target && target.level === 'debug') {
    return true;
  }

  return false;
};

/**
 * Create a new proxy logger of the given argument.
 * @param {Function|string|undefined} arg The function to generate the prefix or the function name
 * @return {ProxyLogger} The new proxy logger
 */
ProxyLogger.prototype.of = function (arg) {
  if (_.isString(arg)) {
    return new ProxyLogger({
      target: this,
      prefixes: arg
    });
  } else if (_.isFunction(arg)) {
    var functionName = javaScriptHelper.extractFunctionName(arg);
    return new ProxyLogger({
      target: this,
      prefixes: this.properties.prefixes.concat(functionName)
    });
  } else {
    return new ProxyLogger({
      target: this,
      prefixes: this.properties.prefixes
    });
  }
};

_.each(['debug', 'info', 'warn', 'error', 'fatal', 'critical'], function (levelName) {
  ProxyLogger.prototype[levelName] = function () {
    var args = _.concat(levelName, arguments);
    this.log.apply(this, args);
  };
});

exports = module.exports = ProxyLogger;
