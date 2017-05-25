
describe("Unit Test - ConverterService", function () {
  const ConverterService = require("./../../../../lib/services/ConverterService"),
    _ = require("lodash"),
    LoggerMock = require("./../../../../lib/mocks").LoggerMock,
    exceptions = require("./../../../../lib/exceptions");

  /**
   * Create an instance for the test
   * @return {ConverterService} The instance created
   */
  function createInstance() {
    const instance = new ConverterService();
    instance.logger.target = new LoggerMock();
    return instance;
  }

  describe("#convert", function () {
    it("Given invalid options Then must throw error", function () {
      const instance = createInstance();

      expect(() => {
        instance.convert(0);
      }).toThrow(jasmine.any(TypeError));

      expect(() => {
        instance.convert(0, {});
      }).toThrow(jasmine.any(TypeError));

      expect(() => {
        instance.convert(0, {
          sourceTypeName: "",
          outputTypeName: "",
          converter: ""
        });
      }).toThrow(jasmine.any(TypeError));
    });

    it("Given valid option and convert not found Then must throw error", function () {
      const instance = createInstance();
      expect(() => {
        instance.convert(0, {
          sourceTypeName: "a",
          outputTypeName: "b"
        });
      }).toThrow(jasmine.any(exceptions.NotFoundException));
    });

    it("Given valid options and convert throws error Then must throw error", function () {
      const instance = createInstance();
      const expectedError = new Error("Unit Test - Fake error"),
        converter = jasmine.createSpy("converter").and.throwError(expectedError);
      instance.properties.convertersDB = {
        "a.1": {
          "b.2": {
            converter: converter
          }
        }
      };
      expect(() => {
        instance.convert(0, {
          sourceTypeName: "a.1",
          outputTypeName: "b.2"
        });
      }).toThrow(expectedError);
      expect(converter).toHaveBeenCalledTimes(1);
    });

    it("Given valid options and converter succees Then must return expected value", function () {
      const instance = createInstance();
      const expectedInputValue = {},
        expectedResult = {
          a: 1
        },
        converter = jasmine.createSpy("converter").and.callFake((input, options) => {
          expect(input).toBe(expectedInputValue);
          expect(options).toEqual({
            sourceTypeName: "a.1",
            outputTypeName: "b.2"
          });
          return expectedResult;
        });

      instance.properties.convertersDB = {
        "a.1": {
          "b.2": {
            converter: converter
          }
        }
      };

      expect(instance.convert(expectedInputValue, {
        sourceTypeName: "a.1",
        outputTypeName: "b.2"
      })).toBe(expectedResult);
      expect(converter).toHaveBeenCalledTimes(1);
    });
  }); // #convert

  describe("#register", function () {
    it("Given invalid options Then must throw error", function () {
      const instance = createInstance();

      expect(() => {
        instance.register();
      }).toThrow(jasmine.any(TypeError));

      expect(() => {
        instance.register({});
      }).toThrow(jasmine.any(TypeError));

      expect(() => {
        instance.register({
          sourceTypeName: "",
          outputTypeName: "",
          converter: ""
        });
      }).toThrow(jasmine.any(TypeError));
    });

    it("Given valid options and source not exists Then must add converter", function () {
      const instance = createInstance();
      const options = {
        sourceTypeName: "a.1",
        outputTypeName: "o.2",
        converter: () => {}
      };
      instance.register(options);
      expect(instance.properties.convertersDB["a.1"]).toEqual(jasmine.any(Object));
      if (_.isObjectLike(instance.properties.convertersDB["a.1"])) {
        expect(instance.properties.convertersDB["a.1"]["o.2"]).toEqual(jasmine.any(Object));
        if (_.isObjectLike(instance.properties.convertersDB["a.1"]["o.2"])) {
          expect(instance.properties.convertersDB["a.1"]["o.2"].converter).toBe(options.converter);
        }
      }
    });

    it("Given valid options and source exists Then must override converter", function () {
      const instance = createInstance();
      instance.properties.convertersDB = {
        "a.": {
          "o.2": {
            converter: () => {}
          }
        }
      };
      const options = {
        sourceTypeName: "a.1",
        outputTypeName: "o.2",
        converter: () => {}
      };
      instance.register(options);
      expect(instance.properties.convertersDB["a.1"]).toEqual(jasmine.any(Object));
      if (_.isObjectLike(instance.properties.convertersDB["a.1"])) {
        expect(instance.properties.convertersDB["a.1"]["o.2"]).toEqual(jasmine.any(Object));
        if (_.isObjectLike(instance.properties.convertersDB["a.1"]["o.2"])) {
          expect(instance.properties.convertersDB["a.1"]["o.2"].converter).toBe(options.converter);
        }
      }
    });
  }); // #register

  describe("#canConvert", function () {
    it("Given invalid options Then must return false", function () {
      const instance = createInstance();

      expect(instance.canConvert()).toBeFalsy();
      expect(instance.canConvert({})).toBeFalsy();
      expect(instance.canConvert({
        sourceTypeName: "",
        outputTypeName: ""
      })).toBeFalsy();
    });

    it("Given valid options and convert not exist Then must return false", function () {
      const instance = createInstance();
      expect(instance.canConvert({
        sourceTypeName: "s1",
        outputTypeName: "o2"
      })).toBeFalsy();
    });

    it("Given valid options and convert exists Then must return true", function () {
      const instance = createInstance();
      instance.properties.convertersDB = {
        "s1.1": {
          "o2.2": {
            converter: () => {}
          }
        }
      };
      expect(instance.canConvert({
        sourceTypeName: "s1.1",
        outputTypeName: "o2.2"
      })).toBeTruthy();
    });
  }); // #canConvert
});
