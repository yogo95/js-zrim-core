/**
 * Unit Test - ProxyLogger
 */

const ProxyLogger = require('../../../lib/ProxyLogger');

const _ = require('lodash')
  ;

describe("Unit Test - ProxyLogger", function () {
  describe("When require the manager", function () {

    it("Must be a function", function () {
      expect(ProxyLogger).toEqual(jasmine.any(Function));
    });
  }); // End when require

  describe("When instantiate", function () {
    it("When not using the new operator Then must return new instance", function () {
      const instance = ProxyLogger();
      expect(instance).toEqual(jasmine.any(ProxyLogger));
    });

    it("When using the new operator must return new instance", function () {
      const instance = ProxyLogger();
      expect(instance).toEqual(jasmine.any(ProxyLogger));
    });

    it("Then must have logs function", function () {
      const instance = ProxyLogger();

      _.each(['error', 'warn', 'warn', 'info', 'verbose', 'debug', 'silly'], function (levelName) {
        expect(instance[levelName]).toEqual(jasmine.any(Function));
      });
    });

    it("Given target Then must set the internal property", function () {
      var target = {
        a: 8
      };
      var instance = new ProxyLogger({
        target: target
      });
      expect(instance.properties.target).toBe(target);
    });

    it("Given prefixes as string Then must set internal properties prefixes and prefixLog", function () {
      var instance = new ProxyLogger({
        prefixes: "az"
      });

      expect(instance.properties.prefixes).toEqual([
        "az"
      ]);
      expect(instance.properties.prefixLog).toEqual("[az]");
    });

    it("Given prefixes as string array Then must set internal properties prefixes and prefixLog", function () {
      var prefixes = [
        "az",
        "l"
      ];
      var instance = new ProxyLogger({
        prefixes: prefixes
      });

      expect(instance.properties.prefixes).toEqual(prefixes);
      expect(instance.properties.prefixLog).toEqual("[az][l]");
    });

    it("Given metaData Then must set internal properties metaData", function () {
      const metaData = [
        "az",
        "l"
      ];
      const instance = new ProxyLogger({
        metaData: metaData
      });

      expect(instance.properties.metaData).toBe(metaData);
    });
  }); // End of When instantiate

  describe("When getRootTarget", function () {
    it("Given target nil Then must return undefined", function () {
      const instance = ProxyLogger();
      expect(instance.getRootTarget()).toBeUndefined();
    });

    it("Given target as object Then must return the object", function () {
      const instance = ProxyLogger();
      const targetObject = {
        a: ""
      };
      instance.properties.target = targetObject;
      expect(instance.getRootTarget()).toEqual(targetObject);
    });

    it("Given target as object Then must return the object", function () {
      const instance = ProxyLogger();
      const targetObject = Object.create(ProxyLogger.prototype);
      const fakeTarget = jasmine.createSpy("FakeTarget");
      instance.properties.target = targetObject;
      targetObject.getRootTarget = jasmine.createSpy("getRootTarget");
      targetObject.getRootTarget.and.callFake(function () {
        return fakeTarget;
      });
      expect(instance.getRootTarget()).toEqual(fakeTarget);
      expect(targetObject.getRootTarget).toHaveBeenCalled();
    });
  }); // End of When getRootTarget

  describe("When isDebugEnabled", function () {
    it("Then must call getRootTarget", function () {
      const instance = ProxyLogger();
      instance.getRootTarget = jasmine.createSpy("getRootTarget");
      instance.isDebugEnabled();
      expect(instance.getRootTarget).toHaveBeenCalled();
    });

    it("Given target undefined Then must return false", function () {
      const instance = ProxyLogger();
      instance.getRootTarget = jasmine.createSpy("getRootTarget").and.callFake(function () {
        return undefined;
      });
      expect(instance.isDebugEnabled()).toBeFalsy();
    });

    it("Given target defined and debug mode Then must return false", function () {
      const instance = ProxyLogger();
      instance.getRootTarget = jasmine.createSpy("getRootTarget").and.callFake(function () {
        return {
          level: 'debug'
        };
      });
      expect(instance.isDebugEnabled()).toBeTruthy();
    });
  });

  describe("When generatePrefixLog", function () {
    it("Given undefined Then must return undefined", function () {
      const instance = ProxyLogger();
      expect(instance.generatePrefixLog()).toBeUndefined();
    });

    it("Given string Then must return expected value", function () {
      const instance = ProxyLogger();
      expect(instance.generatePrefixLog("qwerty")).toEqual("[qwerty]");
    });

    it("Given array with some string Then must return expected value", function () {
      const instance = ProxyLogger();
      const prefixes = [
        "a",
        {},
        "b",
        12,
        "c",
        []
      ];
      expect(instance.generatePrefixLog(prefixes)).toEqual("[a][b][c]");
    });
  });

  describe("When property target", function () {
    it("Given target undefined When get Then must return undefined", function () {
      const instance = ProxyLogger();
      instance.properties.target = undefined;
      expect(instance.target).toBeUndefined();
    });

    it("Given target object When get Then must return expected value", function () {
      const instance = ProxyLogger();
      const expectedValue = jasmine.createSpy();
      instance.properties.target = expectedValue;
      expect(instance.target).toBe(expectedValue);
    });

    it("Given object When set Then must set target", function () {
      const instance = ProxyLogger();
      const expectedValue = {
        a: ""
      };
      instance.target = expectedValue;
      expect(instance.properties.target).toBe(expectedValue);
    });

    it("Given undefined When set Then must target to undefined", function () {
      const instance = ProxyLogger();
      instance.properties.target = {
        a: ""
      };
      instance.target = undefined;
      expect(instance.properties.target).toBeUndefined();
    });

    it("Given other that undefined or object When set Then must do nothing", function () {
      const instance = ProxyLogger();
      const expectedValue = {
        a: ""
      };
      instance.properties.target = expectedValue;
      instance.target = function () {

      };
      expect(instance.properties.target).toBe(expectedValue);
    });
  });

  describe("When log", function () {
    it("Given not string level name Then must do nothing", function () {
      const instance = ProxyLogger();
      const getRootTarget = jasmine.createSpy("getRootTarget");
      const generateMetaData = jasmine.createSpy("generateMetaData");
      instance.getRootTarget = getRootTarget;
      instance.generateMetaData = generateMetaData;
      instance.log({});
      expect(getRootTarget).not.toHaveBeenCalled();
      expect(generateMetaData).not.toHaveBeenCalled();
    });

    it("Given target level not exists but log function do Then must call log function", function () {
      const instance = ProxyLogger();
      const targetMock = {
        log: jasmine.createSpy("log")
      };
      instance.getRootTarget = jasmine.createSpy("getRootTarget").and.callFake(function () {
        return targetMock;
      });

      instance.log("az");
      expect(instance.getRootTarget).toHaveBeenCalled();
      expect(targetMock.log).toHaveBeenCalledWith("az");
    });

    it("Given target level not exists but log function do with prefixes Then must call log function with valid arguments", function () {
      const instance = new ProxyLogger({
        prefixes: [
          "ab",
          "cd"
        ]
      });
      const targetMock = {
        log: jasmine.createSpy("log")
      };
      instance.getRootTarget = jasmine.createSpy("getRootTarget").and.callFake(function () {
        return targetMock;
      });

      const expectedMetaData = {
        a: 45
      };
      instance.generateMetaData = jasmine.createSpy("generateMetaData").and.callFake(() => expectedMetaData);

      instance.log("debug", "az");
      instance.log("debug", "[az]");
      expect(instance.getRootTarget).toHaveBeenCalled();
      expect(targetMock.log).toHaveBeenCalledWith("debug", "[ab][cd] az", expectedMetaData);
      expect(targetMock.log).toHaveBeenCalledWith("debug", "[ab][cd][az]", expectedMetaData);
    });

    it("Given target level exists and with prefixes Then must call target function with valid arguments", function () {
      const instance = new ProxyLogger({
        prefixes: [
          "ab",
          "cd"
        ]
      });
      const targetMock = {
        log: jasmine.createSpy("log"),
        debug: jasmine.createSpy("debug")
      };
      instance.getRootTarget = jasmine.createSpy("getRootTarget").and.callFake(function () {
        return targetMock;
      });

      instance.log("debug", "az");
      instance.log("debug", "[az]");
      expect(instance.getRootTarget).toHaveBeenCalled();
      expect(targetMock.log).not.toHaveBeenCalled();
      expect(targetMock.debug).toHaveBeenCalledWith("[ab][cd] az");
      expect(targetMock.debug).toHaveBeenCalledWith("[ab][cd][az]");
    });
  }); // End of When log

  describe("When of", function () {
    it("Given no argument Then must create new proxy logger", function () {
      const firstProxy = new ProxyLogger();
      const proxyFromOfFunction = firstProxy.of();

      expect(proxyFromOfFunction).toEqual(jasmine.any(ProxyLogger));
      expect(proxyFromOfFunction.target).toBe(firstProxy);
    });

    it("Given string argument Then must create new proxy logger", function () {
      const firstProxy = new ProxyLogger({
        prefixes: "a"
      });
      const proxyFromOfFunction = firstProxy.of("b");

      expect(proxyFromOfFunction).toEqual(jasmine.any(ProxyLogger));
      expect(proxyFromOfFunction.target).toBe(firstProxy);
      expect(proxyFromOfFunction.properties.prefixes).toEqual(["a", "b"]);
    });

    it("Given function with name argument Then must create new proxy logger", function () {
      const firstProxy = new ProxyLogger({
        prefixes: "a"
      });
      
      function testFunctionName() {
        
      }
      const proxyFromOfFunction = firstProxy.of(testFunctionName);

      expect(proxyFromOfFunction).toEqual(jasmine.any(ProxyLogger));
      expect(proxyFromOfFunction.target).toBe(firstProxy);
      expect(proxyFromOfFunction.properties.prefixes).toEqual(["a", "testFunctionName"]);
    });

    it("Given anonymous function argument Then must create new proxy logger", function () {
      const firstProxy = new ProxyLogger({
        prefixes: "a"
      });

      const proxyFromOfFunction = firstProxy.of(function () {

      });

      expect(proxyFromOfFunction).toEqual(jasmine.any(ProxyLogger));
      expect(proxyFromOfFunction.target).toBe(firstProxy);
      expect(proxyFromOfFunction.properties.prefixes).toEqual(["a", "anonymous"]);
    });
  }); // End of When of

  describe("When defineLogLevel", function () {
    it("Given valid name and not exist Then must define log function", function () {
      expect(ProxyLogger.prototype.testMe).not.toBeDefined();
      ProxyLogger.defineLogLevel("testMe");
      expect(ProxyLogger.prototype.testMe).toEqual(jasmine.any(Function));
      expect(ProxyLogger.levelNamesKnown.testMe).toBeTruthy();
      ProxyLogger.unDefineLogLevel("testMe");
    });

    it("Given valid name and not exists Then when call function must call log with level name", function (testDone) {
      expect(ProxyLogger.prototype.testMe).not.toBeDefined();
      ProxyLogger.defineLogLevel("testMe");

      const instance = new ProxyLogger();
      instance.log = jasmine.createSpy().and.callFake(function (levelName) {
        expect(levelName).toEqual("testMe");
        expect(arguments.length).toEqual(2);
        expect(arguments[1]).toEqual("a");
        ProxyLogger.unDefineLogLevel("testMe");
        testDone();
      });
      instance.testMe("a");
    });
  }); // End of defineLogLevel

  describe("When defineLogLevelAlias", function () {
    it("Given valid name and not exist Then must define log function", function () {
      expect(ProxyLogger.prototype.testMe).not.toBeDefined();
      ProxyLogger.defineLogLevelAlias("debug", "testMe");
      expect(ProxyLogger.prototype.testMe).toEqual(jasmine.any(Function));
      expect(ProxyLogger.levelNamesKnown.testMe).toBeTruthy();
      ProxyLogger.unDefineLogLevel("testMe");
    });

    it("Given valid name and not exists Then when call function must call log with level name and not alias", function (testDone) {
      expect(ProxyLogger.prototype.testMe).not.toBeDefined();
      ProxyLogger.defineLogLevelAlias("debug", "testMe");

      const instance = new ProxyLogger();
      instance.log = jasmine.createSpy().and.callFake(function (levelName) {
        expect(levelName).toEqual("debug");
        expect(arguments.length).toEqual(2);
        expect(arguments[1]).toEqual("a");
        ProxyLogger.unDefineLogLevel("testMe");
        testDone();
      });
      instance.testMe("a");
    });
  }); // End of When defineLogLevelAlias

  describe("When defineSysLogLevels", function () {
    it("Then must define sys log levels", function () {
      ProxyLogger.defineSysLogLevels();
      _.each(['emerg', 'alert', 'crit', 'error', 'warning', 'notice', 'info', 'debug', 'warn', 'silly'], function (levelName) {
        expect(ProxyLogger.prototype[levelName]).toEqual(jasmine.any(Function));
        expect(ProxyLogger.levelNamesKnown[levelName]).toBeTruthy();
      });
    });
  }); // End of defineSysLogLevels

  describe("#generateMetaData", function () {
    it("Given no metaData Then must return undefined", function () {
      const instance = new ProxyLogger();
      expect(instance.generateMetaData()).not.toBeDefined();
    });

    it("Given metadata as function Then must call it and return result", function () {
      const instance = new ProxyLogger();
      const expectedResult = {
        a: 12
      };
      instance.properties.metaData = jasmine.createSpy("metaData").and.callFake(() => expectedResult);
      expect(instance.generateMetaData()).toBe(expectedResult);
    });

    it("Given metadata as function that failed Then must call it and return error", function () {
      const instance = new ProxyLogger();
      const expectedResult = {
        a: 12
      };
      instance.properties.metaData = jasmine.createSpy("metaData").and.throwError("The error");
      expect(instance.generateMetaData()).toEqual({asymmetricMatch: function (val) {
        if (!_.isObjectLike(val)) {
          return false;
        }

        if (!_.isObjectLike(val.__ProxyLogger_unexpectedError)) {
          return false;
        }

        const container = val.__ProxyLogger_unexpectedError;
        return !_.isNil(container.error) && _.isString(container.stack) && _.isString(container.message);
      }});
    });

    it("Given metadata as object Then must return it", function () {
      const instance = new ProxyLogger();
      const expectedResult = {
        a: 12
      };
      instance.properties.metaData = expectedResult;
      expect(instance.generateMetaData()).toBe(expectedResult);
    });

    it("Given metadata as string|number|boolean Then must return it", function () {
      const instance = new ProxyLogger();
      let expectedResult = {
        data: "12a"
      };
      instance.properties.metaData = "12a";
      expect(instance.generateMetaData()).toEqual(expectedResult);

      expectedResult = {
        data: 12
      };
      instance.properties.metaData = 12;
      expect(instance.generateMetaData()).toEqual(expectedResult);

      expectedResult = {
        data: true
      };
      instance.properties.metaData = true;
      expect(instance.generateMetaData()).toEqual(expectedResult);
    });
  }); // End of #generateMetaData
});
