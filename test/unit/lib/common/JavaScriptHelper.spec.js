/**
 * Unit test for JavaScriptHelper
 * @author NEGRO, Eric
 */

var JavaScriptHelper = require("./../../../../lib/common/JavaScriptHelper");

var _ = require("lodash");

describe("Unit test JavaScriptHelper", function () {

  describe("When require", function () {
    it("Then must be a function", function () {
      expect(JavaScriptHelper).toEqual(jasmine.any(Function));
    });

    it("When call without operator new Then must return object", function () {
      expect(JavaScriptHelper()).toEqual(jasmine.any(Object));
    });

    it("When call with operator new Then must return object", function () {
      expect(new JavaScriptHelper()).toEqual(jasmine.any(Object));
    });
  });

  describe("About instance", function () {
    it("Instance must have excepted function", function () {
      var functions = [

      ];
    });
  });
});
