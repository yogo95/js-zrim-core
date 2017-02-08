/**
 * Unit test for InitializableObject
 */

var InitializableObject = require("../../../lib/InitializableObject");

var _ = require('lodash'),
  BaseObject = require('../../../lib/BaseObject'),
  IllegalStateException = require("../../../lib/exceptions/IllegalStateException")
  ;

var DEFAULT_TIMEOUT = 2000;

describe("Unit Test - InitializableObject", function () {

  describe("When require the InitializableObject", function () {

    it("Must be a function", function () {
      expect(InitializableObject).toEqual(jasmine.any(Function));
    });

    it("Must have the expected States", function () {
      expect(InitializableObject.States).toEqual(jasmine.any(Object));
      if (_.isObject(InitializableObject.States)) {
        var expectedStates = _.merge({
          NotInitialized: "NotInitialized",
          Initializing: "Initializing",
          Initialized: "Initialized",
          Finalizing: "Finalizing"
        }, BaseObject.States);

        expect(InitializableObject.States).toEqual(expectedStates);
      }
    });

    it("Must have the expected Signals", function () {
      expect(InitializableObject.Signals).toEqual(jasmine.any(Object));
      if (_.isObject(InitializableObject.Signals)) {
        var expectedSignals = _.merge({
          initializing: "initializing",
          initializationSucceed: "initializationSucceed",
          initializationFailed: "initializationFailed",
          finalizing: "finalizing",
          finalizationSucceed: "finalizationSucceed",
          finalizationFailed: "finalizationFailed"
        }, BaseObject.Signals);

        expect(InitializableObject.Signals).toEqual(expectedSignals);
      }
    });
  }); // End when require

  describe("When instantiate", function () {
    it("When not using the new operator Then must return new instance", function () {
      var value = InitializableObject();
      expect(value).toEqual(jasmine.any(InitializableObject));
    });

    it("When using the new operator must return new instance", function () {
      var value = new InitializableObject();
      expect(value).toEqual(jasmine.any(InitializableObject));
    });
  }); // End of When instantiate

  describe("When checking the instance", function () {

    describe("When canInitialize", function () {
      it("Given state NotInitialized Then must return true", function () {
        var initializableObject = new InitializableObject();
        initializableObject.properties.currentState = InitializableObject.States.NotInitialized;

        var response = initializableObject.canInitialize();
        expect(response).toBeTruthy();
      });

      it("Given state other Than NotInitialized Then must return true", function () {
        var initializableObject = new InitializableObject();
        initializableObject.properties.currentState = InitializableObject.States.Ready;

        var response = initializableObject.canInitialize();
        expect(response).toBeFalsy();
      });
    }); // end of canInitialize

    describe("When canFinalize", function () {
      it("Given state ready Then must return true", function () {
        var initializableObject = new InitializableObject();
        initializableObject.properties.currentState = InitializableObject.States.Ready;

        var response = initializableObject.canFinalize();
        expect(response).toBeTruthy();
      });
      it("Given state Initialized Then must return true", function () {
        var initializableObject = new InitializableObject();
        initializableObject.properties.currentState = InitializableObject.States.Initialized;

        var response = initializableObject.canFinalize();
        expect(response).toBeTruthy();
      });


      it("Given state other Than ready or Initialized Then must return true", function () {
        var initializableObject = new InitializableObject();
        initializableObject.properties.currentState = InitializableObject.States.NotInitialized;

        var response = initializableObject.canFinalize();
        expect(response).toBeFalsy();
      });
    }); // end of canFinalize
  }); // End of checking instance

  describe("When initialize", function () {
    it("Then must call canInitialize", function (testDone) {
      var initializableObject = new InitializableObject();

      spyOn(initializableObject, 'canInitialize').andCallThrough();
      initializableObject.initialize(undefined, function () {
        expect(initializableObject.canInitialize).toHaveBeenCalled();
        testDone();
      });
    }, DEFAULT_TIMEOUT);

    it("Given canInitialize return false Then must return error", function (testDone) {
      var initializableObject = new InitializableObject();

      spyOn(initializableObject, 'canInitialize').andCallFake(function () {
        return false;
      });
      initializableObject.initialize(undefined, function (error) {
        expect(initializableObject.canInitialize).toHaveBeenCalled();
        expect(error).toEqual(jasmine.any(IllegalStateException));
        testDone();
      });
    }, DEFAULT_TIMEOUT);

    it("Given valid state Then must call _handleInitialization", function (testDone) {
      var initializableObject = new InitializableObject();
      var optionsIn = {
        a: '',
        b: 12
      };

      spyOn(initializableObject, 'canInitialize').andCallFake(function () {
        return true;
      });
      spyOn(initializableObject, '_handleInitialization').andCallFake(function (options, callback) {
        expect(options).toEqual(optionsIn);
        expect(callback).toEqual(jasmine.any(Function));
        testDone();
      });
      initializableObject.initialize(_.cloneDeep(optionsIn), function () {
        expect(false).toBeTruthy();
        testDone();
      });
    }, DEFAULT_TIMEOUT);

    it("Given _handleInitialization returns error Then must return the error", function (testDone) {
      var initializableObject = new InitializableObject();
      var expectedError = new Error("The error");

      spyOn(initializableObject, 'canInitialize').andCallFake(function () {
        return true;
      });
      spyOn(initializableObject, '_handleInitialization').andCallFake(function (options, callback) {
        callback(expectedError);
      });
      initializableObject.initialize(undefined, function (error) {
        expect(error).toBe(expectedError);
        testDone();
      });
    }, DEFAULT_TIMEOUT);

    it("Given valid state Then must change current state=Initializing before calling _handleInitialization", function (testDone) {
      var initializableObject = new InitializableObject();

      var slotInitializing = jasmine.createSpy("onInitializing");
      initializableObject.on('initializing', slotInitializing);

      spyOn(initializableObject, 'canInitialize').andCallFake(function () {
        return true;
      });
      spyOn(initializableObject, '_handleInitialization').andCallFake(function () {
        expect(initializableObject.currentState).toEqual("Initializing");
        expect(slotInitializing).toHaveBeenCalled();
        testDone();
      });
      initializableObject.initialize(undefined, function () {
        expect(false).toBeTruthy();
        testDone();
      });
    }, DEFAULT_TIMEOUT);

    it("Given valid state and _handleInitialization returns error Then must emit initializationFailed and currentState=NotInitialized", function (testDone) {
      var initializableObject = new InitializableObject();

      var slotInitializationFailed = jasmine.createSpy("onInitializationFailed");
      initializableObject.on('initializationFailed', slotInitializationFailed);

      spyOn(initializableObject, 'canInitialize').andCallFake(function () {
        return true;
      });
      spyOn(initializableObject, '_handleInitialization').andCallFake(function (options, callback) {
        callback(new Error("The error"));
      });
      initializableObject.initialize(undefined, function () {
        expect(initializableObject.currentState).toEqual("NotInitialized");
        expect(slotInitializationFailed).toHaveBeenCalled();
        testDone();
      });
    }, DEFAULT_TIMEOUT);

    it("Given valid state and _handleInitialization returns ok Then must emit initializationSucceed and currentState=Initialized", function (testDone) {
      var initializableObject = new InitializableObject();

      var slotInitializationSucceed = jasmine.createSpy("onInitializationSucceed");
      initializableObject.on('initializationSucceed', slotInitializationSucceed);

      spyOn(initializableObject, 'canInitialize').andCallFake(function () {
        return true;
      });
      spyOn(initializableObject, '_handleInitialization').andCallFake(function (options, callback) {
        callback();
      });
      initializableObject.initialize(undefined, function () {
        expect(initializableObject.currentState).toEqual("Initialized");
        expect(slotInitializationSucceed).toHaveBeenCalled();
        testDone();
      });
    }, DEFAULT_TIMEOUT);
  }); // End of initialize

  describe("When init", function () {
    it("Then must call initialize", function (testDone) {
      var initializableObject = new InitializableObject();

      var args = [
        {a: ''},
        function () {

        }
      ];

      spyOn(initializableObject, 'initialize').andCallFake(function () {
        expect(arguments).toEqual({
          0: args[0],
          1: args[1]
        });
        testDone();
      });

      initializableObject.init.apply(initializableObject, args);
    }, DEFAULT_TIMEOUT);
  }); // End of when init

  describe("When finalize", function () {
    it("Then must call canFinalize", function (testDone) {
      var initializableObject = new InitializableObject();

      spyOn(initializableObject, 'canFinalize').andCallThrough();
      initializableObject.finalize(undefined, function () {
        expect(initializableObject.canFinalize).toHaveBeenCalled();
        testDone();
      });
    }, DEFAULT_TIMEOUT);

    it("Given canFinalize return false Then must return error", function (testDone) {
      var initializableObject = new InitializableObject();

      spyOn(initializableObject, 'canFinalize').andCallFake(function () {
        return false;
      });
      initializableObject.finalize(undefined, function (error) {
        expect(initializableObject.canFinalize).toHaveBeenCalled();
        expect(error).toEqual(jasmine.any(IllegalStateException));
        testDone();
      });
    }, DEFAULT_TIMEOUT);

    it("Given valid state Then must call _handleFinalization", function (testDone) {
      var initializableObject = new InitializableObject();
      var optionsIn = {
        a: '',
        b: 12
      };

      spyOn(initializableObject, 'canFinalize').andCallFake(function () {
        return true;
      });
      spyOn(initializableObject, '_handleFinalization').andCallFake(function (options, callback) {
        expect(options).toEqual(optionsIn);
        expect(callback).toEqual(jasmine.any(Function));
        testDone();
      });
      initializableObject.finalize(_.cloneDeep(optionsIn), function () {
        expect(false).toBeTruthy();
        testDone();
      });
    }, DEFAULT_TIMEOUT);

    it("Given _handleFinalization returns error Then must return the error", function (testDone) {
      var initializableObject = new InitializableObject();
      var expectedError = new Error("The error");

      spyOn(initializableObject, 'canFinalize').andCallFake(function () {
        return true;
      });
      spyOn(initializableObject, '_handleFinalization').andCallFake(function (options, callback) {
        callback(expectedError);
      });
      initializableObject.finalize(undefined, function (error) {
        expect(error).toBe(expectedError);
        testDone();
      });
    }, DEFAULT_TIMEOUT);

    it("Given valid state Then must change current state=Finalizing before calling _handleFinalization", function (testDone) {
      var initializableObject = new InitializableObject();

      var slotFinalizing = jasmine.createSpy("onFinalizing");
      initializableObject.on('finalizing', slotFinalizing);

      spyOn(initializableObject, 'canFinalize').andCallFake(function () {
        return true;
      });
      spyOn(initializableObject, '_handleFinalization').andCallFake(function () {
        expect(initializableObject.currentState).toEqual("Finalizing");
        expect(slotFinalizing).toHaveBeenCalled();
        testDone();
      });
      initializableObject.finalize(undefined, function () {
        expect(false).toBeTruthy();
        testDone();
      });
    }, DEFAULT_TIMEOUT);

    it("Given valid state and _handleFinalization returns error Then must emit finalizationFailed and currentState=Initialized", function (testDone) {
      var initializableObject = new InitializableObject();
      initializableObject.properties.currentState = 'Initialized';

      var slotFinalizationFailed = jasmine.createSpy("onFinalizationFailed");
      initializableObject.on('finalizationFailed', slotFinalizationFailed);

      spyOn(initializableObject, 'canFinalize').andCallFake(function () {
        return true;
      });
      spyOn(initializableObject, '_handleFinalization').andCallFake(function (options, callback) {
        callback(new Error("The error"));
      });
      initializableObject.finalize(undefined, function () {
        expect(initializableObject.currentState).toEqual("Initialized");
        expect(slotFinalizationFailed).toHaveBeenCalled();
        testDone();
      });
    }, DEFAULT_TIMEOUT);

    it("Given valid state and _handleFinalization returns ok Then must emit finalizationSucceed and currentState=NotInitialized", function (testDone) {
      var initializableObject = new InitializableObject();

      var slotFinalizationSucceed = jasmine.createSpy("onFinalizationSucceed");
      initializableObject.on('finalizationSucceed', slotFinalizationSucceed);

      spyOn(initializableObject, 'canFinalize').andCallFake(function () {
        return true;
      });
      spyOn(initializableObject, '_handleFinalization').andCallFake(function (options, callback) {
        callback();
      });
      initializableObject.finalize(function () {
        expect(initializableObject.currentState).toEqual("NotInitialized");
        expect(slotFinalizationSucceed).toHaveBeenCalled();
        testDone();
      });
    }, DEFAULT_TIMEOUT);
  }); // End of finalize
});
