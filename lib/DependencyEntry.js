/**
 * Entry for dependency manager
 */

const _ = require("lodash"),
  util = require("util")
  ;

/**
 * A dependency entry
 * @property {string} name The dependency name
 * @property {*} dependency The dependency
 * @constructor
 */
function DependencyEntry() {
  if (!(this instanceof DependencyEntry)) {
    return new (Function.prototype.bind.apply(DependencyEntry, Array.prototype.concat.apply([null], arguments)))();
  }
}

/**
 * Create a new entry
 * @param {string} name The name of the dependency
 * @param {*} dependency The dependency
 * @return {DependencyEntry} The entry created
 * @throws {Error} If the dependency cannot be created
 */
DependencyEntry.of = function (name, dependency) {
  if (!_.isString(name)) {
    throw new TypeError(util.format("Invalid name. Type=%s", typeof name));
  }

  const entry = Object.create(DependencyEntry.prototype, {
    name: {
      configurable: false,
      writable: false,
      enumerable: true,
      value: name
    },
    dependency: {
      configurable: false,
      writable: false,
      enumerable: true,
      value: dependency
    }
  });

  return entry;
};

/**
 * Format the name
 * @param {string} name The name to format
 * @return {string} The name formatted
 * @throw {TypeError} If the name is invalid
 */
DependencyEntry.formatName = function (name) {
  if (!_.isString(name)) {
    throw new TypeError(util.format("Invalid type name '%s'. Expected string", typeof name));
  }

  return name.trim();
};

/**
 * Test if the name is valid
 * @param {string} name The name to test
 * @return {boolean} true if valid, otherwise false
 */
DependencyEntry.isValidName = function (name) {
  return _.isString(name) && name.trim().length > 0;
};


exports = module.exports = DependencyEntry;
