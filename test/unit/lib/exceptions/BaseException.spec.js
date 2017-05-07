const BaseException = require('../../../../lib/exceptions/BaseException');

describe("Unit Test - BaseException", function () {
  describe("When require", function () {
    it("Must be a function", function () {
      expect(BaseException).toEqual(jasmine.any(Function));
    });
  }); // End when require

  describe("When instantiate", function () {
    it("When not using the new operator Then must return new instance", function () {
      const value = BaseException();
      expect(value).toEqual(jasmine.any(BaseException));
    });

    it("When using the new operator must return new instance", function () {
      const value = new BaseException();
      expect(value).toEqual(jasmine.any(BaseException));
    });

    it("Given message When instantiate Then must set the message", function () {
      const message = "My message";
      const value = new BaseException(message);
      expect(value).toEqual(jasmine.any(BaseException));
      expect(value.message).toEqual(message);
      expect(value.stack).toEqual(jasmine.any(String));
    });
  }); // End of When instantiate
});
