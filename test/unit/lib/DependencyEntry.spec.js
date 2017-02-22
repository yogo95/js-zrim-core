/**
 * Unit test for DependencyEntry
 */

const DependencyEntry = require("./../../../lib/DependencyEntry"),
  _ = require("lodash")
  ;

describe("Unit test - DependencyEntry", function () {

  describe("When require the manager", function () {

    it("Must be a function", function () {
      expect(DependencyEntry).toEqual(jasmine.any(Function));
    });
  }); // End when require

  describe("When instantiate", function () {
    it("When not using the new operator Then must return new instance", function () {
      const instance = DependencyEntry();
      expect(instance).toEqual(jasmine.any(DependencyEntry));
    });

    it("When using the new operator must return new instance", function () {
      const instance = DependencyEntry();
      expect(instance).toEqual(jasmine.any(DependencyEntry));
    });
  }); // End of When instantiate

  describe("#formatName", function () {
    it("Given no string Then must throw exception", function () {
      _.each([
        {},
        12,
        false,
        undefined
      ], function (arg) {
        expect(() => DependencyEntry.formatName(arg)).toThrowError();
      });
    });

    it("Given string Then must return expected value", function () {
      expect(DependencyEntry.formatName(" a ")).toEqual("a");
    });
  });

  describe("#isValidName", function () {
    it("Given no string Then must return false", function () {
      _.each([
        {},
        12,
        false,
        undefined
      ], function (arg) {
        expect(DependencyEntry.isValidName(arg)).toBeFalsy();
      });
    });

    it("Given string Then must return expected value", function () {
      expect(DependencyEntry.isValidName(" a ")).toBeTruthy();
    });
  });

  describe("#of", function () {
    it("Given no string Then must throw exception", function () {
      _.each([
        {},
        12,
        false,
        undefined
      ], function (arg) {
        expect(() => DependencyEntry.of(arg, undefined)).toThrowError();
      });
    });

    it("Given string as name and dependency", function () {
      const dependency = {},
        name = "az",
        entry = DependencyEntry.of(name, dependency)
        ;

      expect(entry.name).toBe(name);
      expect(entry.dependency).toBe(dependency);
    });
  });
});
