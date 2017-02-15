/**
 * Unit Test - ConnectableObject
 */

const ConnectableObject = require("../../../lib/ConnectableObject");

const _ = require('lodash'),
  InitializableObject = require('../../../lib/InitializableObject'),
  IllegalStateException = require("../../../lib/exceptions/IllegalStateException")
  ;

const DEFAULT_TIMEOUT = 2000;

describe("Unit Test - ConnectableObject", function () {

  describe("When require the baseObject", function () {

    it("Must be a function", function () {
      expect(ConnectableObject).toEqual(jasmine.any(Function));
    });

    it("Must have the expected States", function () {
      expect(ConnectableObject.States).toEqual(jasmine.any(Object));
      if (_.isObject(ConnectableObject.States)) {
        const expectedStates = _.merge({
          Connecting: "Connecting",
          Disconnecting: "Disconnecting"
        }, InitializableObject.States);

        expect(ConnectableObject.States).toEqual(expectedStates);
      }
    });

    it("Must have the expected Signals", function () {
      expect(ConnectableObject.Signals).toEqual(jasmine.any(Object));
      if (_.isObject(ConnectableObject.Signals)) {
        const expectedSignals = _.merge({
          connecting: "connecting",
          connectionFailed: "connectionFailed",
          connected: "connected",
          connectionLost: "connectionLost",
          reconnected: "reconnected",
          disconnecting: "disconnecting",
          disconnectionFailed: "disconnectionFailed",
          disconnected: "disconnected"
        }, InitializableObject.Signals);

        expect(ConnectableObject.Signals).toEqual(expectedSignals);
      }
    });
  }); // End when require

  describe("When instantiate", function () {
    it("When not using the new operator Then must return new instance", function () {
      const value = ConnectableObject();
      expect(value).toEqual(jasmine.any(ConnectableObject));
    });

    it("When using the new operator must return new instance", function () {
      const value = new ConnectableObject();
      expect(value).toEqual(jasmine.any(ConnectableObject));
    });

    describe("When canInitialize", function () {
      it("Given state NotInitialized Then must return true", function () {
        const instance = new ConnectableObject();
        instance.properties.currentState = ConnectableObject.States.NotInitialized;

        const response = instance.canInitialize();
        expect(response).toBeTruthy();
      });

      it("Given state other Than NotInitialized Then must return true", function () {
        const instance = new ConnectableObject();
        instance.properties.currentState = ConnectableObject.States.Ready;

        const response = instance.canInitialize();
        expect(response).toBeFalsy();
      });
    }); // end of canInitialize

    describe("When canFinalize", function () {
      it("Given state ready Then must return true", function () {
        const instance = new ConnectableObject();
        instance.properties.currentState = ConnectableObject.States.Ready;

        const response = instance.canFinalize();
        expect(response).toBeTruthy();
      });

      it("Given state Initialized Then must return true", function () {
        const instance = new ConnectableObject();
        instance.properties.currentState = ConnectableObject.States.Initialized;

        const response = instance.canFinalize();
        expect(response).toBeTruthy();
      });

      it("Given state other Than ready or Initialized Then must return true", function () {
        const instance = new ConnectableObject();
        instance.properties.currentState = ConnectableObject.States.NotInitialized;

        const response = instance.canFinalize();
        expect(response).toBeFalsy();
      });
    }); // end of canFinalize
  }); // End of When instantiate

  describe("When canConnect", function () {
    it("Given state Initialized Then must return true", function () {
      const instance = new ConnectableObject();
      instance.properties.currentState = ConnectableObject.States.Initialized;

      const response = instance.canConnect();
      expect(response).toBeTruthy();
    });

    it("Given state Ready Then must return true", function () {
      const instance = new ConnectableObject();
      instance.properties.currentState = ConnectableObject.States.Ready;

      const response = instance.canConnect();
      expect(response).toBeTruthy();
    });

    it("Given state other Than Ready or Initialized Then must return true", function () {
      const instance = new ConnectableObject();
      instance.properties.currentState = ConnectableObject.States.NotInitialized;

      const response = instance.canConnect();
      expect(response).toBeFalsy();
    });
  }); // end of canConnect

  describe("When canDisconnect", function () {
    it("Given state ready Then must return true", function () {
      const instance = new ConnectableObject();
      instance.properties.currentState = ConnectableObject.States.Ready;

      const response = instance.canDisconnect();
      expect(response).toBeTruthy();
    });

    it("Given state other Than ready or Initialized Then must return true", function () {
      const instance = new ConnectableObject();
      instance.properties.currentState = ConnectableObject.States.NotInitialized;

      const response = instance.canDisconnect();
      expect(response).toBeFalsy();
    });
  }); // end of canDisconnect

  describe("When connect", function () {
    it("Then must call canConnect", function (testDone) {
      const instance = new ConnectableObject();

      spyOn(instance, 'canConnect').and.callThrough();
      const handleResult = () => {
        expect(instance.canConnect).toHaveBeenCalled();
        testDone();
      };
      instance.connect().then(handleResult).catch(handleResult);
    }, DEFAULT_TIMEOUT);

    it("Given canConnect return false Then must return error", function (testDone) {
      const instance = new ConnectableObject();

      spyOn(instance, 'canConnect').and.callFake(function () {
        return false;
      });
      instance.connect()
        .then(() => {
          expect(false).toBeTruthy();
          testDone();
        })
        .catch(error => {
          expect(instance.canConnect).toHaveBeenCalled();
          expect(error).toEqual(jasmine.any(IllegalStateException));
          testDone();
        });
    }, DEFAULT_TIMEOUT);

    it("Given valid state Then must call _handleConnection", function (testDone) {
      const instance = new ConnectableObject();

      spyOn(instance, 'canConnect').and.callFake(function () {
        return true;
      });
      spyOn(instance, '_handleConnection').and.callFake(function () {
        return new Promise(() => {
          expect(true).toBeTruthy();
          testDone();
        });
      });
      const handleResult = () => {
        expect(false).toBeTruthy();
        testDone();
      };
      instance.connect().then(handleResult).catch(handleResult);
    }, DEFAULT_TIMEOUT);

    it("Given _handleConnection returns error Then must return the error", function (testDone) {
      const instance = new ConnectableObject();
      const expectedError = new Error("The error");

      spyOn(instance, 'canConnect').and.callFake(function () {
        return true;
      });
      spyOn(instance, '_handleConnection').and.callFake(() => {
        return new Promise((resolve, reject) => {
          reject(expectedError);
        });
      });
      instance.connect()
        .then(() => {
          expect(false).toBeTruthy();
          testDone();
        })
        .catch(error => {
          expect(error).toBe(expectedError);
          testDone();
        });
    }, DEFAULT_TIMEOUT);

    it("Given valid state Then must change current state=Connecting before calling _handleConnection", function (testDone) {
      const instance = new ConnectableObject();

      const slotConnecting = jasmine.createSpy("onConnecting");
      instance.on('connecting', slotConnecting);

      spyOn(instance, 'canConnect').and.callFake(function () {
        return true;
      });
      spyOn(instance, '_handleConnection').and.callFake(function () {
        expect(instance.currentState).toEqual("Connecting");
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
      instance.connect().then(handleResult).catch(handleResult);
    }, DEFAULT_TIMEOUT);

    it("Given valid state and _handleConnection returns error Then must emit connectionFailed and currentState=Initialized", function (testDone) {
      const instance = new ConnectableObject();
      instance.properties.currentState = "Initialized";

      const slotConnectionFailed = jasmine.createSpy("onConnectionFailed");
      instance.on('connectionFailed', slotConnectionFailed);

      spyOn(instance, 'canConnect').and.callFake(function () {
        return true;
      });
      spyOn(instance, '_handleConnection').and.callFake(function () {
        return new Promise((resolve, reject) => {
          reject(new Error("The error"));
        });
      });
      instance.connect()
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

    it("Given valid state and _handleConnection returns ok Then must emit connected and currentState=Ready", function (testDone) {
      const instance = new ConnectableObject();

      const slotConnected = jasmine.createSpy("onConnectionSucceed");
      instance.on('connected', slotConnected);

      spyOn(instance, 'canConnect').and.callFake(function () {
        return true;
      });
      instance.connect().then(() => {
          expect(instance.currentState).toEqual("Ready");
          expect(slotConnected).toHaveBeenCalled();
          testDone();
        })
        .catch(() => {
          expect(false).toBeTruthy();
          testDone();
        });
    }, DEFAULT_TIMEOUT);
  }); // End of connect

  describe("When disconnect", function () {
    it("Then must call canDisconnect", function (testDone) {
      const instance = new ConnectableObject();

      spyOn(instance, 'canDisconnect').and.callThrough();
      const handleResult = () => {
        expect(instance.canDisconnect).toHaveBeenCalled();
        testDone();
      };
      instance.disconnect().then(handleResult).catch(handleResult);
    }, DEFAULT_TIMEOUT);

    it("Given canConnect return false Then must return error", function (testDone) {
      const instance = new ConnectableObject();

      spyOn(instance, 'canDisconnect').and.callFake(function () {
        return false;
      });
      instance.disconnect()
        .then(() => {
          expect(false).toBeTruthy();
          testDone();
        })
        .catch(error => {
          expect(instance.canDisconnect).toHaveBeenCalled();
          expect(error).toEqual(jasmine.any(IllegalStateException));
          testDone();
        });
    }, DEFAULT_TIMEOUT);

    it("Given valid state Then must call _handleDisconnection", function (testDone) {
      const instance = new ConnectableObject();

      spyOn(instance, 'canDisconnect').and.callFake(function () {
        return true;
      });
      spyOn(instance, '_handleDisconnection').and.callFake(function () {
        return new Promise(() => {
          testDone();
        });
      });
      const handleResult = () => {
        expect(false).toBeTruthy();
        testDone();
      };
      instance.disconnect().then(handleResult).catch(handleResult);
    }, DEFAULT_TIMEOUT);

    it("Given _handleDisconnection returns error Then must return the error", function (testDone) {
      const instance = new ConnectableObject();
      const expectedError = new Error("The error");

      spyOn(instance, 'canDisconnect').and.callFake(function () {
        return true;
      });
      spyOn(instance, '_handleDisconnection').and.callFake(function () {
        return new Promise((resolve, reject) => {
          reject(expectedError);
        })
      });
      instance.disconnect()
        .then((() => {
          expect(false).toBeTruthy();
          testDone();
        }))
        .catch(error => {
          expect(error).toBe(expectedError);
          testDone();
        });
    }, DEFAULT_TIMEOUT);

    it("Given valid state Then must change current state=Disconnecting before calling _handleDisconnection", function (testDone) {
      const instance = new ConnectableObject();

      const slotDisconnecting = jasmine.createSpy("onDisconnecting");
      instance.on('disconnecting', slotDisconnecting);

      spyOn(instance, 'canDisconnect').and.callFake(function () {
        return true;
      });
      spyOn(instance, '_handleDisconnection').and.callFake(function () {
        expect(instance.currentState).toEqual("Disconnecting");
        expect(slotDisconnecting).toHaveBeenCalled();
        return new Promise(() => testDone());
      });
      const handleResult = () => {
        expect(false).toBeTruthy();
        testDone();
      };
      instance.disconnect().then(handleResult).catch(handleResult);
    }, DEFAULT_TIMEOUT);

    it("Given valid state and _handleDisconnection returns error Then must emit connectionFailed and currentState=Initialized", function (testDone) {
      const instance = new ConnectableObject();
      instance.properties.currentState = "Ready";

      const slotDisconnectionFailed = jasmine.createSpy("onDisconnectionFailed");
      instance.on('disconnectionFailed', slotDisconnectionFailed);

      spyOn(instance, 'canDisconnect').and.callFake(function () {
        return true;
      });
      spyOn(instance, '_handleDisconnection').and.callFake(function () {
        return new Promise((resolve, reject) => reject(new Error("The error")));
      });
      instance.disconnect()
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

    it("Given valid state and _handleDisconnection returns ok Then must emit connected and currentState=Initialized", function (testDone) {
      const instance = new ConnectableObject();

      const slotDisconnected = jasmine.createSpy("onDisconnected");
      instance.on('disconnected', slotDisconnected);

      spyOn(instance, 'canDisconnect').and.callFake(function () {
        return true;
      });
      instance.disconnect()
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
  }); // End of connect

  describe("When _handleFinalization", function () {
    it("Given state Ready Then must call disconnect", function (testDone) {
      const instance = new ConnectableObject();

      spyOn(instance, 'isReady').and.callFake(function () {
        return true;
      });

      spyOn(instance, 'disconnect').and.callFake(function () {
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

    it("Given state Ready and disconnect returns error Then must return error", function (testDone) {
      const instance = new ConnectableObject();

      spyOn(instance, 'isReady').and.callFake(function () {
        return true;
      });

      spyOn(instance, 'disconnect').and.callFake(function () {
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

  describe("When _onConnectionLost", function () {
    it("Then must emit connectionLost", function (testDone) {
      const instance = new ConnectableObject();

      instance.on('connectionLost', function () {
        expect(true).toBeTruthy();
        testDone();
      });

      instance._onConnectionLost();
    }, DEFAULT_TIMEOUT);

    it("Then current state must be Initialized", function (testDone) {
      const instance = new ConnectableObject();

      instance._onConnectionLost()
        .then(() => {
          expect(instance.currentState).toEqual('Initialized');
          testDone();
        })
        .catch(() => {
          expect(false).toBeTruthy();
          testDone();
        })
    }, DEFAULT_TIMEOUT);
  }); // End of _onConnectionLost

  describe("When _onReconnected", function () {
    it("Then must emit connectionLost", function (testDone) {
      const instance = new ConnectableObject();

      instance.on('reconnected', function () {
        expect(true).toBeTruthy();
        testDone();
      });

      instance._onReconnected();
    }, DEFAULT_TIMEOUT);

    it("Then current state must be Ready", function (testDone) {
      const instance = new ConnectableObject();

      instance._onReconnected()
        .then(() => {
          expect(instance.currentState).toEqual('Ready');
          testDone();
        })
        .catch(() => {
          expect(false).toBeTruthy();
          testDone();
        });
    }, DEFAULT_TIMEOUT);
  }); // End of _onConnectionLost
});
