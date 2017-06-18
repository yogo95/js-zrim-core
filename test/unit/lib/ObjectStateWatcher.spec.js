describe("Unit Test - ObjectStateWatcher", function () {
  const ObjectStateWatcher = require('./../../../lib/ObjectStateWatcher'),
    _ = require('lodash'),
    RunnableObject = require("./../../../lib/RunnableObject"),
    BaseObject = require("./../../../lib/BaseObject"),
    Joi = require('joi'),
    exceptions = require('./../../../lib/exceptions'),
    LoggerMock = require("./../../../lib/mocks").LoggerMock;

  /**
   * Create instance for test
   * @return {ObjectStateWatcher} The object created
   */
  function createInstance() {
    return new ObjectStateWatcher({
      loggerTarget: new LoggerMock()
    });
  }

  describe("#construct", function () {
    it("Without operator new Then must return new instance", function () {
      const a = ObjectStateWatcher(), b = ObjectStateWatcher();

      expect(a).toEqual(jasmine.any(ObjectStateWatcher));
      expect(b).toEqual(jasmine.any(ObjectStateWatcher));
      expect(a).not.toBe(b);
    });

    it("With operator new Then must return new instance", function () {
      const a = new ObjectStateWatcher(), b = new ObjectStateWatcher();

      expect(a).toEqual(jasmine.any(ObjectStateWatcher));
      expect(b).toEqual(jasmine.any(ObjectStateWatcher));
      expect(a).not.toBe(b);
    });
  }); // #construct

  describe("#Signals", function () {
    it("Must contains new signals", function () {
      expect(ObjectStateWatcher.Signals).toEqual(_.assign({}, RunnableObject.Signals, {
        synchronized: "synchronized",
        desynchronized: "desynchronized"
      }));
    });
  }); // #Signals

  describe("#_initFromConstructor", function () {
    it("Then must initialize properties", function () {
      spyOn(RunnableObject.prototype, '_initFromConstructor').and.callThrough();
      spyOn(ObjectStateWatcher.prototype, '_initFromConstructor').and.callThrough();

      const inputOptions = {
        loggerTarget: new LoggerMock()
      };
      const instance = new ObjectStateWatcher(inputOptions);

      expect(RunnableObject.prototype._initFromConstructor).toHaveBeenCalledWith(inputOptions);
      expect(ObjectStateWatcher.prototype._initFromConstructor).toHaveBeenCalledWith(inputOptions);
      expect(instance.properties.objectDescriptions).toEqual([]);
      expect(instance.properties.stateWaiting).toEqual("Ready");
      expect(instance.properties.synchronized).toBeFalsy();
    });
  }); // #_initFromConstructor

  describe("#isSynchronized", function () {
    it("Given synchronized=false Then must return false", function () {
      const instance = createInstance();

      instance.properties.synchronized = false;
      expect(instance.isSynchronized()).toBeFalsy();
    });

    it("Given synchronized=true Then must return true", function () {
      const instance = createInstance();

      instance.properties.synchronized = true;
      expect(instance.isSynchronized()).toBeTruthy();
    });
  });

  describe("#_handleInitialization", function () {
    it("Given RunnableObject.prototype._handleInitialization to fail Then must return error", function (testDone) {
      const instance = createInstance();

      const expectedError = new Error("Unit Test - Fake error");
      spyOn(RunnableObject.prototype, '_handleInitialization').and.callFake(() => new Promise((resolve, reject) => setImmediate(reject, expectedError)));

      const inputOptions = {
        a: 1
      };
      instance._handleInitialization(inputOptions)
        .then(() => {
          expect("Must not be called").toBeUndefined();
          testDone();
        })
        .catch(error => {
          expect(error).toBe(expectedError);
          expect(RunnableObject.prototype._handleInitialization).toHaveBeenCalledTimes(1);
          expect(RunnableObject.prototype._handleInitialization).toHaveBeenCalledWith(inputOptions);
          testDone();
        });
    });

    it("Given invalid options.objects Then must return error", function (testDone) {
      const instance = createInstance();

      spyOn(RunnableObject.prototype, '_handleInitialization').and.callFake(() => new Promise(resolve => setImmediate(resolve)));

      spyOn(Joi, 'validate').and.callThrough();

      const inputOptions = {
        objects: [{}],
        stateWaiting: "none"
      };
      instance._handleInitialization(inputOptions)
        .then(() => {
          expect("Must not be called").toBeUndefined();
          testDone();
        })
        .catch(error => {
          expect(error).toEqual(jasmine.any(exceptions.IllegalArgumentException));
          expect(RunnableObject.prototype._handleInitialization).toHaveBeenCalledTimes(1);
          expect(RunnableObject.prototype._handleInitialization).toHaveBeenCalledWith(inputOptions);
          expect(Joi.validate).toHaveBeenCalledTimes(1);
          expect(Joi.validate).toHaveBeenCalledWith(inputOptions, jasmine.any(Object), jasmine.any(Function));
          testDone();
        });
    });

    it("Given invalid options.stateWaiting Then must return error", function (testDone) {
      const instance = createInstance();

      spyOn(RunnableObject.prototype, '_handleInitialization').and.callFake(() => new Promise(resolve => setImmediate(resolve)));

      spyOn(Joi, 'validate').and.callThrough();

      const inputOptions = {
        objects: [new BaseObject()],
        stateWaiting: ""
      };
      instance._handleInitialization(inputOptions)
        .then(() => {
          expect("Must not be called").toBeUndefined();
          testDone();
        })
        .catch(error => {
          expect(error).toEqual(jasmine.any(exceptions.IllegalArgumentException));
          expect(RunnableObject.prototype._handleInitialization).toHaveBeenCalledTimes(1);
          expect(RunnableObject.prototype._handleInitialization).toHaveBeenCalledWith(inputOptions);
          expect(Joi.validate).toHaveBeenCalledTimes(1);
          expect(Joi.validate).toHaveBeenCalledWith(inputOptions, jasmine.any(Object), jasmine.any(Function));
          testDone();
        });
    });

    it("Given valid options Then must return success", function (testDone) {
      const instance = createInstance();

      spyOn(RunnableObject.prototype, '_handleInitialization').and.callFake(() => new Promise(resolve => setImmediate(resolve)));

      spyOn(Joi, 'validate').and.callThrough();

      const inputOptions = {
        objects: [new BaseObject()],
        stateWaiting: "MyState"
      };

      const expectedObjectDescriptions = [{
        object: inputOptions.objects[0],
        state: undefined,
        handler: function myHandler() { }
      }];

      spyOn(instance, '_createStateChangedHandler').and.callFake(() => expectedObjectDescriptions[0].handler);

      instance._handleInitialization(inputOptions)
        .then(() => {
          expect(RunnableObject.prototype._handleInitialization).toHaveBeenCalledTimes(1);
          expect(RunnableObject.prototype._handleInitialization).toHaveBeenCalledWith(inputOptions);
          expect(Joi.validate).toHaveBeenCalledTimes(1);
          expect(Joi.validate).toHaveBeenCalledWith(inputOptions, jasmine.any(Object), jasmine.any(Function));
          expect(instance._createStateChangedHandler).toHaveBeenCalledTimes(1);
          expect(instance._createStateChangedHandler).toHaveBeenCalledWith(0);
          expect(instance.properties.stateWaiting).toEqual('MyState');
          expect(instance.properties.objectDescriptions).toEqual(expectedObjectDescriptions);
          testDone();
        })
        .catch(error => {
          expect("Must not be called").toBeUndefined();
          expect(error).toBeUndefined();
          testDone();
        });
    });
  }); // #_handleInitialization

  describe("#_createStateChangedHandler", function () {
    it("Given invalid index Then must throw error", function () {
      const instance = createInstance();

      expect(() => {
        instance._createStateChangedHandler({});
      }).toThrow(jasmine.any(exceptions.IllegalArgumentException));

      expect(() => {
        instance._createStateChangedHandler(-1);
      }).toThrow(jasmine.any(exceptions.IllegalArgumentException));
    });

    it("Given valid index Then must return expected value", function () {
      const instance = createInstance();
      expect(instance._createStateChangedHandler(1)).toEqual(jasmine.any(Function));
    });
  }); // #_createStateChangedHandler

  describe("#_stateChangedHandler", function () {
    it("Given state Then must update cache state and call _updateSynchronizedState", function (testDone) {
      const instance = createInstance();

      spyOn(instance, '_updateSynchronizedState').and.callFake(() => {
        expect(instance.properties.objectDescriptions[0].state).toEqual("myState");
        testDone()
      });

      instance.properties.objectDescriptions = [{
        state: undefined
      }];

      instance._stateChangedHandler(0, "myState");
    });
  }); // #_stateChangedHandler
});
