/**
 * Unit test for the main of the module
 */

const main = require('../../index');

const _ = require('lodash')
;

describe("Unit Test - index.js", function () {
  describe("When require", function () {
    it("Must be a function", function () {
      expect(main).toEqual(jasmine.any(Function));
    });

    // Create the it for all exception
    const expectedFunctions = [
      'InitializableObject',
      'BaseObject',
      'ConnectableObject',
      'LoadableObject',
      'ProxyLogger',
      'exceptions',
      'DependencyEntry',
      'DependencyManager'
    ];
    _.each(expectedFunctions, function (fnName) {
      it("Must contains '" + fnName + "' as 'Function'", function () {
        expect(main[fnName]).toEqual(jasmine.any(Function));
      });
    });

    const expectedSubModules = [
      'exceptions',
      'common',
      'mocks',
      'services'
    ];
    _.each(expectedSubModules, function (moduleName) {
      it("Must contains sub module '" + moduleName + "' as 'Function'", function () {
        expect(main[moduleName]).toEqual(jasmine.any(Function));
      });
    });
  }); // End when require
});
