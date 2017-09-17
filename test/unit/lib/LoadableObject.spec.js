/**
 * Unit Test - LoadableObject
 */

const LoadableObject = require("../../../lib/LoadableObject");

const _ = require('lodash'),
  InitializableObject = require('../../../lib/InitializableObject'),
  IllegalStateException = require("../../../lib/exceptions/IllegalStateException");

const DEFAULT_TIMEOUT = 2000;

describe("Unit Test - LoadableObject", function () {

  describe("When require the baseObject", function () {

    it("Must be a function", function () {
      expect(LoadableObject).toEqual(jasmine.any(Function));
    });

    it("Must have the expected States", function () {
      expect(LoadableObject.States).toEqual(jasmine.any(Object));
      if (_.isObject(LoadableObject.States)) {
        const expectedStates = _.merge({
          Loading: "Loading",
          UnLoading: "UnLoading"
        }, InitializableObject.States);

        expect(LoadableObject.States).toEqual(expectedStates);
      }
    });

    it("Must have the expected Signals", function () {
      expect(LoadableObject.Signals).toEqual(jasmine.any(Object));
      if (_.isObject(LoadableObject.Signals)) {
        const expectedSignals = _.merge({
          loading: "loading",
          loadFailed: "loadFailed",
          loaded: "loaded",
          unLoading: "unLoading",
          unLoadFailed: "unLoadFailed",
          unLoaded: "unLoaded"
        }, InitializableObject.Signals);

        expect(LoadableObject.Signals).toEqual(expectedSignals);
      }
    });
  }); // End when require

  describe("When instantiate", function () {
    it("When not using the new operator Then must return new instance", function () {
      const value = LoadableObject();
      expect(value).toEqual(jasmine.any(LoadableObject));
    });

    it("When using the new operator must return new instance", function () {
      const value = new LoadableObject();
      expect(value).toEqual(jasmine.any(LoadableObject));
    });

    describe("When canInitialize", function () {
      it("Given state NotInitialized Then must return true", function () {
        const instance = new LoadableObject();
        instance.properties.currentState = LoadableObject.States.NotInitialized;

        const response = instance.canInitialize();
        expect(response).toBeTruthy();
      });

      it("Given state other Than NotInitialized Then must return true", function () {
        const instance = new LoadableObject();
        instance.properties.currentState = LoadableObject.States.Ready;

        const response = instance.canInitialize();
        expect(response).toBeFalsy();
      });
    }); // end of canInitialize

    describe("When canFinalize", function () {
      it("Given state ready Then must return true", function () {
        const instance = new LoadableObject();
        instance.properties.currentState = LoadableObject.States.Ready;

        const response = instance.canFinalize();
        expect(response).toBeTruthy();
      });

      it("Given state Initialized Then must return true", function () {
        const instance = new LoadableObject();
        instance.properties.currentState = LoadableObject.States.Initialized;

        const response = instance.canFinalize();
        expect(response).toBeTruthy();
      });

      it("Given state other Than ready or Initialized Then must return true", function () {
        const instance = new LoadableObject();
        instance.properties.currentState = LoadableObject.States.NotInitialized;

        const response = instance.canFinalize();
        expect(response).toBeFalsy();
      });
    }); // end of canFinalize
  }); // End of When instantiate

  describe("When canLoad", function () {
    it("Given state Initialized Then must return true", function () {
      const instance = new LoadableObject();
      instance.properties.currentState = LoadableObject.States.Initialized;

      const response = instance.canLoad();
      expect(response).toBeTruthy();
    });

    it("Given state Ready Then must return true", function () {
      const instance = new LoadableObject();
      instance.properties.currentState = LoadableObject.States.Ready;

      const response = instance.canLoad();
      expect(response).toBeTruthy();
    });

    it("Given state other Than Ready or Initialized Then must return true", function () {
      const instance = new LoadableObject();
      instance.properties.currentState = LoadableObject.States.NotInitialized;

      const response = instance.canLoad();
      expect(response).toBeFalsy();
    });
  }); // end of canLoad

  describe("When canUnLoad", function () {
    it("Given state ready Then must return true", function () {
      const instance = new LoadableObject();
      instance.properties.currentState = LoadableObject.States.Ready;

      const response = instance.canUnLoad();
      expect(response).toBeTruthy();
    });

    it("Given state other Than ready or Initialized Then must return true", function () {
      const instance = new LoadableObject();
      instance.properties.currentState = LoadableObject.States.NotInitialized;

      const response = instance.canUnLoad();
      expect(response).toBeFalsy();
    });
  }); // end of canUnLoad

  describe("When load", function () {
    it("Then must call canLoad", function (testDone) {
      const instance = new LoadableObject();

      spyOn(instance, 'canLoad').and.callThrough();
      const handleResult = () => {
        expect(instance.canLoad).toHaveBeenCalled();
        testDone();
      };
      instance.load().then(handleResult).catch(handleResult);
    }, DEFAULT_TIMEOUT);

    it("Given canLoad return false Then must return error", function (testDone) {
      const instance = new LoadableObject();

      spyOn(instance, 'canLoad').and.callFake(function () {
        return false;
      });
      instance.load()
        .then(() => {
          expect(false).toBeTruthy();
          testDone();
        })
        .catch(error => {
          expect(instance.canLoad).toHaveBeenCalled();
          expect(error).toEqual(jasmine.any(IllegalStateException));
          testDone();
        });
    }, DEFAULT_TIMEOUT);

    it("Given valid state Then must call _handleLoad", function (testDone) {
      const instance = new LoadableObject();

      spyOn(instance, 'canLoad').and.callFake(function () {
        return true;
      });
      spyOn(instance, '_handleLoad').and.callFake(function () {
        return new Promise(() => {
          expect(true).toBeTruthy();
          testDone();
        });
      });
      const handleResult = () => {
        expect(false).toBeTruthy();
        testDone();
      };
      instance.load().then(handleResult).catch(handleResult);
    }, DEFAULT_TIMEOUT);

    it("Given _handleLoad returns error Then must return the error", function (testDone) {
      const instance = new LoadableObject();
      const expectedError = new Error("The error");

      spyOn(instance, 'canLoad').and.callFake(function () {
        return true;
      });
      spyOn(instance, '_handleLoad').and.callFake(() => {
        return new Promise((resolve, reject) => {
          reject(expectedError);
        });
      });
      instance.load()
        .then(() => {
          expect(false).toBeTruthy();
          testDone();
        })
        .catch(error => {
          expect(error).toBe(expectedError);
          testDone();
        });
    }, DEFAULT_TIMEOUT);

    it("Given valid state Then must change current state=Loading before calling _handleLoad", function (testDone) {
      const instance = new LoadableObject();

      const slotConnecting = jasmine.createSpy("onConnecting");
      instance.on('loading', slotConnecting);

      spyOn(instance, 'canLoad').and.callFake(function () {
        return true;
      });
      spyOn(instance, '_handleLoad').and.callFake(function () {
        expect(instance.currentState).toEqual("Loading");
        expect(slotConnecting).toHaveBeenCalled();
        return new Promise(() => {
          expect(true).toBeTruthy();
          testDone();
        });
      });
      const handleResult = () => {
        expect(false).toBeTruthy();
        testDone();
      };
      instance.load().then(handleResult).catch(handleResult);
    }, DEFAULT_TIMEOUT);

    it("Given valid state and _handleLoad returns error Then must emit loadFailed and currentState=Initialized", function (testDone) {
      const instance = new LoadableObject();
      instance.properties.currentState = "Initialized";

      const slotConnectionFailed = jasmine.createSpy("onConnectionFailed");
      instance.on('loadFailed', slotConnectionFailed);

      spyOn(instance, 'canLoad').and.callFake(function () {
        return true;
      });
      spyOn(instance, '_handleLoad').and.callFake(function () {
        return new Promise((resolve, reject) => {
          reject(new Error("The error"));
        });
      });
      instance.load()
        .then(() => {
          expect(false).toBeTruthy();
          testDone();
        })
        .catch(() => {
          expect(instance.currentState).toEqual("Initialized");
          expect(slotConnectionFailed).toHaveBeenCalled();
          testDone();
        });
    }, DEFAULT_TIMEOUT);

    it("Given valid state and _handleLoad returns ok Then must emit loaded and currentState=Ready", function (testDone) {
      const instance = new LoadableObject();

      const slotConnected = jasmine.createSpy("onConnectionSucceed");
      instance.on('loaded', slotConnected);

      spyOn(instance, 'canLoad').and.callFake(function () {
        return true;
      });
      instance.load()
        .then(() => {
          expect(instance.currentState).toEqual("Ready");
          expect(slotConnected).toHaveBeenCalled();
          testDone();
        })
        .catch(() => {
          expect(false).toBeTruthy();
          testDone();
        });
    }, DEFAULT_TIMEOUT);
  }); // End of load

  describe("When unLoad", function () {
    it("Then must call canUnLoad", function (testDone) {
      const instance = new LoadableObject();

      spyOn(instance, 'canUnLoad').and.callThrough();
      const handleResult = () => {
        expect(instance.canUnLoad).toHaveBeenCalled();
        testDone();
      };
      instance.unLoad().then(handleResult).catch(handleResult);
    }, DEFAULT_TIMEOUT);

    it("Given canLoad return false Then must return error", function (testDone) {
      const instance = new LoadableObject();

      spyOn(instance, 'canUnLoad').and.callFake(function () {
        return false;
      });
      instance.unLoad()
        .then(() => {
          expect(false).toBeTruthy();
          testDone();
        })
        .catch(error => {
          expect(instance.canUnLoad).toHaveBeenCalled();
          expect(error).toEqual(jasmine.any(IllegalStateException));
          testDone();
        });
    }, DEFAULT_TIMEOUT);

    it("Given valid state Then must call _handleUnLoad", function (testDone) {
      const instance = new LoadableObject();

      spyOn(instance, 'canUnLoad').and.callFake(function () {
        return true;
      });
      spyOn(instance, '_handleUnLoad').and.callFake(function () {
        return new Promise(() => {
          testDone();
        });
      });
      const handleResult = () => {
        expect(false).toBeTruthy();
        testDone();
      };
      instance.unLoad().then(handleResult).catch(handleResult);
    }, DEFAULT_TIMEOUT);

    it("Given _handleUnLoad returns error Then must return the error", function (testDone) {
      const instance = new LoadableObject();
      const expectedError = new Error("The error");

      spyOn(instance, 'canUnLoad').and.callFake(function () {
        return true;
      });
      spyOn(instance, '_handleUnLoad').and.callFake(function () {
        return new Promise((resolve, reject) => {
          reject(expectedError);
        });
      });
      instance.unLoad()
        .then((() => {
          expect(false).toBeTruthy();
          testDone();
        }))
        .catch(error => {
          expect(error).toBe(expectedError);
          testDone();
        });
    }, DEFAULT_TIMEOUT);

    it("Given valid state Then must change current state=UnLoading before calling _handleUnLoad", function (testDone) {
      const instance = new LoadableObject();

      const slotDisconnecting = jasmine.createSpy("onDisconnecting");
      instance.on('unLoading', slotDisconnecting);

      spyOn(instance, 'canUnLoad').and.callFake(function () {
        return true;
      });
      spyOn(instance, '_handleUnLoad').and.callFake(function () {
        expect(instance.currentState).toEqual("UnLoading");
        expect(slotDisconnecting).toHaveBeenCalled();
        return new Promise(() => testDone());
      });
      const handleResult = () => {
        expect(false).toBeTruthy();
        testDone();
      };
      instance.unLoad().then(handleResult).catch(handleResult);
    }, DEFAULT_TIMEOUT);

    it("Given valid state and _handleUnLoad returns error Then must emit loadFailed and currentState=Initialized", function (testDone) {
      const instance = new LoadableObject();
      instance.properties.currentState = "Ready";

      const slotDisconnectionFailed = jasmine.createSpy("onDisconnectionFailed");
      instance.on('unLoadFailed', slotDisconnectionFailed);

      spyOn(instance, 'canUnLoad').and.callFake(function () {
        return true;
      });
      spyOn(instance, '_handleUnLoad').and.callFake(function () {
        return new Promise((resolve, reject) => reject(new Error("The error")));
      });
      instance.unLoad()
        .then(() => {
          expect(false).toBeTruthy();
          testDone();
        })
        .catch(() => {
          expect(instance.currentState).toEqual("Ready");
          expect(slotDisconnectionFailed).toHaveBeenCalled();
          testDone();
        });
    }, DEFAULT_TIMEOUT);

    it("Given valid state and _handleUnLoad returns ok Then must emit loaded and currentState=Initialized", function (testDone) {
      const instance = new LoadableObject();

      const slotDisconnected = jasmine.createSpy("onDisconnected");
      instance.on('unLoaded', slotDisconnected);

      spyOn(instance, 'canUnLoad').and.callFake(function () {
        return true;
      });
      instance.unLoad()
        .then(() => {
          expect(instance.currentState).toEqual("Initialized");
          expect(slotDisconnected).toHaveBeenCalled();
          testDone();
        })
        .catch(() => {
          expect(false).toBeTruthy();
          testDone();
        });
    }, DEFAULT_TIMEOUT);
  }); // End of load

  describe("When _handleFinalization", function () {
    it("Given state Ready Then must call unLoad", function (testDone) {
      const instance = new LoadableObject();

      spyOn(instance, 'isReady').and.callFake(function () {
        return true;
      });

      spyOn(instance, 'unLoad').and.callFake(function () {
        return new Promise(() => {
          expect(true).toBeTruthy();
          testDone();
        });
      });

      const handleResult = () => {
        expect(false).toBeTruthy();
        testDone();
      };
      instance._handleFinalization().then(handleResult).catch(handleResult);
    }, DEFAULT_TIMEOUT);

    it("Given state Ready and unLoad returns error Then must return error", function (testDone) {
      const instance = new LoadableObject();

      spyOn(instance, 'isReady').and.callFake(function () {
        return true;
      });

      spyOn(instance, 'unLoad').and.callFake(function () {
        return new Promise((resolve, reject) => reject(new Error("The error")));
      });

      instance._handleFinalization()
        .then(() => {
          expect(false).toBeTruthy();
          testDone();
        })
        .catch((error) => {
          expect(error).toEqual(jasmine.any(Error));
          testDone();
        });
    }, DEFAULT_TIMEOUT);
  }); // End of _handleFinalization
});
