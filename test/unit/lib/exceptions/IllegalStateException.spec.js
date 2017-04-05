/**
 * Unit Test - IllegalStateException
 */

const IllegalStateException = require('../../../../lib/exceptions/IllegalStateException');

describe("Unit Test - IllegalStateException", function () {
  describe("When require", function () {
    it("Must be a function", function () {
      expect(IllegalStateException).toEqual(jasmine.any(Function));
    });
  }); // End when require

  describe("When instantiate", function () {
    it("When not using the new operator Then must return new instance", function () {
      const value = IllegalStateException();
      expect(value).toEqual(jasmine.any(IllegalStateException));
    });

    it("When using the new operator must return new instance", function () {
      const value = new IllegalStateException();
      expect(value).toEqual(jasmine.any(IllegalStateException));
    });

    it("Given message When instantiate Then must set the message", function () {
      const message = "My message";
      const value = new IllegalStateException(message);
      expect(value).toEqual(jasmine.any(IllegalStateException));
      expect(value.message).toEqual(message);
      expect(value.stack).toEqual(jasmine.any(String));
    });
  }); // End of When instantiate
});
