
describe("Unit Test - BaseException", function () {
  const BaseTypeError = require('../../../../lib/exceptions/BaseTypeError');

  describe("When require", function () {
    it("Must be a function", function () {
      expect(BaseTypeError).toEqual(jasmine.any(Function));
    });
  }); // End when require

  describe("When instantiate", function () {
    it("When not using the new operator Then must return new instance", function () {
      const value = BaseTypeError();
      expect(value).toEqual(jasmine.any(BaseTypeError));
    });

    it("When using the new operator must return new instance", function () {
      const value = new BaseTypeError();
      expect(value).toEqual(jasmine.any(BaseTypeError));
    });

    it("Given message When instantiate Then must set the message", function () {
      const message = "My message";
      const value = new BaseTypeError(message);
      expect(value).toEqual(jasmine.any(BaseTypeError));
      expect(value.message).toEqual(message);
      expect(value.stack).toEqual(jasmine.any(String));
    });
  }); // End of When instantiate
});
