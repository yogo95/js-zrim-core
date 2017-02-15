/**
 * Unit Test - ProxyLogger
 */

var ProxyLogger = require('../../../lib/ProxyLogger');

var _ = require('lodash')
  ;

describe("Unit Test - ProxyLogger", function () {
  describe("When require the manager", function () {

    it("Must be a function", function () {
      expect(ProxyLogger).toEqual(jasmine.any(Function));
    });
  }); // End when require

  describe("When instantiate", function () {
    it("When not using the new operator Then must return new instance", function () {
      var value = ProxyLogger();
      expect(value).toEqual(jasmine.any(ProxyLogger));
    });

    it("When using the new operator must return new instance", function () {
      var value = new ProxyLogger();
      expect(value).toEqual(jasmine.any(ProxyLogger));
    });

    it("Then must have logs function", function () {
      var value = new ProxyLogger();

      _.each(['error', 'warn', 'warn', 'info', 'verbose', 'debug', 'silly'], function (levelName) {
        expect(value[levelName]).toEqual(jasmine.any(Function));
      });
    });

    it("Given target Then must set the internal property", function () {
      var target = {
        a: 8
      };
      var value = new ProxyLogger({
        target: target
      });
      expect(value.properties.target).toBe(target);
    });

    it("Given prefixes as string Then must set internal properties prefixes and prefixLog", function () {
      var value = new ProxyLogger({
        prefixes: "az"
      });

      expect(value.properties.prefixes).toEqual([
        "az"
      ]);
      expect(value.properties.prefixLog).toEqual("[az]");
    });

    it("Given prefixes as string array Then must set internal properties prefixes and prefixLog", function () {
      var prefixes = [
        "az",
        "l"
      ];
      var value = new ProxyLogger({
        prefixes: prefixes
      });

      expect(value.properties.prefixes).toEqual(prefixes);
      expect(value.properties.prefixLog).toEqual("[az][l]");
    });
  }); // End of When instantiate

  describe("When getRootTarget", function () {
    it("Given target nil Then must return undefined", function () {
      var value = new ProxyLogger();
      expect(value.getRootTarget()).toBeUndefined();
    });

    it("Given target as object Then must return the object", function () {
      var value = new ProxyLogger();
      var targetObject = {
        a: ""
      };
      value.properties.target = targetObject;
      expect(value.getRootTarget()).toEqual(targetObject);
    });

    it("Given target as object Then must return the object", function () {
      var value = new ProxyLogger();
      var targetObject = Object.create(ProxyLogger.prototype);
      var fakeTarget = jasmine.createSpy("FakeTarget");
      value.properties.target = targetObject;
      targetObject.getRootTarget = jasmine.createSpy("getRootTarget");
      targetObject.getRootTarget.and.callFake(function () {
        return fakeTarget;
      });
      expect(value.getRootTarget()).toEqual(fakeTarget);
      expect(targetObject.getRootTarget).toHaveBeenCalled();
    });
  }); // End of When getRootTarget

  describe("When isDebugEnabled", function () {
    it("Then must call getRootTarget", function () {
      var value = new ProxyLogger();
      value.getRootTarget = jasmine.createSpy("getRootTarget");
      value.isDebugEnabled();
      expect(value.getRootTarget).toHaveBeenCalled();
    });

    it("Given target undefined Then must return false", function () {
      var value = new ProxyLogger();
      value.getRootTarget = jasmine.createSpy("getRootTarget").and.callFake(function () {
        return undefined;
      });
      expect(value.isDebugEnabled()).toBeFalsy();
    });

    it("Given target defined and debug mode Then must return false", function () {
      var value = new ProxyLogger();
      value.getRootTarget = jasmine.createSpy("getRootTarget").and.callFake(function () {
        return {
          level: 'debug'
        };
      });
      expect(value.isDebugEnabled()).toBeTruthy();
    });
  });

  describe("When generatePrefixLog", function () {
    it("Given undefined Then must return undefined", function () {
      var value = new ProxyLogger();
      expect(value.generatePrefixLog()).toBeUndefined();
    });

    it("Given string Then must return expected value", function () {
      var value = new ProxyLogger();
      expect(value.generatePrefixLog("qwerty")).toEqual("[qwerty]");
    });

    it("Given array with some string Then must return expected value", function () {
      var value = new ProxyLogger();
      var prefixes = [
        "a",
        {},
        "b",
        12,
        "c",
        []
      ];
      expect(value.generatePrefixLog(prefixes)).toEqual("[a][b][c]");
    });
  });

  describe("When property target", function () {
    it("Given target undefined When get Then must return undefined", function () {
      var value = new ProxyLogger();
      value.properties.target = undefined;
      expect(value.target).toBeUndefined();
    });

    it("Given target object When get Then must return expected value", function () {
      var value = new ProxyLogger();
      var expectedValue = jasmine.createSpy();
      value.properties.target = expectedValue;
      expect(value.target).toBe(expectedValue);
    });

    it("Given object When set Then must set target", function () {
      var value = new ProxyLogger();
      var expectedValue = {
        a: ""
      };
      value.target = expectedValue;
      expect(value.properties.target).toBe(expectedValue);
    });

    it("Given undefined When set Then must target to undefined", function () {
      var value = new ProxyLogger();
      value.properties.target = {
        a: ""
      };
      value.target = undefined;
      expect(value.properties.target).toBeUndefined();
    });

    it("Given other that undefined or object When set Then must do nothing", function () {
      var value = new ProxyLogger();
      var expectedValue = {
        a: ""
      };
      value.properties.target = expectedValue;
      value.target = function () {

      };
      expect(value.properties.target).toBe(expectedValue);
    });
  });

  describe("When log", function () {
    it("Given not string level name Then must do nothing", function () {
      var value = new ProxyLogger();
      var getRootTarget = jasmine.createSpy("getRootTarget");
      value.getRootTarget = getRootTarget;
      value.log({});
      expect(getRootTarget).not.toHaveBeenCalled();
    });

    it("Given target level not exists but log function do Then must call log function", function () {
      var value = new ProxyLogger();
      var targetMock = {
        log: jasmine.createSpy("log")
      };
      value.getRootTarget = jasmine.createSpy("getRootTarget").and.callFake(function () {
        return targetMock;
      });

      value.log("az");
      expect(value.getRootTarget).toHaveBeenCalled();
      expect(targetMock.log).toHaveBeenCalledWith("az");
    });

    it("Given target level not exists but log function do with prefixes Then must call log function with valid arguments", function () {
      var value = new ProxyLogger({
        prefixes: [
          "ab",
          "cd"
        ]
      });
      var targetMock = {
        log: jasmine.createSpy("log")
      };
      value.getRootTarget = jasmine.createSpy("getRootTarget").and.callFake(function () {
        return targetMock;
      });

      value.log("debug", "az");
      value.log("debug", "[az]");
      expect(value.getRootTarget).toHaveBeenCalled();
      expect(targetMock.log).toHaveBeenCalledWith("debug", "[ab][cd] az");
      expect(targetMock.log).toHaveBeenCalledWith("debug", "[ab][cd][az]");
    });

    it("Given target level exists and with prefixes Then must call target function with valid arguments", function () {
      var value = new ProxyLogger({
        prefixes: [
          "ab",
          "cd"
        ]
      });
      var targetMock = {
        log: jasmine.createSpy("log"),
        debug: jasmine.createSpy("debug")
      };
      value.getRootTarget = jasmine.createSpy("getRootTarget").and.callFake(function () {
        return targetMock;
      });

      value.log("debug", "az");
      value.log("debug", "[az]");
      expect(value.getRootTarget).toHaveBeenCalled();
      expect(targetMock.log).not.toHaveBeenCalled();
      expect(targetMock.debug).toHaveBeenCalledWith("[ab][cd] az");
      expect(targetMock.debug).toHaveBeenCalledWith("[ab][cd][az]");
    });
  }); // End of When log

  describe("When of", function () {
    it("Given no argument Then must create new proxy logger", function () {
      var firstProxy = new ProxyLogger();
      var proxyFromOfFunction = firstProxy.of();

      expect(proxyFromOfFunction).toEqual(jasmine.any(ProxyLogger));
      expect(proxyFromOfFunction.target).toBe(firstProxy);
    });

    it("Given string argument Then must create new proxy logger", function () {
      var firstProxy = new ProxyLogger({
        prefixes: "a"
      });
      var proxyFromOfFunction = firstProxy.of("b");

      expect(proxyFromOfFunction).toEqual(jasmine.any(ProxyLogger));
      expect(proxyFromOfFunction.target).toBe(firstProxy);
      expect(proxyFromOfFunction.properties.prefixes).toEqual(["a", "b"]);
    });

    it("Given function with name argument Then must create new proxy logger", function () {
      var firstProxy = new ProxyLogger({
        prefixes: "a"
      });
      
      function testFunctionName() {
        
      }
      var proxyFromOfFunction = firstProxy.of(testFunctionName);

      expect(proxyFromOfFunction).toEqual(jasmine.any(ProxyLogger));
      expect(proxyFromOfFunction.target).toBe(firstProxy);
      expect(proxyFromOfFunction.properties.prefixes).toEqual(["a", "testFunctionName"]);
    });

    it("Given anonymous function argument Then must create new proxy logger", function () {
      var firstProxy = new ProxyLogger({
        prefixes: "a"
      });

      var proxyFromOfFunction = firstProxy.of(function () {

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

      var instance = new ProxyLogger();
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

      var instance = new ProxyLogger();
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
});
