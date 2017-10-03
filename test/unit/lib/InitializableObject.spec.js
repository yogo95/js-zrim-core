/**
 * Unit test for InitializableObject
 */

describe("Unit Test - InitializableObject", function () {

  const InitializableObject = require("../../../lib/InitializableObject"),
    _ = require('lodash'),
    BaseObject = require('../../../lib/BaseObject'),
    IllegalStateException = require("../../../lib/exceptions/IllegalStateException"),
    LoggerMock = require("./../../../lib/mocks").LoggerMock;

  const DEFAULT_TIMEOUT = 2000;

  /**
   * Create instance for test
   * @return {InitializableObject} The object created
   */
  function createInstance() {
    return new InitializableObject({
      loggerTarget: new LoggerMock()
    });
  }

  describe("When require the InitializableObject", function () {

    it("Must be a function", function () {
      expect(InitializableObject).toEqual(jasmine.any(Function));
    });

    it("Must have the expected States", function () {
      expect(InitializableObject.States).toEqual(jasmine.any(Object));
      if (_.isObject(InitializableObject.States)) {
        const expectedStates = _.merge({
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
        const expectedSignals = _.merge({
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
      const value = InitializableObject();
      expect(value).toEqual(jasmine.any(InitializableObject));
    });

    it("When using the new operator must return new instance", function () {
      const value = new InitializableObject();
      expect(value).toEqual(jasmine.any(InitializableObject));
    });
  }); // End of When instantiate

  describe("When checking the instance", function () {

    describe("When canInitialize", function () {
      it("Given state NotInitialized Then must return true", function () {
        const initializableObject = createInstance();
        initializableObject.properties.currentState = InitializableObject.States.NotInitialized;

        const response = initializableObject.canInitialize();
        expect(response).toBeTruthy();
      });

      it("Given state other Than NotInitialized Then must return true", function () {
        const initializableObject = createInstance();
        initializableObject.properties.currentState = InitializableObject.States.Ready;

        const response = initializableObject.canInitialize();
        expect(response).toBeFalsy();
      });
    }); // end of canInitialize

    describe("When canFinalize", function () {
      it("Given state ready Then must return true", function () {
        const initializableObject = createInstance();
        initializableObject.properties.currentState = InitializableObject.States.Ready;

        const response = initializableObject.canFinalize();
        expect(response).toBeTruthy();
      });
      it("Given state Initialized Then must return true", function () {
        const initializableObject = createInstance();
        initializableObject.properties.currentState = InitializableObject.States.Initialized;

        const response = initializableObject.canFinalize();
        expect(response).toBeTruthy();
      });


      it("Given state other Than ready or Initialized Then must return true", function () {
        const initializableObject = createInstance();
        initializableObject.properties.currentState = InitializableObject.States.NotInitialized;

        const response = initializableObject.canFinalize();
        expect(response).toBeFalsy();
      });
    }); // end of canFinalize
  }); // End of checking instance

  describe("#isInitialized", function () {
    it("Set initialized true Then must return true", function () {
      const initializableObject = createInstance();
      initializableObject.properties._initialized = true;
      expect(initializableObject.isInitialized()).toBeTruthy();
    });

    it("Set initialized false Then must return false", function () {
      const initializableObject = createInstance();
      initializableObject.properties._initialized = false;
      expect(initializableObject.isInitialized()).toBeFalsy();
    });
  }); // #isInitialized

  describe("When initialize", function () {
    it("Then must call canInitialize", function (testDone) {
      const initializableObject = createInstance();

      spyOn(initializableObject, 'canInitialize').and.callThrough();
      initializableObject.initialize()
        .then(() => {
          expect(initializableObject.canInitialize).toHaveBeenCalled();
          testDone();
        })
        .catch(() => {
          expect(false).toBeTruthy();
          testDone();
        });
    }, DEFAULT_TIMEOUT);

    it("Given canInitialize return false Then must return error", function (testDone) {
      const initializableObject = createInstance();

      spyOn(initializableObject, 'canInitialize').and.callFake(function () {
        return false;
      });
      initializableObject.initialize()
        .then(() => {
          expect(false).toBeTruthy();
          testDone();
        })
        .catch((error) => {
          expect(initializableObject.canInitialize).toHaveBeenCalled();
          expect(error).toEqual(jasmine.any(IllegalStateException));
          testDone();
          testDone();
        });

      initializableObject.initialize(undefined, function (error) {
        expect(initializableObject.canInitialize).toHaveBeenCalled();
        expect(error).toEqual(jasmine.any(IllegalStateException));
        testDone();
      });
    }, DEFAULT_TIMEOUT);

    it("Given valid state Then must call _handleInitialization", function (testDone) {
      const initializableObject = createInstance();
      const optionsIn = {
        a: '',
        b: 12
      };

      spyOn(initializableObject, 'canInitialize').and.callFake(function () {
        return true;
      });
      spyOn(initializableObject, '_handleInitialization').and.callFake(function (options) {
        expect(options).toEqual(optionsIn);
        return new Promise(() => {
          testDone();
        });
      });
      initializableObject.initialize(_.cloneDeep(optionsIn));
    }, DEFAULT_TIMEOUT);

    it("Given _handleInitialization returns error Then must return the error", function (testDone) {
      const initializableObject = createInstance();
      const expectedError = new Error("The error");

      spyOn(initializableObject, 'canInitialize').and.callFake(function () {
        return true;
      });
      spyOn(initializableObject, '_handleInitialization').and.callFake(function () {
        return new Promise((resolve, reject) => {
          reject(expectedError);
        });
      });
      initializableObject.initialize()
        .then(() => {
          expect(false).toBeTruthy();
          testDone();
        })
        .catch(error => {
          expect(error).toBe(expectedError);
          testDone();
        });
    }, DEFAULT_TIMEOUT);

    it("Given valid state Then must change current state=Initializing before calling _handleInitialization", function (testDone) {
      const initializableObject = createInstance();

      const slotInitializing = jasmine.createSpy("onInitializing");
      initializableObject.on('initializing', slotInitializing);

      spyOn(initializableObject, 'canInitialize').and.callFake(function () {
        return true;
      });
      spyOn(initializableObject, '_handleInitialization').and.callFake(function () {
        expect(initializableObject.currentState).toEqual("Initializing");
        expect(slotInitializing).toHaveBeenCalled();
        return new Promise(() => {
          testDone();
        });
      });
      initializableObject.initialize();
    }, DEFAULT_TIMEOUT);

    it("Given valid state and _handleInitialization returns error Then must emit initializationFailed and currentState=NotInitialized", function (testDone) {
      const initializableObject = createInstance();

      const slotInitializationFailed = jasmine.createSpy("onInitializationFailed");
      initializableObject.on('initializationFailed', slotInitializationFailed);

      spyOn(initializableObject, 'canInitialize').and.callFake(function () {
        return true;
      });
      spyOn(initializableObject, '_handleInitialization').and.callFake(function () {
        return new Promise((resolve, reject) => {
          reject(new Error("The error"));
        });
      });

      let checkResult = () => {
        expect(initializableObject.currentState).toEqual("NotInitialized");
        expect(slotInitializationFailed).toHaveBeenCalled();
        testDone();
      };
      initializableObject.initialize().then(checkResult).catch(checkResult);
    }, DEFAULT_TIMEOUT);

    it("Given valid state and _handleInitialization returns ok Then must emit initializationSucceed and currentState=Initialized", function (testDone) {
      const initializableObject = createInstance();

      const slotInitializationSucceed = jasmine.createSpy("onInitializationSucceed");
      initializableObject.on('initializationSucceed', slotInitializationSucceed);

      spyOn(initializableObject, 'canInitialize').and.callFake(function () {
        return true;
      });
      spyOn(initializableObject, '_handleInitialization').and.callFake(() => {
        return new Promise(resolve => resolve());
      });


      initializableObject.initialize().then(() => {
        expect(initializableObject.currentState).toEqual("Initialized");
        expect(slotInitializationSucceed).toHaveBeenCalled();
        testDone();
      });
    }, DEFAULT_TIMEOUT);
  }); // End of initialize

  describe("When init", function () {
    it("Then must call initialize", function (testDone) {
      const initializableObject = createInstance();

      const args = [
        {a: ''}
      ];

      spyOn(initializableObject, 'initialize').and.callFake(function () {
        return new Promise(() => {
          expect(arguments.length).toEqual(1);
          expect(arguments[0]).toEqual(args[0]);
          testDone();
        });
      });

      expect(initializableObject.init({a: ''})).toEqual(jasmine.any(Promise));
    }, DEFAULT_TIMEOUT);
  }); // End of when init

  describe("When finalize", function () {
    it("Then must call canFinalize", function (testDone) {
      const initializableObject = createInstance();

      spyOn(initializableObject, 'canFinalize').and.callThrough();
      const handleResult = () => {
        expect(initializableObject.canFinalize).toHaveBeenCalled();
        testDone();
      };
      initializableObject.finalize().then(handleResult).catch(handleResult);
    }, DEFAULT_TIMEOUT);

    it("Given canFinalize return false Then must return error", function (testDone) {
      const initializableObject = createInstance();

      spyOn(initializableObject, 'canFinalize').and.callFake(function () {
        return false;
      });
      initializableObject.finalize()
        .then(() => {
          expect(false).toBeTruthy();
          testDone();
        })
        .catch(error => {
          expect(initializableObject.canFinalize).toHaveBeenCalled();
          expect(error).toEqual(jasmine.any(IllegalStateException));
          testDone();
        });
    }, DEFAULT_TIMEOUT);

    it("Given valid state Then must call _handleFinalization", function (testDone) {
      const initializableObject = createInstance();
      const optionsIn = {
        a: '',
        b: 12
      };

      spyOn(initializableObject, 'canFinalize').and.callFake(function () {
        return true;
      });
      spyOn(initializableObject, '_handleFinalization').and.callFake(function (options) {
        expect(options).toEqual(optionsIn);
        return new Promise(() => {
          testDone();
        });
      });
      const handleResult = () => {
        expect(false).toBeTruthy();
        testDone();
      };
      initializableObject.finalize(_.cloneDeep(optionsIn)).then(handleResult).catch(handleResult);
    }, DEFAULT_TIMEOUT);

    it("Given _handleFinalization returns error Then must return the error", function (testDone) {
      const initializableObject = createInstance();
      const expectedError = new Error("The error");

      spyOn(initializableObject, 'canFinalize').and.callFake(function () {
        return true;
      });
      spyOn(initializableObject, '_handleFinalization').and.callFake(() => {
        return new Promise((resolve, reject) => reject(expectedError));
      });
      initializableObject.finalize()
        .then(() => {
          expect(false).toBeTruthy();
          testDone();
        })
        .catch(error => {
          expect(error).toBe(expectedError);
          testDone();
        });
    }, DEFAULT_TIMEOUT);

    it("Given valid state Then must change current state=Finalizing before calling _handleFinalization", function (testDone) {
      const initializableObject = createInstance();

      const slotFinalizing = jasmine.createSpy("onFinalizing");
      initializableObject.on('finalizing', slotFinalizing);

      spyOn(initializableObject, 'canFinalize').and.callFake(function () {
        return true;
      });
      spyOn(initializableObject, '_handleFinalization').and.callFake(() => {
        expect(initializableObject.currentState).toEqual("Finalizing");
        expect(slotFinalizing).toHaveBeenCalled();
        return new Promise(() => testDone());
      });
      let handleResult = () => {
        expect(false).toBeTruthy();
        testDone();
      };
      initializableObject.finalize().then(handleResult).catch(handleResult);
    }, DEFAULT_TIMEOUT);

    it("Given valid state and _handleFinalization returns error Then must emit finalizationFailed and currentState=Initialized", function (testDone) {
      const initializableObject = createInstance();
      initializableObject.properties.currentState = 'Initialized';

      const slotFinalizationFailed = jasmine.createSpy("onFinalizationFailed");
      initializableObject.on('finalizationFailed', slotFinalizationFailed);

      spyOn(initializableObject, 'canFinalize').and.callFake(function () {
        return true;
      });
      spyOn(initializableObject, '_handleFinalization').and.callFake(() => {
        return new Promise((resolve, reject) => reject(new Error("The error")));
      });
      initializableObject.finalize()
        .then(() => {
          expect(false).toBeTruthy();
          testDone();
        })
        .catch(() => {
          expect(initializableObject.currentState).toEqual("Initialized");
          expect(slotFinalizationFailed).toHaveBeenCalled();
          testDone();
        });
    }, DEFAULT_TIMEOUT);

    it("Given valid state and _handleFinalization returns ok Then must emit finalizationSucceed and currentState=NotInitialized", function (testDone) {
      const initializableObject = createInstance();

      const slotFinalizationSucceed = jasmine.createSpy("onFinalizationSucceed");
      initializableObject.on('finalizationSucceed', slotFinalizationSucceed);

      spyOn(initializableObject, 'canFinalize').and.callFake(function () {
        return true;
      });
      spyOn(initializableObject, '_handleFinalization').and.callFake(() => {
        return new Promise(resolve => resolve());
      });
      initializableObject.finalize()
        .then(() => {
          expect(initializableObject.currentState).toEqual("NotInitialized");
          expect(slotFinalizationSucceed).toHaveBeenCalled();
          testDone();
        })
        .catch(() => {
          expect(false).toBeTruthy();
          testDone();
        });
    }, DEFAULT_TIMEOUT);
  }); // End of finalize

  describe('#_handleFinalization', function () {
    it('Given canStop and canFinalize to return true Then must call expected function', function (testDone) {
      const instance = createInstance();

      const objectStateWatcher = {
        canStop: jasmine.createSpy('canStop').and.returnValue(true),
        stop: jasmine.createSpy('stop').and.callFake(() => new Promise(resolve => setImmediate(resolve, {}))),
        canFinalize: jasmine.createSpy('canFinalize').and.returnValue(true),
        finalize: jasmine.createSpy('finalize').and.callFake(() => new Promise(resolve => setImmediate(resolve, {})))
      };
      instance.properties._objectStateWatcherContext = {
        instance: objectStateWatcher
      };

      const options = {
        a: 99
      };

      instance._handleFinalization(options)
        .then(() => {
          expect(objectStateWatcher.canStop).toHaveBeenCalledTimes(1);
          expect(objectStateWatcher.canFinalize).toHaveBeenCalledTimes(1);
          expect(objectStateWatcher.stop).toHaveBeenCalledTimes(1);
          expect(objectStateWatcher.finalize).toHaveBeenCalledTimes(1);
          expect(objectStateWatcher.finalize).toHaveBeenCalledWith(options);
          expect(instance.properties._objectStateWatcherContext).toBeUndefined();
          testDone();
        })
        .catch(error => {
          expect(error).toBeUndefined();
          expect('Must not be called').toBeUndefined();
          testDone();
        });
    });

    it('Given canStop and canFinalize to return false Then must do nothing', function (testDone) {
      const instance = createInstance();

      const objectStateWatcher = {
        canStop: jasmine.createSpy('canStop').and.returnValue(false),
        stop: jasmine.createSpy('stop').and.callFake(() => new Promise(resolve => setImmediate(resolve, {}))),
        canFinalize: jasmine.createSpy('canFinalize').and.returnValue(false),
        finalize: jasmine.createSpy('finalize').and.callFake(() => new Promise(resolve => setImmediate(resolve, {})))
      };
      instance.properties._objectStateWatcherContext = {
        instance: objectStateWatcher
      };

      const options = {
        a: 99
      };

      instance._handleFinalization(options)
        .then(() => {
          expect(objectStateWatcher.canStop).toHaveBeenCalledTimes(1);
          expect(objectStateWatcher.canFinalize).toHaveBeenCalledTimes(1);
          expect(objectStateWatcher.stop).not.toHaveBeenCalled();
          expect(objectStateWatcher.finalize).not.toHaveBeenCalled();
          expect(instance.properties._objectStateWatcherContext).toBeUndefined();
          testDone();
        })
        .catch(error => {
          expect(error).toBeUndefined();
          expect('Must not be called').toBeUndefined();
          testDone();
        });
    });
  }); // #_handleFinalization
});
