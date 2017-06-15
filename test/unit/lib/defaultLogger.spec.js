describe("Unit Test - defaultLogger", function () {
  const defaultLogger = require('./../../../lib/defaultLogger');

  describe("When require", function () {
    it("Then must return function", function () {
      expect(defaultLogger).toEqual(jasmine.any(Function));
    });
  }); // When require

  describe("#defaultLogger", function () {
    it("Then must call getDefaultLogger and return expected value", function () {
      const expectedValue = function () { };
      spyOn(defaultLogger, 'getDefaultLogger').and.callFake(() => expectedValue);
      expect(defaultLogger("aaa")).toBe(expectedValue);
      expect(defaultLogger.getDefaultLogger).toHaveBeenCalledWith("aaa");
    });
  }); // #defaultLogger

  describe("#listLoggers", function () {
    it("Then must return expected value", function () {
      defaultLogger.__loggers = {
        a: {},
        b: {}
      };

      expect(defaultLogger.listLoggers()).toEqual(["a", "b"]);

      defaultLogger.__loggers = {};
    });
  }); // #listLoggers

  describe("#getDefaultLogger", function () {
    it("Given invalid logger name Then must throw error", function () {
      expect(() => {
        defaultLogger.getDefaultLogger({});
      }).toThrow(jasmine.any(TypeError));
    });

    it("Given no name and default not found Then must return default one", function () {
      expect(defaultLogger.getDefaultLogger()).toBe(require('winston'));
    });

    it("Given no name Then must return default one", function () {
      defaultLogger.__loggers.____default____ = {};
      expect(defaultLogger.getDefaultLogger()).toBe(defaultLogger.__loggers.____default____);
      delete defaultLogger.__loggers.____default____;
    });

    it("Given valid name but not exists Then must return default one", function () {
      defaultLogger.__loggers.____default____ = {};
      expect(defaultLogger.getDefaultLogger("a")).toBe(defaultLogger.__loggers.____default____);
      delete defaultLogger.__loggers.____default____;
    });

    it("Given valid name and exists Then must return expected value", function () {
      defaultLogger.__loggers.ab = {};
      expect(defaultLogger.getDefaultLogger("ab")).toBe(defaultLogger.__loggers.ab);
      delete defaultLogger.__loggers.ab;
    });
  }); // #getDefaultLogger

  describe("#setDefaultLogger", function () {
    it("Given invalid logger name Then must throw error", function () {
      expect(() => {
        defaultLogger.setDefaultLogger({});
      }).toThrow(jasmine.any(TypeError));
    });

    it("Given no name Then must set default logger", function () {
      const expectedValue = {};
      defaultLogger.setDefaultLogger(null, expectedValue);
      expect(defaultLogger.__loggers.____default____).toBe(expectedValue);
      delete defaultLogger.__loggers.____default____;
    });

    it("Given name Then must set logger", function () {
      const expectedValue = {};
      defaultLogger.setDefaultLogger("ab", expectedValue);
      expect(defaultLogger.__loggers.ab).toBe(expectedValue);
      delete defaultLogger.__loggers.ab;
    });
  }); // #setDefaultLogger
});
