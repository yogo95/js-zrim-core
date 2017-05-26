/**
 * Unit test for StringUtils
 */

var _ = require("lodash");

describe("Unit test - StringUtils", function () {

  var stringUtils = require("../../../../lib/common/StringUtils");

  describe("When require", function () {
    it("Then must return object", function () {
      expect(stringUtils).toEqual(jasmine.any(Object));
    });
  });

  describe("Instance", function () {
    it("Must have the property StringUtils as function", function () {
      expect(stringUtils.StringUtils).toEqual(jasmine.any(Function));
    });
  });

  describe("When is", function () {
    it("Given type not string Then must return false", function () {
      var testsArgs = [
        [],
        [[]],
        [{}],
        [1],
        [true],
        [null]
      ];

      _.each(testsArgs, function (args) {
        expect(stringUtils.is.apply(stringUtils, args)).toBeFalsy();
      });
    });

    it("Given string Then must return true", function () {
      expect(stringUtils.is("")).toBeTruthy();
    });
  }); // When is

  describe("When isEmpty", function () {
    it("Given undefined/null/false Then must return true", function () {
      var testsArgs = [
        [],
        [false],
        [null]
      ];

      _.each(testsArgs, function (args) {
        expect(stringUtils.isEmpty.apply(stringUtils, args)).toBeTruthy();
      });
    });

    it("Given non string Then must return false", function () {
      var testsArgs = [
        [[]],
        [{}],
        [1],
        [true],
      ];

      _.each(testsArgs, function (args) {
        expect(stringUtils.isEmpty.apply(stringUtils, args)).toBeFalsy();
      });
    });

    it("Given non empty string Then must return false", function () {
      expect(stringUtils.isEmpty(" ")).toBeFalsy();
    });

    it("Given empty string Then must return true", function () {
      expect(stringUtils.isEmpty("")).toBeTruthy();
    });
  }); // When isEmpty

  describe("When isNotEmpty", function () {
    it("Given non string Then must return false", function () {
      var testsArgs = [
        [],
        [[]],
        [{}],
        [1],
        [true],
        [null]
      ];

      _.each(testsArgs, function (args) {
        expect(stringUtils.isNotEmpty.apply(stringUtils, args)).toBeFalsy();
      });
    });

    it("Given non empty string Then must return false", function () {
      expect(stringUtils.isNotEmpty("")).toBeFalsy();
    });

    it("Given empty string Then must return true", function () {
      expect(stringUtils.isNotEmpty(" ")).toBeTruthy();
    });
  }); // When isNotEmpty

  describe("When isBlank", function () {
    it("Given undefined/null/false Then must return true", function () {
      var testsArgs = [
        [],
        [null],
        [false]
      ];

      _.each(testsArgs, function (args) {
        expect(stringUtils.isBlank.apply(stringUtils, args)).toBeTruthy();
      });
    });


    it("Given non string Then must return false", function () {
      var testsArgs = [
        [[]],
        [{}],
        [1],
        [true]
      ];

      _.each(testsArgs, function (args) {
        expect(stringUtils.isBlank.apply(stringUtils, args)).toBeFalsy();
      });
    });

    it("Given string non blank Then must return false", function () {
      expect(stringUtils.isBlank("a")).toBeFalsy();
    });

    it("Given blank string Then must return true", function () {
      expect(stringUtils.isBlank("")).toBeTruthy();
      expect(stringUtils.isBlank(" ")).toBeTruthy();
    });
  }); // When isBlank

  describe("When ltrim", function () {
    it("Given non string Then must return the argument", function () {
      var testsArgs = [
        [],
        [[]],
        [{}],
        [1],
        [true],
        [null]
      ];

      _.each(testsArgs, function (args) {
        expect(stringUtils.ltrim.apply(stringUtils, args)).toEqual(args[0]);
      });
    });

    it("Given string without left space Then must return same string", function () {
      expect(stringUtils.ltrim("test  ")).toEqual("test  ");
      expect(stringUtils.ltrim("test")).toEqual("test");
      expect(stringUtils.ltrim("")).toEqual("");
    });

    it("Given string with left space Then must return new string without left space", function () {
      expect(stringUtils.ltrim("  test   ")).toEqual("test   ");
      expect(stringUtils.ltrim("   test")).toEqual("test");
    });
  }); // When ltrim

  describe("When rtrim", function () {
    it("Given non string Then must return the argument", function () {
      var testsArgs = [
        [],
        [[]],
        [{}],
        [1],
        [true],
        [null]
      ];

      _.each(testsArgs, function (args) {
        expect(stringUtils.rtrim.apply(stringUtils, args)).toEqual(args[0]);
      });
    });

    it("Given string without right space Then must return same string", function () {
      expect(stringUtils.rtrim("  test")).toEqual("  test");
      expect(stringUtils.rtrim("test")).toEqual("test");
      expect(stringUtils.rtrim("")).toEqual("");
    });

    it("Given string with right space Then must return new string without right space", function () {
      expect(stringUtils.rtrim("  test   ")).toEqual("  test");
      expect(stringUtils.rtrim("test   ")).toEqual("test");
    });
  }); // When rtrim

  describe("When trim", function () {
    it("Given non string Then must return the argument", function () {
      var testsArgs = [
        [],
        [[]],
        [{}],
        [1],
        [true],
        [null]
      ];

      _.each(testsArgs, function (args) {
        expect(stringUtils.trim.apply(stringUtils, args)).toEqual(args[0]);
      });
    });

    it("Given left space Then must remove it", function () {
      expect(stringUtils.trim(" test")).toEqual("test");
    });

    it("Given right space Then must remove it", function () {
      expect(stringUtils.trim("test ")).toEqual("test");
    });

    it("Given left and right space Then must remove it", function () {
      expect(stringUtils.trim(" test ")).toEqual("test");
    });
  }); // When trim

  describe("When equalsIgnoreCase", function () {
    it("Given non string different Then must return false", function () {
      var testsArgs = [
        [, []],
        [[], {}],
        [{}, []],
        [1, 2],
        [true, false],
        [null, undefined],
        ["", 12],
        [3, ""]
      ];

      _.each(testsArgs, function (args) {
        expect(stringUtils.equalsIgnoreCase.apply(stringUtils, args)).toBeFalsy();
      });
    });

    it("Given non string equal Then must return true", function () {
      var testsArgs = [
        [],
        [1, 1],
        [true, true],
        [null, null]
      ];

      _.each(testsArgs, function (args) {
        expect(stringUtils.equalsIgnoreCase.apply(stringUtils, args)).toBeTruthy();
      });
    });

    it("Given string non equal Then must return false", function () {
      expect(stringUtils.equalsIgnoreCase("azsx", "ZaXs")).toBeFalsy();
    });

    it("Given equal string Then must return true", function () {
      expect(stringUtils.equalsIgnoreCase("QwErTy", "qwerty")).toBeTruthy();
    });
  }); // When equalsIgnoreCase
});
