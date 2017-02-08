/**
 * Unit Test - IllegalStateException
 */

var IllegalStateException = require('../../../../lib/exceptions/IllegalStateException');

describe("Unit Test - IllegalStateException", function () {
  describe("When require", function () {
    it("Must be a function", function () {
      expect(IllegalStateException).toEqual(jasmine.any(Function));
    });
  }); // End when require

  describe("When instantiate", function () {
    it("When not using the new operator Then must return new instance", function () {
      var value = IllegalStateException();
      expect(value).toEqual(jasmine.any(IllegalStateException));
    });

    it("When using the new operator must return new instance", function () {
      var value = new IllegalStateException();
      expect(value).toEqual(jasmine.any(IllegalStateException));
    });
  }); // End of When instantiate
});
