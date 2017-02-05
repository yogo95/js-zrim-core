/**
 * A proxy logger to add prefix in the string argument
 */

var _ = require('lodash');

/**
 * @typedef {Object} ProxyLogger~Properties
 * @description Contains the initialization
 * @property {Object|undefined} target The logger
 * @property {string|undefined} prefixLog The log prefix
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
 * @private
 */
function ProxyLogger(options) {
    if (!(this instanceof ProxyLogger)) {
        return new(Function.prototype.bind.apply(ProxyLogger, Array.prototype.concat.apply([null], arguments)));
    }

    // Configure properties object
    this.properties = _.assign(_.merge({}, this.properties), {
        target: undefined,
        prefixLog: undefined
    });

    if (options && _.isString(options.prefixLog)) {
        this.properties.prefixLog = options.prefixLog;
    }
    if (options && _.isObjectLike(options.target)) {
        this.properties.target = options.target;
    }
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
 * @description Base function to log something. It will call the real log function
 */
ProxyLogger.prototype.log = function (levelName) {
    if (typeof levelName !== 'string') {
        return;
    }

    if (this.properties.target && _.isFunction(this.properties.target[levelName])) {
        // Add in the first argument the name of the manager
        var args = _.slice(arguments, 1);
        // Check if we have the instance name
        if (this.properties.prefixLog) {
            if (args.length > 0 && _.isString(args[0])) {
                if (args[0][0] === '[') {
                    args[0] = "[" + this.properties.prefixLog + "]" + args[0];
                } else {
                    args[0] = "[" + this.properties.prefixLog + "] " + args[0];
                }
            }
        }

        this.properties.target[levelName].apply(this.properties.target, args);
    }
};

/**
 * @description Help to know if the debug mode is enable when you'd like to log a huge amount of data only in debug mode
 * @return {boolean}
 */
ProxyLogger.prototype.isDebugEnabled = function () {
    if (this.properties.target && this.properties.target.level === 'debug') {
        return true;
    }

    return false;
};

_.each(['debug', 'info', 'warn', 'error', 'fatal', 'critical'], function (levelName) {
    ProxyLogger.prototype[levelName] = function () {
        var args = _.concat(levelName, arguments);
        this.log.apply(this, args);
    };
});

exports = module.exports = ProxyLogger;
