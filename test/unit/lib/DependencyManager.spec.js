/**
 * Unit test for DependencyManager
 */

const DependencyManager = require("./../../../lib/DependencyManager"),
  _ = require("lodash")
  ;

describe("Unit test - DependencyManager", function () {

  describe("When require the manager", function () {

    it("Must be a function", function () {
      expect(DependencyManager).toEqual(jasmine.any(Function));
    });
  }); // End when require

});
