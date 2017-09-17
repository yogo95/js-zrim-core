/**
 * A proxy logger to add prefix in the string argument
 */

const _ = require('lodash'),
  javaScriptHelper = require("./common/index").JavaScriptHelper();

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
 * @property {*} metaData The metadata. If function, the function will be called when generate the meta data
 */
/**
 * @description Extend the current logger to add new feature
 * @property {ProxyLogger~Properties} properties Contains the protected data
 * @property {Object|undefined} target The logger to proxy
 * @property {function} log The log function
 * @property {function} debug The debug log
 * @property {function} info The info log
 * @property {function} warn The warn log
 * @property {function} warning The warn log
 * @property {function} error The error log
 * @property {function} fatal The fatal log
 * @property {function} critical The critical log
 * @property {function} crit The critical log
 * @private
 */
function ProxyLogger(options) {
  if (!(this instanceof ProxyLogger)) {
    return new Function.prototype.bind.apply(ProxyLogger, Array.prototype.concat.apply([null], arguments))();
  }

  // Configure properties object
  this.properties = _.assign(_.merge({}, this.properties), {
    target: undefined,
    prefixLog: undefined,
    // All prefix
    prefixes: [],
    metaData: undefined
  });

  if (options !== null && _.isObjectLike(options)) {
    if (_.isString(options.prefixes)) {
      this.properties.prefixes.push(options.prefixes);
    } else if (_.isArray(options.prefixes)) {
      _.each(options.prefixes, prefix => {
        if (_.isString(prefix) && prefix.length > 0) {
          this.properties.prefixes.push(prefix);
        }
      });
    }

    if (_.isObjectLike(options.target)) {
      this.properties.target = options.target;
    }

    if (!_.isNil(options.metaData)) {
      this.properties.metaData = options.metaData;
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
 * Generate the meta data to send
 * @return {undefined|Object} The metadata if generated
 */
ProxyLogger.prototype.generateMetaData = function () {
  try {
    const metaDataType = typeof this.properties.metaData;
    let metaDataGenerated = undefined;
    switch (metaDataType) {
      case 'function':
        metaDataGenerated = this.properties.metaData();
        break;
      case 'object':
        metaDataGenerated = this.properties.metaData;
        break;
      case 'string':
      case 'number':
      case 'boolean':
        metaDataGenerated = {
          data: this.properties.metaData
        };
        break;
      default:
        break;
    }

    return metaDataGenerated;
  } catch (unexpectedError) {
    // To be sure to tell someone
    return {
      __ProxyLogger_unexpectedError: {
        error: unexpectedError,
        stack: unexpectedError.stack,
        message: unexpectedError.message
      }
    };
  }
};

/**
 * Generate the prefix log to use
 * @param {string|string[]|undefined} prefixes all prefixes
 * @return {undefined|string} The prefix to use
 */
ProxyLogger.prototype.generatePrefixLog = function (prefixes) {
  let prefixGenerated = undefined;
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

  const target = this.getRootTarget();
  const metaData = this.generateMetaData();

  if (target) {
    let targetLogFunction = undefined,
      args = undefined,
      logStartIndex = 0
    ;

    if (_.isFunction(target[levelName])) {
      targetLogFunction = target[levelName];
      args = _.slice(arguments, 1);
      logStartIndex = 0;
    } else if (_.isFunction(target.log)) {
      targetLogFunction = target.log;
      args = _.concat([], arguments);
      logStartIndex = 1;
    }

    // Add the meta data at the end ?
    if (args && metaData) {
      args.push(metaData);
    }

    if (targetLogFunction) {
      // Check if we have the instance name
      if (this.properties.prefixLog) {
        if ((args.length - logStartIndex) > 0 && _.isString(args[logStartIndex])) {
          if (args[logStartIndex][0] === '[') {
            args[logStartIndex] = this.properties.prefixLog + args[logStartIndex];
          } else {
            args[logStartIndex] = this.properties.prefixLog + " " + args[logStartIndex];
          }
        }
      }

      targetLogFunction.apply(target, args);
    }
  }
};

/**
 * @description Help to know if the debug mode is enable when you'd like to log a huge amount of data only in debug mode
 * @return {boolean} true if debug is enabled, otherwise false
 */
ProxyLogger.prototype.isDebugEnabled = function () {
  const target = this.getRootTarget();
  if (target && _.isString(target.level) && target.level.toLowerCase() === 'debug') {
    return true;
  }

  return false;
};

/**
 * Use to extend the proxy
 * When using the meta data type 'merge' and the type cannot be merge, the meta data will be replace
 * @typedef {Object} ProxyLogger.of~Options
 * @property {string|string[]|function|undefined} prefixes The prefixes to apply
 * @property {*} metaData The meta data to use
 * @property {string|undefined} metaDataType the type of meta data (replace: to replace, merge: to merge) default: replace
 */
/**
 * Create a new proxy logger of the given argument.
 * @param {Function|string|undefined|ProxyLogger.of~Options} [arg] The function to generate the prefix or the function name
 * @return {ProxyLogger} The new proxy logger
 */
ProxyLogger.prototype.of = function (arg) {

  let options = {
    target: this,
    prefixes: this.properties.prefixes,
    metaData: this.properties.metaData
  };

  if (_.isString(arg)) {
    options.prefixes = this.properties.prefixes.concat(arg);
  } else if (_.isFunction(arg)) {
    let functionName = javaScriptHelper.extractFunctionName(arg);
    options.prefixes = this.properties.prefixes.concat(functionName || "anonymous");
  } else if (_.isObjectLike(arg)) {
    // Prefix
    if (_.isString(arg.prefixes)) {
      options.prefixes = this.properties.prefixes.concat(arg.prefixes);
    } else if (_.isFunction(arg.prefixes)) {
      let functionName = javaScriptHelper.extractFunctionName(arg.prefixes);
      options.prefixes = this.properties.prefixes.concat(functionName || "anonymous");
    } else if (_.isArray(arg.prefixes)) {
      let prefixes = _.filter(arg.prefixes, prefix => _.isString(prefix));
      options.prefixes = this.properties.prefixes.concat(prefixes);
    }

    // Meta data
    if (!_.isNil(arg.metaData)) {
      let metaDataType = _.isString(arg.metaDataType) ? arg.metaDataType.trim().toLowerCase() : "replace";
      if (!(metaDataType === "merge" || metaDataType === "replace")) {
        metaDataType = "replace";
      }

      if (metaDataType === "replace") {
        options.metaData = arg.metaData;
      } else {
        // Try to merge
        options.metaData = this.tryMergeMetaData(this.properties.metaData, arg.metaData);
        if (!options.metaData) {
          options.metaData = {
            __ProxyLogger_mergeError: {
              origin: this.properties.metaData,
              metaData: arg.metaData
            }
          };
        }
      }
    }
  }

  return new ProxyLogger(options);
};

/**
 * Try to merge meta data b in a
 * @param {*} a The origin
 * @param {*} b The one to add
 * @return {*} The new element or undefined if could not do it
 */
ProxyLogger.prototype.tryMergeMetaData = function (a, b) {
  if (typeof a === typeof b) {
    // Same type
    let merge = undefined;
    switch (typeof a) {
      case "function":
        // Generate the new function that will generate both
        merge = function () {
          return _.assign({}, a(), b());
        };
        break;
      case "object":
        merge = _.assign({}, a, b);
        break;
      case "number":
      case "string":
      case "boolean":
        merge = {
          data: [a, b]
        };
        break;
      default:
        // Cannot merge
        break;
    }

    return merge;
  } else if (_.isNil(a)) {
    return b;
  } else if (_.isNil(b)) {
    return a;
  }

  return undefined;
};

Object.defineProperty(ProxyLogger, "levelNamesKnown", {
  writable: false,
  value: {},
  configurable: false
});

/**
 * Remove the definition for the specific
 * @param {string|string[]} levelName The level name
 */
ProxyLogger.unDefineLogLevel = function (levelName) {
  _.each(arguments, function (arg) {
    if (_.isArray(arg)) {
      _.each(arg, function (el) {
        ProxyLogger.unDefineLogLevel(el);
      });
    } else if (_.isString(arg) && ProxyLogger.levelNamesKnown[arg] === true) {
      ProxyLogger.levelNamesKnown[arg] = undefined;
      delete ProxyLogger.levelNamesKnown[arg];
      if (_.isFunction(ProxyLogger.prototype[arg])) {
        ProxyLogger.prototype[arg] = undefined;
        delete ProxyLogger.prototype[arg];
      }
    } else if (_.isObjectLike(arg)) {
      _.each(_.keys(arg), function (el) {
        ProxyLogger.unDefineLogLevel(el);
      });
    }
  });
};

/**
 * Ask the proxy logger to define new level
 * @param {string} levelName The level name
 */
ProxyLogger.defineLogLevel = function (levelName) {
  if (_.isString(levelName) && levelName.trim().length > 0 && _.isUndefined(ProxyLogger.prototype[levelName])) {
    ProxyLogger.levelNamesKnown[levelName] = true;
    ProxyLogger.prototype[levelName] = function () {
      const args = _.concat(levelName, arguments);
      this.log.apply(this, args);
    };
  }
};

/**
 * Create an alias for the specific level. You can add more than 1 alias as the same time
 * @param {string} levelName The level name
 * @param {string} alias The alias name
 */
ProxyLogger.defineLogLevelAlias = function (levelName, alias) {
  if (_.isString(levelName) && levelName.trim().length > 0) {
    let i = 1, l = arguments.length;
    for (; i < l; ++i) {
      if (_.isString(arguments[i]) && arguments[i].trim().length > 0 && _.isUndefined(ProxyLogger.prototype[arguments[i]])) {
        ProxyLogger.levelNamesKnown[arguments[i]] = true;
        ProxyLogger.prototype[arguments[i]] = function () {
          const args = _.concat(levelName, arguments);
          this.log.apply(this, args);
        };
      }
    }
  }
};

/**
 * Define the log level using with syslog
 */
ProxyLogger.defineSysLogLevels = function () {
  // Remove previous definition
  ProxyLogger.unDefineLogLevel(_.keys(ProxyLogger.levelNamesKnown));

  // Add sys log level
  _.each(['emerg', 'alert', 'crit', 'error', 'warning', 'notice', 'info', 'debug'], ProxyLogger.defineLogLevel);
  // Add the alias
  ProxyLogger.defineLogLevelAlias('warning', 'warn');
  ProxyLogger.defineLogLevelAlias('debug', 'silly');
};

/**
 * Define the log level using with winston
 */
ProxyLogger.defineDefaultLogLevels = function () {
  // Remove previous definition
  ProxyLogger.unDefineLogLevel(_.keys(ProxyLogger.levelNamesKnown));

  // Add npm log
  _.each(['error', 'warn', 'info', 'verbose', 'debug', 'silly'], ProxyLogger.defineLogLevel);
  // Add the alias for syslog
  ProxyLogger.defineLogLevelAlias('error', 'emerg', 'alert', 'crit');
  ProxyLogger.defineLogLevelAlias('warn', 'warning', 'notice');
};

ProxyLogger.defineDefaultLogLevels();

exports = module.exports = ProxyLogger;
