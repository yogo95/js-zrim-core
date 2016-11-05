/**
 * New node file
 */

(function(root, factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
        define([], function() {
            return factory();
        });
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else if (Qt && typeof Qt === 'object') {
        if (!Qt.fr) { Qt.fr = {}; }
        if (!Qt.fr.ista) { Qt.fr.ista = {}; }
        if (!Qt.fr.ista.core) { Qt.fr.ista.core = {}; }
        if (Qt.fr.ista.core.JavaScriptHelper) { return; }

        Qt.fr.ista.core.JavaScriptHelper = factory();
    } else {
        root.JavaScriptHelper = factory();
    }
}(this, function() {

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
            value._null === true ||
            value.null_ === true) {
          return true;
        } else if (_isFunction(value.isNull)) {
          return value.isNull();
        } else if (_isFunction(value.null)) {
          return value.null();
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
    function _isRegex(value) {
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
     * @description Test if the 2 arrays are equal
     * @param {Array} array1 The first array
     * @param {Array} array2 The second array
     * @return {boolean} <code>true</code> if equals, otherwise, <code>false</code>
     */
    function _equalsArray(array1, array2) {
      if (array1.length !== array2.length) {
        return false;
      }
      
      var i = array1.length;
      while (--i >= 0) {
        if (!this.equals(array1[i], array1[i])) {
          return false;
        }
      }
      
      return true;
    }
    
    /**
     * @description Test the 2 object
     * @param {Object} obj1 The first object
     * @param {Object} obj2 The second object
     * @return {boolean} <code>true</code> if equals, otherwise, <code>false</code>
     */
    function _equalsObject(obj1, obj2) {
      if (_isFunction(obj1.equals)) {
        return obj1.equals(obj2);
      } else if (_isFunction(obj1.isEquals)) {
        return obj1.isEquals(obj2);
      } else if (_isFunction(obj2.equals)) {
        return obj2.equals(obj1);
      } else if (_isFunction(obj2.isEquals)) {
        return obj2.isEquals(obj1);
      }
      
      // Test by properties
      var keys1 = _extractObjectKeys(obj1), keys2 = _extractObjectKeys(obj2);
      if (keys1.length !== keys2.length) {
        return false;
      }
      
      // Check keys
      var i = keys1.length, j = 0;
      while (--i >= 0) {
        if (keys2.indexOf(keys1[i]) < 0) {
          return false;
        }
      }
      
      i = keys1.length;
      while (--i >= 0) {
        if (!_equals(obj1[keys1[i]], obj2[keys1[i]])) {
          return false;
        }
      }
      
      return true;
    }
    
    /**
     * @description Test if the 2 elements are equal
     * @param {*} value1 The first value
     * @param {*} value2 The second value
     * @return {boolean} <code>true</code> if equals, otherwise, <code>false</code>
     */
    function _equals(value1, value2) {
      if (value1 === value2) {
        return true;
      }
      
      if (_isArray(value1) || _isArray(value2)) {
        if (_isArray(value1) && _isArray(value2)) {
          return _equalsArray(value1, value2);
        }
        
        return false;
      }
      
      if (typeof value1 !== typeof value2) {
        return false;
      }
      
      if (_isObject(value1)) {
        return _equalsObject(value1, value2);
      }
      
      return false;
    }
    
    /**
     * @description Extract keys of the object
     * @param {Object} obj The object to extract property keys
     * @return {string[]} The property keys
     */
    function _extractObjectKeys(obj) {
      var keys = [];
      
      if (_isArray(obj)) {
        var i = obj.length;
        while (--i >= 0) {
          keys.push(i);
        }
      } else if (_isObject(obj)) {
        var key;
        for (key in obj) {
          keys.push(key);
        }
      }
      
      return keys;
    }



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

    JavaScriptHelper.prototype.isFunction = function(value) {
        return (typeof value === 'function');
    };

    JavaScriptHelper.prototype.isString = function(value) {
        return (typeof value === 'string');
    };

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
    }

    JavaScriptHelper.prototype.isNull = function(value) {
        if (value === null) {
            return true;
        } else if (typeof value === 'object') {
            if (value.is_null === true ||
                    this.isFunction(value.isNull) ||
                    value._null === true ||
                    value.null_ === true) {
                return true;
            }
        }

        return false;
    };



    JavaScriptHelper.prototype.println = function(value) {
        console.log(value);
    };

    /**
     * Test si la classe {@code clsTest} hérite de la classe {@code clsParent}.
     *  Si c'est la même classe alors c'est aussi valide.
     * @param clsTest La classe à tester
     * @param clsParent La classe parente
     * @return {@code true} si est la même ou hérite, sinon {@code false}
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


    // --------------------------
    // create the global instance
    global_JavaScriptHelper = new JavaScriptHelper();


    return JavaScriptHelper;
}));
