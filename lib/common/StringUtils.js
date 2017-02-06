/**
 * Contains utils for string
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
      root.StringUtils = factory();
    }
  } (this, function() {

    /**
     * Test if the value is a string
     * @param {*} value The value to test
     * @returns {boolean} true if a string, otherwise false
     */
    function _isString(value) {
      return typeof value === 'string';
    }

    /**
     * @description Contains utilities for string
     * @returns
     */
    function StringUtils() {

    }

    Object.defineProperty(StringUtils.prototype, "StringUtils", {
      writable: false,
      enumerable: false,
      value: StringUtils
    });

    /**
     * Test if the value is a string
     * @param {*} value The value to test
     * @returns {boolean} true if a string, otherwise false
     */
    StringUtils.prototype.is = _isString;

    /**
     * Test if the value is an empty string
     * @param {*} str The value to check
     * @returns {boolean} true if empty, otherwise false
     */
    StringUtils.prototype.isEmpty = function (str) {
      return _isString(str) && str.length === 0;
    };

    /**
     * Test if the value is not an empty string.
     * @param {*} str The value to check
     * @returns {boolean} true if not an empty string, otherwise false. If str is not a string returns false
     */
    StringUtils.prototype.isNotEmpty = function (str) {
      return _isString(str) && str.length > 0;
    };

    /**
     * Check if the string is empty. But ignore spaces
     * @param {string} str The string to check
     * @return {boolean} true if blank, otherwise false
     */
    StringUtils.prototype.isBlank = function (str) {
      if (!_isString(str)) {
        return false;
      }

      return str.trim().length === 0;
    };

    /**
     * Remove space from the left
     * @see StringUtils.rtrim
     * @see StringUtils.trim
     * @param {string} str The string to remove left spaces
     * @returns {string} The new string
     */
    StringUtils.prototype.ltrim = function (str) {
      if (!_isString(str)) {
        return str;
      }

      var i = 0, l = str.length;
      while (i < l) {
        if (str[i] !== ' ') {
          break;
        }

        ++i;
      }

      if (i === l) {
        return str;
      }

      var newValue = str.substr(i);
      return newValue;
    };

    /**
     * Remove space from the right
     * @see StringUtils.ltrim
     * @see StringUtils.trim
     * @param {string} str The string to remove right spaces
     * @returns {string} The new string
     */
    StringUtils.prototype.rtrim = function (str) {
      if (!_isString(str)) {
        return str;
      }

      var i = str.length;
      while (--i >= 0) {
        if (str[i] !== ' ') {
          break;
        }
      }

      if (i < 0) {
        return str;
      }

      var newValue = str.substring(0, i + 1);
      return newValue;
    };

    /**
     * Remove space from left an right
     * @see StringUtils.ltrim
     * @see StringUtils.rtrim
     * @param  {string} str The string
     * @returns {string} The new string
     */
    StringUtils.prototype.trim = function (str) {
      return _isString(str) ? str.trim() : str;
    };

    /**
     * Test if the 2 strings are equals in insensitive case
     * @param {string} str1 The first string
     * @param {string} str2 The second string
     * @returns {boolean} true if equals, otherwise false
     */
    StringUtils.prototype.equalsIgnoreCase = function (str1, str2) {
      if (str1 === str2) {
        return true;
      } else if (_isString(str1) && _isString(str2)) {
        return str1.toLowerCase() === str2.toLowerCase();
      } else {
        return false;
      }
    };

    return new StringUtils();
  })
);
