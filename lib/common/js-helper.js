
const _ = require('lodash');

/**
 * Test if the given value is null
 * @param {*} value The value to test
 * @return {boolean} <code>true</code> if the given value is null,
 *  otherwise <code>false</code>
 */
function _isNil(value) {
  if (value === null || value === (void 0) || isNaN(value)) {
    return true;
  } else if (_.isObjectLike(value)) {
    if (value.is_null === true ||
      value.nillable === true ||
      value._null === true ||
      value.null_ === true) {
      return true;
    } else if (_.isFunction(value.isNull)) {
      return value.isNull() === true;
    } else if (_.isFunction(value.null)) {
      return value.null() === true;
    }  else if (_.isFunction(value.isnull)) {
      return value.isnull() === true;
    }  else if (_.isFunction(value.is_null)) {
      return value.is_null() === true;
    }  else if (_.isFunction(value.nillable)) {
      return value.nillable() === true;
    }
  }

  return false;
}

/**
 * Create a clone of the specific value
 * @param {Object} obj The object to clone
 * @return {Object} The clone
 */
const _cloneObject = function () {
  function TempObjectForClone() {}

  return function baseCloneObject(obj) {
    if (obj === null) {
      return obj;
    }

    TempObjectForClone.prototype = obj.prototype;
    const clone = new TempObjectForClone();
    TempObjectForClone.prototype = undefined;

    for (let propertyKey in obj) {
      clone[propertyKey] = _clone(obj[propertyKey]);
    }

    return clone;
  };
}();

/**
 * Clone the given array
 * @param {Array} array The value to clone
 * @return {Array} The array cloned
 */
function _cloneArray(array) {
  let i = array.length;
  const clone = [];
  while (--i >= 0) {
    clone[i] = _clone(array[i]);
  }

  return clone;
}

/**
 * Clone the given value
 * @param {*} value The value to clone
 * @return {*} The value cloned
 */
function _clone(value) {
  const type = typeof value;

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
    if (_.isFunction(value.clone)) {
      return value.clone();
    } else {
      return _cloneObject(value);
    }
  }

  throw new TypeError("Clone not supported for this value");
}


/**
 * Returns the function name
 * @see http://stackoverflow.com/questions/2648293/javascript-get-function-name (70)
 * @param {string} str The source code function
 * @return {string|undefined} The name found or undefined
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
  const result = /^function\s+([\w$]*)\s*\(/.exec(str);

  return result ? result[1] : undefined;
}

/**
 * Extract the function name
 * @param {Function} fn The function
 * @return {string} The function name found
 */
function _extractFunctionNameFromFunction(fn) {
  if (fn) {
    if (fn.name) {
      return fn.name;
    } else {
      const name = _extractFunctionNameFromString(fn.toString());
      return name ? name : '';
    }
  }

  return '';
}

/**
 * Try to extract the function name from the instance object
 * @param {Object} instance The object
 * @return {string} The name extracted
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
 * Contains utility functions
 * @constructor
 */
function JavaScriptHelper() {
  if (!(this instanceof JavaScriptHelper)) {
    return new (Function.prototype.bind.apply(JavaScriptHelper, Array.prototype.concat.apply([null], arguments)))();
  }


}

/**
 * Test si la classe {@code clsTest} hérite de la classe {@code clsParent}.
 *  Si c'est la même classe alors c'est aussi valide.
 * @param clsTest La classe à tester
 * @param clsParent La classe parente
 * @return {Boolean} true si est la même ou hérite, sinon false
 */
JavaScriptHelper.prototype.inherits = function (clsTest, clsParent) {
  if (clsTest === clsParent) {
    return true;
  } else if (typeof clsTest === 'function' && typeof clsParent === 'function') {
    let parent = clsTest.prototype ? clsTest.prototype.parent : undefined;
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
 * Check if the value is empty (Array, String, Boolean, Other)
 * This function also able to check an object with the property:
 * <ul>
 *  <li>empty : If true then is empty, if function and the result is true</li>
 *  <li>isEmpty : If true then is empty, if function and the result is true</li>
 * </ul>
 * @param value
 * @return {boolean}
 */
JavaScriptHelper.prototype.isEmpty = function (value) {
  if (value === true) {
    return true;
  } else if (typeof value === 'string') {
    return value.length === 0;
  } else if (value instanceof Array) {
    return value.length === 0;
  } else if (value === 1) {
    return true;
  } else if (_.isObjectLike(value)) {
    if (value.empty === true) {
      return true;
    } else if (_.isFunction(value.empty)) {
      return value.empty() === true;
    } else if (value.isEmpty === true) {
      return true;
    } else if (_.isFunction(value.isEmpty)) {
      return value.isEmpty() === true;
    }
  }

  return false;
};

JavaScriptHelper.prototype.isNill = _isNil;
JavaScriptHelper.prototype.clone = _clone;
JavaScriptHelper.prototype.extractFunctionName = _extractFunctionNameFromFunction;
JavaScriptHelper.prototype.extractFunctionNameFromInstance = _extractFunctionNameFromInstance;


module.exports.JavaScriptHelper = exports.JavaScriptHelper = JavaScriptHelper;
module.exports.javaScriptHelper = exports.javaScriptHelper = new JavaScriptHelper();
