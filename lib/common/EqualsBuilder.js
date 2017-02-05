/**
 * Help to test elements
 */


(
  function(root, factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
      define([], function() {
        return factory();
      });
    } else if (typeof exports === 'object') {
      module.exports = factory();
    } else {
      root.EqualsBuilder = factory();
    }
  } (this, function() {


    /**
     * @description Extract keys of the object
     * @param {Object} obj The object to extract property keys
     * @return {string[]} The property keys
     */
    function _extractObjectKeys(obj) {
      var keys = [];

      if (obj instanceof Array) {
        var i = obj.length;
        while (--i >= 0) {
          keys.push(i);
        }
      } else if (typeof obj === 'object' && obj !== null) {
        var key;
        for (key in obj) {
          keys.push(key);
        }
      }

      return keys;
    }

    /**
     * Check if the value is a function
     * @param {*} arg The element to test
     * @returns {boolean} true if function, otherwise false
     * @private
     */
    function _isFunction(arg) {
      return typeof arg === 'function';
    }

    /**
     * Check if the value is an array
     * @param {*} arg The element to test
     * @returns {boolean} true if array, otherwise false
     * @private
     */
    function _isArray(arg) {
      return arg instanceof Array;
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

      if (value1 !== null && typeof value1 === 'object') {
        return _equalsObject(value1, value2);
      }

      return false;
    }

    /**
     * Builder that help you to check element
     * @constructor
     */
    function EqualsBuilder() {

    }

    /**
     * Add element into the check
     * @param {*} arg1 The first element
     * @param {*} arg2 The second element
     */
    EqualsBuilder.prototype.append = function (arg1, arg2) {

    };



  })
);

