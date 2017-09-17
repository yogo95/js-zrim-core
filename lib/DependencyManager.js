/**
 * A simple dependency manager to share dependency across the application
 */

const DependencyEntry = require("./DependencyEntry"),
  BaseObject = require("./BaseObject"),
  _ = require("lodash"),
  util = require("util")
  ;


/**
 * A simple dependency manager.
 * @implements {BaseObject}
 * @constructor
 */
function DependencyManager() {
  if (!(this instanceof DependencyManager)) {
    return new Function.prototype.bind.apply(DependencyManager, Array.prototype.concat.apply([null], arguments))();
  }

  BaseObject.apply(this, arguments);

  this.properties.dependencies = [];
  this.properties.dependencyIndexes = {
    byName: {}
  };
}

BaseObject._applyPrototypeTo(DependencyManager, {
  signals: {
    dependencyRemoved: "dependencyRemoved",
    dependencyAdded: "dependencyAdded",
    dependencyReplaced: "dependencyReplaced"
  }
});

/**
 * Refresh all indexes
 * @private
 */
DependencyManager.prototype._refreshIndexes = function () {
  // Clear dependencies
  this._removeIndexes();
  _.each(this.properties.dependencies, (dependency, index) => {
    this._registerIndex(dependency, index);
  });
};

/**
 * Remove all indexes
 * @private
 */
DependencyManager.prototype._removeIndexes = function () {
  this.properties.dependencyIndexes = {
    byName: {}
  };
};

/**
 * Register the index
 * @param {DependencyEntry} entry The entry to register
 * @param {number} index The index in the list
 * @throw {Error} If something wrong append
 */
DependencyManager.prototype._registerIndex = function (entry, index) {
  if (!(entry instanceof DependencyEntry)) {
    throw new TypeError(util.format("Invalid entry type"));
  } else if (!_.isNumber(index)) {
    throw new TypeError(util.format("Invalid type '%s' for index", typeof index));
  }

  this.properties.dependencyIndexes.byName[entry.name] = index;
};

/**
 * Remove the index
 * @param {DependencyEntry} entry The entry to register
 * @param {number} index The index in the list
 * @throw {Error} If something wrong append
 */
DependencyManager.prototype._removeIndex = function (entry, index) {
  if (!(entry instanceof DependencyEntry)) {
    throw new TypeError(util.format("Invalid entry type"));
  } else if (!_.isNumber(index)) {
    throw new TypeError(util.format("Invalid type '%s' for index", typeof index));
  }

  // Remove the property
  delete this.properties.dependencyIndexes.byName[entry.name];
};

/**
 * Find the index of the entry by the dependency name
 * @param {string} name
 * @return {number} The index of the entry or -1 if not found
 */
DependencyManager.prototype.findIndexByName = function (name) {
  if (!this.isValidName(name)) {
    return -1;
  }

  name = this.formatDependencyName(name);
  return _.isNumber(this.properties.dependencyIndexes.byName[name]) ? this.properties.dependencyIndexes.byName[name] : -1;
};

/**
 * Try to find the dependency
 * @param {*} arg The argument to find the index
 * @return {number} The index if found otherwise -1
 */
DependencyManager.prototype.indexOf = function (arg) {
  if (this.isValidName(arg)) {
    return this.findIndexByName(arg);
  } else if (arg instanceof DependencyEntry) {
    return this.findIndexByName(arg.name);
  }

  return -1;
};

/**
 * Format the name
 * @param {string} name The name to format
 * @return {string} The name formatted
 * @throw {TypeError} If the name is invalid
 */
DependencyManager.prototype.formatDependencyName = function (name) {
  return DependencyEntry.formatName(name);
};

/**
 * Test if the name is valid
 * @param {string} name The name to test
 * @return {boolean} true if valid, otherwise false
 */
DependencyManager.prototype.isValidName = function (name) {
  return DependencyEntry.isValidName(name);
};


/**
 * Add the dependency. If the dependency already exists it will replace it
 * @param {string} name The dependency name
 * @param {*} dependency The dependency
 * @throws {Error} If the argument are invalid
 */
DependencyManager.prototype.add = function (name, dependency) {
  if(!this.isValidName(name)) {
    throw new TypeError(util.format("Invalid dependency name"));
  }

  const entry = DependencyEntry.of(name, dependency);
  const currentIndex = this.indexOf(name);
  if (currentIndex >= 0) {
    // remove
    const oldDependency = this.properties.dependencies[currentIndex].dependency;
    this.properties.dependencies[currentIndex] = entry;
    this.emit(DependencyManager.Signals.dependencyReplaced, entry.name, dependency, oldDependency);
  } else {
    const newIndex = this.properties.dependencies.length;
    this.properties.dependencies.push(entry);
    this._registerIndex(entry, newIndex);
    this.emit(DependencyManager.Signals.dependencyAdded, entry.name, entry.dependency, entry);
  }
};

/**
 * Replace the dependency by the new one
 * @param {string} old The dependency name
 * @param {string} name The new name
 * @param {*} dependency The dependency
 * @throws {Error} If the argument are invalid
 */
DependencyManager.prototype.replace = function (old, name, dependency) {
  if(!this.isValidName(old)) {
    throw new TypeError(util.format("Invalid old dependency name"));
  } else if(!this.isValidName(name)) {
    throw new TypeError(util.format("Invalid dependency name"));
  }

  // Remove the old dependency
  this.remove(old);
  this.add(name, dependency);
};

/**
 * Remove the dependency
 * @param {string} name The dependency name
 */
DependencyManager.prototype.remove = function (name) {
  const index = this.indexOf(name);
  if (index >= 0) {
    const entry = this.properties.dependencies[index];
    _.remove(this.properties.dependencies, (value, elementIndex) => index === elementIndex);
    this.emit(DependencyManager.Signals.dependencyRemoved, entry.name, entry.dependency, entry);
    this._refreshIndexes();
  }
};

/**
 * Test if the dependency exists
 * @param {string} name The dependency name
 * @return {boolean} true if exists, otherwise false
 */
DependencyManager.prototype.contains = function (name) {
  return this.indexOf(name) >= 0;
};


/**
 * @typedef {Object} DependencyManager.containAll~Returns
 * @property {{names: string[]}} found The dependency that exists
 * @property {{names: string[]}} notFound The dependencies not found
 */
/**
 * Test if the dependencies exist
 * @param {string|string[]} names The dependency names
 * @return {DependencyManager.containAll~Returns} The container
 */
DependencyManager.prototype.containAll = function (names) {
  const response = {
    found: {
      names: []
    },
    notFound: {
      names: []
    }
  };

  if (!_.isArray(names)) {
    names = [names];
  }

  _.each(names, name => {
    if (this.contains(name)) {
      response.found.names.push(name);
    } else {
      response.notFound.names.push(name);
    }
  });

  return response;
};

/**
 * Returns the dependency
 * @param {string} name The dependency name
 * @param {*} [defaultValue] The default value
 * @return {*} The dependency if exists, otherwise the default value
 */
DependencyManager.prototype.get = function (name, defaultValue) {
  const index = this.indexOf(name);
  return index >= 0 ? this.properties.dependencies[index].dependency : defaultValue;
};

/**
 * Returns dependency name
 * @return {string[]} The dependency name
 */
DependencyManager.prototype.dependencyNames = function () {
  return _.sortBy(_.keys(this.properties.dependencyIndexes.byName));
};

/**
 * Returns all dependencies
 * @return {DependencyEntry[]} The dependencies
 */
DependencyManager.prototype.all = function () {
  return _.concat([], this.properties.dependencies);
};


exports = module.exports = DependencyManager;
