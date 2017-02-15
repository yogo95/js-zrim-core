/**
 * New node file
 */



var global_JavaScriptHelper;

function EqualsBuilder() {
  if (!(this instanceof EqualsBuilder)) {
    return new EqualsBuilder();
  }

  var value = false;

  this.append = function(obj1, obj2) {
    value = global_JavaScriptHelper.equals(obj1, obj2);
    return this;
  };

  Object.defineProperty(this, 'isEqual', {
    enumerable: false,
    get: function() {
      return function() {
        return value;
      };
    },
    set: function() { }
  });
}


/**
 * @description Test if the given value is a function
 * @param {*} value The value to test
 * @return {boolean} <code>true</code> if the given value is a function,
 *  otherwise <code>false</code>
 */
function _isFunction(value) {
  return (typeof value === 'function');
}

/**
 * @description Test if the given value is a string
 * @param {*} value The value to test
 * @return {boolean} <code>true</code> if the given value is a string,
 *  otherwise <code>false</code>
 */
function _isString(value) {
  return (typeof value === 'string');
}

/**
 * @description Test if the given value is undefined
 * @param {*} value The value to test
 * @return {boolean} <code>true</code> if the given value is undefined,
 *  otherwise <code>false</code>
 */
function _isUndefined(value) {
  return value === void 0;
}

/**
 * @description Test if the given value is defined
 * @param {*} value The value to test
 * @return {boolean} <code>true</code> if the given value is defined,
 *  otherwise <code>false</code>
 */
function _isDefined(value) {
  return !_isUndefined(value);
}

/**
 * @description Test if the given value is an object
 * @param {*} value The value to test
 * @return {boolean} <code>true</code> if the given value is an object,
 *  otherwise <code>false</code>
 */
function _isObject(value) {
  return value !== null && (typeof value === 'object');
}

/**
 * @description Test if the given value is a number
 * @param {*} value The value to test
 * @return {boolean} <code>true</code> if the given value is a number,
 *  otherwise <code>false</code>
 */
function _isNumber(value) {
  return (typeof value === 'number');
}

/**
 * @description Test if the given value is an array
 * @param {*} value The value to test
 * @return {boolean} <code>true</code> if the given value is an array,
 *  otherwise <code>false</code>
 */
function _isArray(value) {
  return (value instanceof Array);
}

/**
 * @description Test if the given value is a date
 * @param {*} value The value to test
 * @return {boolean} <code>true</code> if the given value is a date,
 *  otherwise <code>false</code>
 */
function _isDate(value) {
  return (value instanceof Date);
}

/**
 * @description Test if the given value is a boolean
 * @param {*} value The value to test
 * @return {boolean} <code>true</code> if the given value is a boolean,
 *  otherwise <code>false</code>
 */
function _isBoolean(value) {
  return (typeof value === 'boolean');
}

/**
 * @description Test if the given value is NaN
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NaN
 * @param {*} value The value to test
 * @return {boolean} <code>true</code> if the given value is NaN,
 *  otherwise <code>false</code>
 */
function _isNaN(value) {
  return value !== value;
}

/**
 * @description Test if the given value is null
 * @param {*} value The value to test
 * @return {boolean} <code>true</code> if the given value is null,
 *  otherwise <code>false</code>
 */
function _isNull(value) {
  if (value === null) {
    return true;
  } else if (_isObject(value)) {
    if (value.is_null === true ||
      value.nillable === true ||
      value._null === true ||
      value.null_ === true) {
      return true;
    } else if (_isFunction(value.isNull)) {
      return value.isNull() === true;
    } else if (_isFunction(value.null)) {
      return value.null() === true;
    }  else if (_isFunction(value.isnull)) {
      return value.isnull() === true;
    }  else if (_isFunction(value.is_null)) {
      return value.is_null() === true;
    }  else if (_isFunction(value.nillable)) {
      return value.nillable() === true;
    }
  }

  return false;
}

/**
 * @description Test if the given value is undefined or null
 * @param {*} value The value to test
 * @return {boolean} <code>true</code> if the given value is undefined or null,
 *  otherwise <code>false</code>
 */
function _isUndefinedOrNull(value) {
  return value == null;
}

/**
 * @description Test if the given value is a regular expression
 * @param {*} value The value to test
 * @return {boolean} <code>true</code> if the given value is a regular expression,
 *  otherwise <code>false</code>
 */
function _isRegExp(value) {
  return value instanceof RegExp;
}

/**
 * @description Test if the given value is a symbol
 * @param {*} value The value to test
 * @return {boolean} <code>true</code> if the given value is a symbol,
 *  otherwise <code>false</code>
 */
function _isSymbol(value) {
  return (typeof value === 'symbol');
}

/**
 * @description Test if the given value is an error
 * @param {*} value The value to test
 * @return {boolean} <code>true</code> if the given value is an error,
 *  otherwise <code>false</code>
 */
function _isError(value) {
  return (value instanceof Error);
}

/**
 * @description Create a clone of the specific value
 * @param {Object} obj The object to clone
 * @return {Object} The clone
 */
var _cloneObject = (function () {
  function TempObjectForClone() {}

  return function baseCloneObject(obj) {
    if (obj === null) {
      return obj;
    }

    TempObjectForClone.prototype = obj.prototype;
    var clone = new TempObjectForClone();
    TempObjectForClone.prototype = undefined;

    var propertyKey;
    for (propertyKey in obj) {
      clone[propertyKey] = _clone(obj[propertyKey]);
    }

    return clone;
  };
} ());

/**
 * @description Clone the given array
 * @param {Array} array The value to clone
 * @return {Array} The array cloned
 */
function _cloneArray(array) {
  var i = array.length;
  var clone = [];
  while (--i >= 0) {
    clone[i] = array[i];
  }

  return clone;
}

/**
 * @description Clone the given value
 * @param {*} value The value to clone
 * @return {*} The value cloned
 */
function _clone(value) {
  var type = typeof value;

  if (type === 'undefined') {
    return undefined;
  } else if (type === 'string' ||
    type === 'number' ||
    type === 'boolean' ||
    type === 'symbol' ||
    type === 'function' ||
    value === null) {
    return value;
  }

  if (value instanceof Array) {
    return _cloneArray(value);
  } else if (value instanceof Date) {
    return new Date(value.getTime());
  }

  if (type === 'object') {
    if (_isFunction(value.clone)) {
      return value.clone();
    } else {
      return _cloneObject(value);
    }
  }

  throw new TypeError("Clone not supported for this value");
}


/**
 * @description Returns the function name
 * @see http://stackoverflow.com/questions/2648293/javascript-get-function-name (70)
 * @param {string} str The source code function
 * @return {string|undefined} The name found or undefined
 * @private
 */
function _extractFunctionNameFromString(str) {
  // Match:
  // - ^          the beginning of the string
  // - function   the word 'function'
  // - \s+        at least some white space
  // - ([\w\$]+)  capture one or more valid JavaScript identifier characters
  // - \s*        optionally followed by white space (in theory there won't be any here,
  //              so if performance is an issue this can be omitted[1]
  // - \(         followed by an opening brace
  //
  var result = /^function\s+([\w$]*)\s*\(/.exec(str);

  return result ? result[1] : undefined;
}

/**
 * @description Extract the function name
 * @param {Function} fn The function
 * @return {string} The function name found
 * @private
 */
function _extractFunctionNameFromFunction(fn) {
  if (fn) {
    if (fn.name) {
      return fn.name;
    } else {
      var name = _extractFunctionNameFromString(fn.toString());
      return name ? name : '';
    }
  }

  return '';
}

/**
 * @description Try to extract the function name from the instance object
 * @param {Object} instance The object
 * @return {string} The name extracted
 * @private
 */
function _extractFunctionNameFromInstance(instance) {
  if (!instance) {
    return '';
  }

  if (instance.__proto__ && instance.__proto__.constructor) {
    return _extractFunctionNameFromFunction(instance.__proto__.constructor);
  }

  return '';
}

/**
 * Contains utility
 * @return {JavaScriptHelper} The instance created or the global one
 * @constructor
 */
function JavaScriptHelper() {
  if (!(this instanceof JavaScriptHelper)) {
    // Return the global instance
    return global_JavaScriptHelper;
  }
}

Object.defineProperty(JavaScriptHelper.prototype, 'EqualsBuilder', {
  enumerable: false,
  get: function() {
    return EqualsBuilder;
  },
  set: function() { }
});


JavaScriptHelper.prototype.extractFunctionName = _extractFunctionNameFromFunction;
JavaScriptHelper.prototype.extractFunctionNameFromInstance = _extractFunctionNameFromInstance;


JavaScriptHelper.prototype.isEmpty = function(value) {
  if (value === true) {
    return true;
  } else if (typeof value === 'string') {
    return value.length === 0;
  } else if (value instanceof Array) {
    return value.length === 0;
  } else if (value === 1) {
    return true;
  }

  // TODO [ENYC] Test the type object

  return false;
};

JavaScriptHelper.prototype.isEmptyString = function(value) {
  return !(this.isString(value) && value.length > 0);
};

JavaScriptHelper.prototype.stringEqualsIgnoreCase = function(str1, str2) {
  if (str1 === str2) {
    return true;
  } else if (typeof str1 === 'string' && typeof str2 === 'string') {
    return str1.toLowerCase() === str2.toLowerCase();
  } else {
    return false;
  }
};



JavaScriptHelper.prototype.println = function(value) {
  console.log(value);
};

/**
 * Test si la classe {@code clsTest} hérite de la classe {@code clsParent}.
 *  Si c'est la même classe alors c'est aussi valide.
 * @param clsTest La classe à tester
 * @param clsParent La classe parente
 * @return {Boolean} {@code true} si est la même ou hérite, sinon {@code false}
 */
JavaScriptHelper.prototype.inherits = function(clsTest, clsParent) {
  if (clsTest === clsParent) {
    return true;
  } else if (typeof clsTest === 'function' && typeof clsParent === 'function') {
    var parent = clsTest.prototype ? clsTest.prototype.parent : undefined;
    while (typeof parent === 'function') {
      if (parent === clsParent) {
        return true;
      }

      parent = parent.prototype ? parent.prototype.parent : parent.prototype;
    }

    return false;
  } else {
    return false;
  }
};

/**
 * Help you to deal with old format callback and promise one.
 * @param {Function} successCallback The success/resolve callback
 * @param {Function} oldCallbackFormat The old callback format
 * @param {*} [arg] The argument to call with
 */
JavaScriptHelper.prototype.promiseResolveAndCallback = function (successCallback, oldCallbackFormat, arg) {
  // By doing the test we a re sure that the arguments.length will be 0
  if (arguments.length > 2) {
    if (_isFunction(successCallback)) {
      successCallback(arg);
    }
    if (_isFunction(oldCallbackFormat)) {
      oldCallbackFormat(undefined, arg);
    }
  } else {
    if (_isFunction(successCallback)) {
      successCallback();
    }
    if (_isFunction(oldCallbackFormat)) {
      oldCallbackFormat();
    }
  }
};

/**
 * This utility will generate a function that help you to work will promise and all callback format
 * @param {Function} failureCallback The failure/reject callback
 * @param {Function} oldCallbackFormat The old callback format
 * @param {*} [arg] The argument to call with
 */
JavaScriptHelper.prototype.promiseRejectAndCallback = function (failureCallback, oldCallbackFormat, arg) {
  // By doing the test we a re sure that the arguments.length will be 0
  if (arguments.length > 2) {
    if (_isFunction(failureCallback)) {
      failureCallback(arg);
    }
    if (_isFunction(oldCallbackFormat)) {
      oldCallbackFormat(arg);
    }
  } else {
    if (_isFunction(failureCallback)) {
      failureCallback();
    }
    if (_isFunction(oldCallbackFormat)) {
      oldCallbackFormat();
    }
  }
};


// --------------------------
// create the global instance
global_JavaScriptHelper = new JavaScriptHelper();


exports = module.exports = JavaScriptHelper;
