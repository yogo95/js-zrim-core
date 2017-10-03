/**
 * @description This is a generic manager.<br />
 *  It just helps with properties and function used by multiple function
 */

const util = require('util'),
  _ = require('lodash'),
  EventEmitter = require('events').EventEmitter,
  ProxyLogger = require('./ProxyLogger'),
  defaultLogger = require('./default-logger'),
  javaScriptHelper = require("./common/js-helper").javaScriptHelper;

/**
 * @name BaseObject~Properties
 * @type {Object}
 * @property {Object|undefined} logger The logger
 * @property {string} currentState The current state
 */
/**
 * @description  This is a generic manager.<br />
 *  It just helps with properties and function used by multiple function
 * @property {Object} logger Contains the logger
 * @property {boolean} ignoreSignals Set to <code>true</code> to ignores signals and so the emit function do nothing
 * @property {Object} properties Private properties
 * @property {string} __className Return the class name of the instance
 * @constructor
 */
function BaseObject() {
  if (!(this instanceof BaseObject)) {
    return new (Function.prototype.bind.apply(BaseObject, Array.prototype.concat.apply([null], arguments)))();
  }

  EventEmitter.apply(this, arguments);
  const myFunctionName = javaScriptHelper.extractFunctionNameFromInstance(this);

  // Configure properties object
  this.properties = _.assign(_.merge({}, this.properties), {
    logger: defaultLogger.defaultLogger.getDefaultLogger(myFunctionName),
    currentState: BaseObject.States.None,
    __className: myFunctionName
  });

  this.logger = new ProxyLogger({
    target: this.properties.logger,
    prefixes: myFunctionName
  });

  // Apply the constructor options
  const options = arguments[arguments.length - 1];
  if (_.isObjectLike(options)) {
    this._initFromConstructor(options);
  }
}

util.inherits(BaseObject, EventEmitter);

// Define the property container
Object.defineProperty(BaseObject.prototype, "properties", {
  value: {},
  enumerable: false,
  writable: true
});

Object.defineProperty(BaseObject.prototype, "__className", {
  get: function () {
    return this.properties.__className;
  },
  enumerable: false,
  configurable: true
});

/**
 * @description Signals emit by the object
 * @type {Object}
 * @property {string} ready The manager is ready
 * @property {string} currentStateChanged The current state has changed
 * @property {string} ignoreSignalsChanged The current flag 'ignoreSignals' has changed
 * @property {string} flagChanged The a flag changed
 * @property {string} propertyChanged A property changed
 */
BaseObject.Signals = {
  ready: "ready",
  currentStateChanged: "currentStateChanged",
  ignoreSignalsChanged: "ignoreSignalsChanged",
  flagChanged: "flagChanged",
  propertyChanged: "propertyChanged"
};


/**
 * @description States available for this object. To know if it can be used
 * @type {Object}
 * @property {string} None The object has no state.
 * @property {string} Ready The manage is ready
 */
BaseObject.States = {
  None: "None",
  Ready: "Ready"
};

/**
 * @description Just an empty callback
 */
BaseObject._emptyCallback = function () {

};

Object.defineProperty(BaseObject.prototype, "ignoreSignals", {
  enumerable: false,
  set: function (ignoreSignals) {
    const currentValue = this.ignoreSignals;
    if (currentValue === ignoreSignals) {
      return; // Nothing change
    }
    this.logger.debug("Change flags 'ignoreSignals' from %s to %s", currentValue, ignoreSignals);
    this.properties.ignoreSignals = ignoreSignals;
    EventEmitter.prototype.emit.call(this, BaseObject.Signals.ignoreSignalsChanged, ignoreSignals, currentValue);
    this.emitFlagChanged("ignoreSignals", ignoreSignals, currentValue);
  },
  get: function () {
    return this.properties.ignoreSignals === true;
  }
});

/**
 * Initialize the object during the construction.
 * @param {Object} options Contains options to initialize the object when construct the object
 * @throws {Error} In case of special error that cannot be ignored
 */
BaseObject.prototype._initFromConstructor = function (options) {
  if (!_.isObjectLike(options)) {
    return;
  }

  const loggerTarget = _.get(options, "loggerTarget", undefined);
  if (_.isObject(loggerTarget)) {
    this.logger.target = loggerTarget;
  }
};

/**
 * @description Ask to emit the change of a flag
 * @param {string} flagName The flag name
 * @param {*} newValue The new value
 * @param {*} previousValue The previous value
 */
BaseObject.prototype.emitFlagChanged = function (flagName, newValue, previousValue) {
  EventEmitter.prototype.emit.call(this, BaseObject.Signals.flagChanged, flagName, newValue, previousValue); // Force to send the event
};

/**
 * @description Override the emit from EventEmitter to use the internal flag
 * @see EventEmitter.emit
 * @see BaseObject.ignoreSignals
 */
BaseObject.prototype.emit = function () {
  if (this.ignoreSignals === true) {
    return;
  }

  EventEmitter.prototype.emit.apply(this, arguments);
};

/**
 * @description Create a generic function that validate the states
 * @param {Object} validStates The valid states
 * @return {Function} The generic validation function
 * @private
 */
function _createGenericFunction_isObjectStateValid(validStates) {
  if (!_.isObjectLike(validStates)) {
    validStates = {};
  }

  return function (state) {
    if (!_.isString(state)) {
      return false;
    }

    const key = _.findKey(validStates, function (obj) {
      return obj === state;
    });

    return key !== undefined;
  };
}


/**
 * @description Test if the state is valid for the integration
 * @param {*} state The state to test
 * @return {boolean} <code>true</code> if the state is valid, otherwise <code>false</code>
 */
BaseObject.prototype.isObjectStateValid = _createGenericFunction_isObjectStateValid(BaseObject.States);

// Define the internal property currentState
Object.defineProperty(BaseObject.prototype, "currentState", {
  enumerable: true,
  set: function (newState) {
    const currentState = this.properties.currentState;

    if (currentState === newState) {
      return; // Nothing change
    }
    // Check if valid
    if (this.isObjectStateValid(newState) !== true) {
      return;
    }

    this.logger.debug("Change state from %s to %s", currentState, newState);
    this.properties.currentState = newState;
    this.emit(BaseObject.Signals.currentStateChanged, newState, currentState);
    switch (newState) {
      case BaseObject.States.Ready:
        this.emit(BaseObject.Signals.ready);
        break;
      default:
        break;
    }
  },
  get: function () {
    return this.properties.currentState;
  }
});

/**
 * @description Tells if the manager is ready to use
 * @return {boolean} <code>true</code> if ready, otherwise <code>false</code>
 */
BaseObject.prototype.isReady = function () {
  return this.currentState === BaseObject.States.Ready;
};

/**
 * @typedef {Object} BaseObject._defineProperty~Options
 * @property {Function|undefined} set The set function. If undefined then is read only. Returns 'true' if succeed
 * @property {Function|undefined} get The get function. If undefined then use the generic function and return undefined
 * @property {boolean} enumerable Same as Object.defineProperty. Default is 'false'
 * @property {boolean} configurable Same as Object.defineProperty. Default is 'false'
 */

/**
 * Define a property for the specified constructor
 * @param {Function} constructor The constructor. This will define in the prototype
 * @param {string} publicName The public name
 * @param {BaseObject._defineProperty~Options} options The options
 * @throws {Error} If something goes wrong
 * @private
 */
function _defineProperty(constructor, publicName, options) {
  if (!_.isFunction(constructor)) {
    throw new TypeError(util.format("Invalid constructor type '%s'", (typeof constructor)));
  } else if (!_.isString(publicName) || publicName.trim().length === 0) {
    throw new TypeError(util.format("Invalid public name '%s'", publicName));
  } else if (!_.isObjectLike(options)) {
    throw new TypeError(util.format("Invalid options type '%s'", (typeof options)));
  }

  if (!_.isFunction(options.set) && !_.isNil(options.set)) {
    throw new TypeError(util.format("Invalid options.set type '%s'", (typeof options.set)));
  } else if (!_.isFunction(options.get) && !_.isNil(options.get)) {
    throw new TypeError(util.format("Invalid options.get type '%s'", (typeof options.get)));
  } else if (!_.isBoolean(options.enumerable) && !_.isNil(options.enumerable)) {
    throw new TypeError(util.format("Invalid options.enumerable type '%s'", (typeof options.get)));
  } else if (!_.isBoolean(options.configurable) && !_.isNil(options.configurable)) {
    throw new TypeError(util.format("Invalid options.configurable type '%s'", (typeof options.configurable)));
  }

  function _internalSetter(value) {
    try {
      const previousValue = options.get ? options.get.call(this) : undefined;
      const success = options.set.apply(this, arguments);
      if (success === true) {
        this.emit(BaseObject.Signals.propertyChanged, publicName, value, previousValue);
        this.emit(publicName + 'Changed', value, previousValue);
      }
    } catch (unexpectedError) {
      this.logger.error("[Set:%s][UnexpectedError] %s", publicName, unexpectedError.toString(), unexpectedError);
      throw unexpectedError;
    }
  }

  const propertyDefinition = {
    set: options.set ? _internalSetter : _defineProperty.__default_empty_setter__,
    get: options.get || _defineProperty.__default_empty_getter__,
    enumerable: options.enumerable === true ? true : false,
    configurable: options.configurable === true ? true : false
  };

  Object.defineProperty(constructor.prototype, publicName, propertyDefinition);
}

/**
 * The default empty getter
 * @return {undefined} Returns nothing
 * @private
 */
_defineProperty.__default_empty_getter__ = function () {
  return (void 0);
};

/**
 * The default empty setter
 * @private
 */
_defineProperty.__default_empty_setter__ = function () {
};

/**
 * Define a property for the specified constructor
 * @param {Function} constructor The constructor. This will define in the prototype
 * @param {string} publicName The public name
 * @param {BaseObject._defineProperty~Options} options The options
 * @throws {Error} If something goes wrong
 */
BaseObject._defineProperty = _defineProperty;

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
function _baseInherits(constructor, superConstructor, options) {
  constructor.super_ = superConstructor;
  constructor.prototype = Object.create(superConstructor.prototype, {
    constructor: {
      value: constructor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });

  if (!_.isObjectLike(options)) {
    options = {};
  }

  constructor.States = _.merge({}, superConstructor.States, _.isObjectLike(options.states) ? options.states : {});
  constructor.Signals = _.merge({}, superConstructor.Signals, _.isObjectLike(options.signals) ? options.signals : {});
  constructor._applyPrototypeTo = _createApplyPrototypeTo(constructor);
  constructor._emptyCallback = superConstructor._emptyCallback;
  constructor._defineProperty = superConstructor._defineProperty;

  // Upgrade the function isObjectStateValid
  constructor.prototype.isObjectStateValid = _createGenericFunction_isObjectStateValid(constructor.States);
}

/**
 * @description Create the apply prototype function
 * @param {Function} superConstructor The super constructor
 * @param {Function} [baseFunction] The base function to use
 * @return {Function} The function created
 * @private
 */
function _createApplyPrototypeTo(superConstructor, baseFunction) {
  if (!_.isFunction(baseFunction)) {
    baseFunction = _baseInherits;
  }
  return function (constructor, options) {
    if (!_.isFunction(constructor)) {
      throw new TypeError(util.format("Invalid constructor function"));
    }

    baseFunction(constructor, superConstructor, options);
  };
}

/**
 * @description Utility inherits the child with this base object
 * @param {function} constructor The constructor
 * @property {_applyPrototypeTo~Options} [options] The options to apply
 * @throws {TypeError} If the child class is not a valid input
 */
BaseObject._applyPrototypeTo = _createApplyPrototypeTo(BaseObject);

exports = module.exports = BaseObject;
