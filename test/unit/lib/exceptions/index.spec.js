/**
 * Unit test : File that contains all exceptions
 */

const exceptions = require('../../../../lib/exceptions/index');

const _ = require('lodash');

describe("Unit Test - exceptions/index.js", function () {
  describe("When require", function () {
    it("Must be a function", function () {
      expect(exceptions).toEqual(jasmine.any(Function));
    });

    // Create the it for all exception
    const expectedExceptions = [
      'IllegalStateException'
    ];
    _.each(expectedExceptions, function (exceptionName) {
      it("Must contains '" + exceptionName + "' as 'Function'", function () {
        expect(exceptions[exceptionName]).toEqual(jasmine.any(Function));
      });
    });
  }); // End when require
});
