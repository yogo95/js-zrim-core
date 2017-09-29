const util = require('util'),
  javaScriptHelper = require("../common/js-helper").javaScriptHelper,
  _ = require('lodash');


/**
 *
 * @constructor
 */
function GenericBaseErrorTemplate() {

}

/**
 * Base error to use with built in javascript error
 * @interface GenericBaseErrorTpl
 * @property {string} name The error name
 * @property {string} message The error message
 * @property {string} stack The stack
 * @property {number} errorNumber The special code number used
 * @property {Error|undefined} cause The cause of the error
 */

/**
 * Make the constructor a base generic error.
 * This will help us to create base generic error from native Javascript Error
 *
 * The function will add attributes in the templates:
 *  - {string} name The error name
 *  - {string} message The error message
 *  - {string} stack The stack
 *  - {number} errorNumber The special code number used
 *  - {Error} cause The cause of the error
 *
 * You can also use in internal the attributes properties to hold your internal data
 *
 * @param {function} errorConstructor The error function constructor
 * @return {function} errorConstructor with prototype updated
 */
GenericBaseErrorTemplate.makeGenericError = function (errorConstructor) {
  if (!_.isFunction(errorConstructor)) {
    throw new TypeError(util.format("%s is not a function.", typeof errorConstructor));
  }

  /**
   * This function is like the main entry for function.
   * Must be called in the function like
   * <YouFunction>.prototype._construct.apply(this, arguments);
   * @see https://www.bennadel.com/blog/2828-creating-custom-error-objects-in-node-js-with-error-capturestacktrace.htm
   * @return {Object} The same instance if called with this or the new instance in case not called with new
   */
  errorConstructor.prototype._construct = function () {
    if (!(this instanceof Error)) {
      // Instance must be an error, if not we create new one
      return new (Function.prototype.bind.apply(errorConstructor, Array.prototype.concat.apply([null], arguments)))();
    }

    // We add the function name
    Error.captureStackTrace(this, this.__proto__.constructor);

    // Configure properties object
    this.properties = _.assign(_.merge({}, this.properties), {
      _name: javaScriptHelper.extractFunctionNameFromInstance(this),
      message: undefined,
      errorNumber: -1
    });

    this._initDefaultProperties();

    const argsLength = arguments.length;
    const options = {
      args: arguments
    };

    if (argsLength > 0) {
      // Check if the first argument is a message
      if (typeof arguments[0] === 'string') {
        options.message = arguments[0];
      }

      // Check if the first or second argument is given options
      if (typeof arguments[0] === 'object' && !(arguments[0] instanceof Error)) {
        options.options = arguments[0];
      } else if (typeof arguments[1] === 'object' && !(arguments[1] instanceof Error)) {
        options.options = arguments[1];
      }

      // Try to get the cause error
      if (arguments[argsLength - 1] instanceof Error) {
        options.cause = arguments[argsLength - 1];
      }
    }

    // Call the internal initializer
    this._initFromConstructor(options);
    return this;
  };

  // Define the property container
  Object.defineProperty(errorConstructor.prototype, "properties", {
    value: {},
    enumerable: false,
    writable: true
  });

  Object.defineProperty(errorConstructor.prototype, "name", {
    get: function () {
      return this.properties._name;
    },
    enumerable: true,
    configurable: true
  });

  Object.defineProperty(errorConstructor.prototype, "message", {
    get: function () {
      return this.getMessage();
    },
    enumerable: true,
    configurable: true
  });

  Object.defineProperty(errorConstructor.prototype, "errorNumber", {
    get: function () {
      return this.properties.errorNumber;
    },
    enumerable: true,
    configurable: true
  });

  Object.defineProperty(errorConstructor.prototype, "cause", {
    get: function () {
      return this.getCause();
    },
    enumerable: true,
    configurable: true
  });

  /**
   * Returns the message
   * Override this function to generate every time the message
   * @return {string} The message generated
   */
  errorConstructor.prototype.getMessage = function () {
    if (_.isString(this.properties.message) && this.properties.message.length > 0) {
      return this.properties.message;
    }

    const cause = this.getCause();
    let message;
    if (cause) {
      if (_.isFunction(cause.getMessage)) {
        message = cause.getMessage();
      } else if (cause instanceof Error) {
        message = cause.message;
      }
    }

    return message || this.getDefaultMessage();
  };

  /**
   * Returns the default message
   * Override this function to have a new default message
   * @return {string} The message generated
   */
  errorConstructor.prototype.getDefaultMessage = function () {
    return "Error";
  };

  /**
   * Returns the cause of the error
   * Override this function to use different cause
   * @return {Error|undefined} The cause of the error
   */
  errorConstructor.prototype.getCause = function () {
    return this.properties.cause;
  };

  /**
   * @inheritDoc
   */
  errorConstructor.prototype.toString = function () {
    return this.name + ": " + this.message;
  };

  /**
   * Initialize default properties.
   * Override this function to add your own properties
   */
  errorConstructor.prototype._initDefaultProperties = function () {

  };

  /**
   * Contains information generating during the construction of the object.
   * @typedef {Object} GenericBaseError._initFromConstructor~Options
   * @property {Arguments} args The input argument given to the constructor
   * @property {Object} options Options given to the constructor (first or second argument)
   * @property {Error} cause The possible cause found the in argument
   * @property {string} message The possible message found in the arguments
   */
  /**
   * Initialize the object during the construction of it (when using a new).
   * Override this function to add new properties or change something
   * @param {GenericBaseError._initFromConstructor~Options} options Options given by the constructor to initialize the object
   */
  errorConstructor.prototype._initFromConstructor = function (options) {
    if (_.isObject(options)) {
      const errorNumber = _.get(options, "options.errorNumber"),
        optionsMessage = _.get(options, "options.message"),
        message = _.get(options, "message"),
        cause = _.get(options, "cause");

      if (_.isNumber(errorNumber)) {
        this.properties.errorNumber = errorNumber;
      }

      if (_.isString(message)) {
        this.properties.message = message;
      }
      if (_.isString(optionsMessage)) {
        this.properties.message = optionsMessage;
      }

      if (cause instanceof Error) {
        this.properties.cause = cause;
      }
    }
  };

  /**
   * @description Create the extend function
   * @param {Function} superConstructor The super constructor
   * @param {Function} [baseFunction] The base function to use
   * @return {Function} The function created
   * @private
   */
  function _createExtendFunction(superConstructor, baseFunction) {
    if (!_.isFunction(baseFunction)) {
      baseFunction = _baseErrorInherits;
    }
    return function (constructor, options) {
      if (!_.isFunction(constructor)) {
        throw new TypeError(util.format("Invalid constructor function"));
      }

      baseFunction(constructor, superConstructor, options);
    };
  }

  /**
   * @typedef {Object} _applyPrototypeTo~Options
   * @description Contains options for the inheritance
   * @property {Object|undefined} states The states to add (key, value)
   * @property {Object|undefined} signals The signals to add (key, value)
   */
  /**
   * @description Generic function to create the inheritance
   * @param {function} constructor The constructor
   * @param {function} superConstructor The super constructor
   * @param {_applyPrototypeTo~Options} [options] The options to apply
   * @private
   */
  function _baseErrorInherits(constructor, superConstructor, options) {
    constructor.super_ = superConstructor;
    constructor.prototype = Object.create(superConstructor.prototype, {
      constructor: {
        value: constructor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });

    constructor.extend = _createExtendFunction(constructor);

    // Override the _construct to have the MyError() return MyError()
    constructor.prototype._construct = function () {
      if (!(this instanceof Error)) {
        return new (Function.prototype.bind.apply(constructor, Array.prototype.concat.apply([null], arguments)))();
      }

      return superConstructor.prototype._construct.apply(this, arguments);
    };
  }

  errorConstructor.extend = _createExtendFunction(errorConstructor);

  return errorConstructor;
};


exports = module.exports = GenericBaseErrorTemplate;
