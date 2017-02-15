/**
 * Unit Test - ConnectableObject
 */

var ConnectableObject = require("../../../lib/ConnectableObject");

var _ = require('lodash'),
  InitializableObject = require('../../../lib/InitializableObject'),
  IllegalStateException = require("../../../lib/exceptions/IllegalStateException")
  ;

var DEFAULT_TIMEOUT = 2000;

describe("Unit Test - ConnectableObject", function () {

  describe("When require the baseObject", function () {

    it("Must be a function", function () {
      expect(ConnectableObject).toEqual(jasmine.any(Function));
    });

    it("Must have the expected States", function () {
      expect(ConnectableObject.States).toEqual(jasmine.any(Object));
      if (_.isObject(ConnectableObject.States)) {
        var expectedStates = _.merge({
          Connecting: "Connecting",
          Disconnecting: "Disconnecting"
        }, InitializableObject.States);

        expect(ConnectableObject.States).toEqual(expectedStates);
      }
    });

    it("Must have the expected Signals", function () {
      expect(ConnectableObject.Signals).toEqual(jasmine.any(Object));
      if (_.isObject(ConnectableObject.Signals)) {
        var expectedSignals = _.merge({
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
      var value = ConnectableObject();
      expect(value).toEqual(jasmine.any(ConnectableObject));
    });

    it("When using the new operator must return new instance", function () {
      var value = new ConnectableObject();
      expect(value).toEqual(jasmine.any(ConnectableObject));
    });

    describe("When canInitialize", function () {
      it("Given state NotInitialized Then must return true", function () {
        var connectableObject = new ConnectableObject();
        connectableObject.properties.currentState = ConnectableObject.States.NotInitialized;

        var response = connectableObject.canInitialize();
        expect(response).toBeTruthy();
      });

      it("Given state other Than NotInitialized Then must return true", function () {
        var connectableObject = new ConnectableObject();
        connectableObject.properties.currentState = ConnectableObject.States.Ready;

        var response = connectableObject.canInitialize();
        expect(response).toBeFalsy();
      });
    }); // end of canInitialize

    describe("When canFinalize", function () {
      it("Given state ready Then must return true", function () {
        var connectableObject = new ConnectableObject();
        connectableObject.properties.currentState = ConnectableObject.States.Ready;

        var response = connectableObject.canFinalize();
        expect(response).toBeTruthy();
      });
      it("Given state Initialized Then must return true", function () {
        var connectableObject = new ConnectableObject();
        connectableObject.properties.currentState = ConnectableObject.States.Initialized;

        var response = connectableObject.canFinalize();
        expect(response).toBeTruthy();
      });


      it("Given state other Than ready or Initialized Then must return true", function () {
        var connectableObject = new ConnectableObject();
        connectableObject.properties.currentState = ConnectableObject.States.NotInitialized;

        var response = connectableObject.canFinalize();
        expect(response).toBeFalsy();
      });
    }); // end of canFinalize
  }); // End of When instantiate

  describe("When canConnect", function () {
    it("Given state Initialized Then must return true", function () {
      var connectableObject = new ConnectableObject();
      connectableObject.properties.currentState = ConnectableObject.States.Initialized;

      var response = connectableObject.canConnect();
      expect(response).toBeTruthy();
    });

    it("Given state Ready Then must return true", function () {
      var connectableObject = new ConnectableObject();
      connectableObject.properties.currentState = ConnectableObject.States.Ready;

      var response = connectableObject.canConnect();
      expect(response).toBeTruthy();
    });

    it("Given state other Than Ready or Initialized Then must return true", function () {
      var connectableObject = new ConnectableObject();
      connectableObject.properties.currentState = ConnectableObject.States.NotInitialized;

      var response = connectableObject.canConnect();
      expect(response).toBeFalsy();
    });
  }); // end of canConnect

  describe("When canDisconnect", function () {
    it("Given state ready Then must return true", function () {
      var connectableObject = new ConnectableObject();
      connectableObject.properties.currentState = ConnectableObject.States.Ready;

      var response = connectableObject.canDisconnect();
      expect(response).toBeTruthy();
    });

    it("Given state other Than ready or Initialized Then must return true", function () {
      var connectableObject = new ConnectableObject();
      connectableObject.properties.currentState = ConnectableObject.States.NotInitialized;

      var response = connectableObject.canDisconnect();
      expect(response).toBeFalsy();
    });
  }); // end of canDisconnect

  describe("When connect", function () {
    it("Then must call canConnect", function (testDone) {
      var connectableObject = new ConnectableObject();

      spyOn(connectableObject, 'canConnect').and.callThrough();
      connectableObject.connect(function () {
        expect(connectableObject.canConnect).toHaveBeenCalled();
        testDone();
      });
    }, DEFAULT_TIMEOUT);

    it("Given canConnect return false Then must return error", function (testDone) {
      var connectableObject = new ConnectableObject();

      spyOn(connectableObject, 'canConnect').and.callFake(function () {
        return false;
      });
      connectableObject.connect(function (error) {
        expect(connectableObject.canConnect).toHaveBeenCalled();
        expect(error).toEqual(jasmine.any(IllegalStateException));
        testDone();
      });
    }, DEFAULT_TIMEOUT);

    it("Given valid state Then must call _handleConnection", function (testDone) {
      var connectableObject = new ConnectableObject();

      spyOn(connectableObject, 'canConnect').and.callFake(function () {
        return true;
      });
      spyOn(connectableObject, '_handleConnection').and.callFake(function (callback) {
        expect(callback).toEqual(jasmine.any(Function));
        testDone();
      });
      connectableObject.connect(function () {
        expect(false).toBeTruthy();
        testDone();
      });
    }, DEFAULT_TIMEOUT);

    it("Given _handleConnection returns error Then must return the error", function (testDone) {
      var connectableObject = new ConnectableObject();
      var expectedError = new Error("The error");

      spyOn(connectableObject, 'canConnect').and.callFake(function () {
        return true;
      });
      spyOn(connectableObject, '_handleConnection').and.callFake(function (callback) {
        callback(expectedError);
      });
      connectableObject.connect(function (error) {
        expect(error).toBe(expectedError);
        testDone();
      });
    }, DEFAULT_TIMEOUT);

    it("Given valid state Then must change current state=Connecting before calling _handleConnection", function (testDone) {
      var connectableObject = new ConnectableObject();

      var slotConnecting = jasmine.createSpy("onConnecting");
      connectableObject.on('connecting', slotConnecting);

      spyOn(connectableObject, 'canConnect').and.callFake(function () {
        return true;
      });
      spyOn(connectableObject, '_handleConnection').and.callFake(function () {
        expect(connectableObject.currentState).toEqual("Connecting");
        expect(slotConnecting).toHaveBeenCalled();
        testDone();
      });
      connectableObject.connect(function () {
        expect(false).toBeTruthy();
        testDone();
      });
    }, DEFAULT_TIMEOUT);

    it("Given valid state and _handleConnection returns error Then must emit connectionFailed and currentState=Initialized", function (testDone) {
      var connectableObject = new ConnectableObject();
      connectableObject.properties.currentState = "Initialized";

      var slotConnectionFailed = jasmine.createSpy("onConnectionFailed");
      connectableObject.on('connectionFailed', slotConnectionFailed);

      spyOn(connectableObject, 'canConnect').and.callFake(function () {
        return true;
      });
      spyOn(connectableObject, '_handleConnection').and.callFake(function (callback) {
        callback(new Error("The error"));
      });
      connectableObject.connect(function () {
        expect(connectableObject.currentState).toEqual("Initialized");
        expect(slotConnectionFailed).toHaveBeenCalled();
        testDone();
      });
    }, DEFAULT_TIMEOUT);

    it("Given valid state and _handleConnection returns ok Then must emit connected and currentState=Ready", function (testDone) {
      var connectableObject = new ConnectableObject();

      var slotConnected = jasmine.createSpy("onConnectionSucceed");
      connectableObject.on('connected', slotConnected);

      spyOn(connectableObject, 'canConnect').and.callFake(function () {
        return true;
      });
      connectableObject.connect(function () {
        expect(connectableObject.currentState).toEqual("Ready");
        expect(slotConnected).toHaveBeenCalled();
        testDone();
      });
    }, DEFAULT_TIMEOUT);
  }); // End of connect

  describe("When disconnect", function () {
    it("Then must call canDisconnect", function (testDone) {
      var connectableObject = new ConnectableObject();

      spyOn(connectableObject, 'canDisconnect').and.callThrough();
      connectableObject.disconnect(function () {
        expect(connectableObject.canDisconnect).toHaveBeenCalled();
        testDone();
      });
    }, DEFAULT_TIMEOUT);

    it("Given canConnect return false Then must return error", function (testDone) {
      var connectableObject = new ConnectableObject();

      spyOn(connectableObject, 'canDisconnect').and.callFake(function () {
        return false;
      });
      connectableObject.disconnect(function (error) {
        expect(connectableObject.canDisconnect).toHaveBeenCalled();
        expect(error).toEqual(jasmine.any(IllegalStateException));
        testDone();
      });
    }, DEFAULT_TIMEOUT);

    it("Given valid state Then must call _handleDisconnection", function (testDone) {
      var connectableObject = new ConnectableObject();

      spyOn(connectableObject, 'canDisconnect').and.callFake(function () {
        return true;
      });
      spyOn(connectableObject, '_handleDisconnection').and.callFake(function (callback) {
        expect(callback).toEqual(jasmine.any(Function));
        testDone();
      });
      connectableObject.disconnect(function () {
        expect(false).toBeTruthy();
        testDone();
      });
    }, DEFAULT_TIMEOUT);

    it("Given _handleDisconnection returns error Then must return the error", function (testDone) {
      var connectableObject = new ConnectableObject();
      var expectedError = new Error("The error");

      spyOn(connectableObject, 'canDisconnect').and.callFake(function () {
        return true;
      });
      spyOn(connectableObject, '_handleDisconnection').and.callFake(function (callback) {
        callback(expectedError);
      });
      connectableObject.disconnect(function (error) {
        expect(error).toBe(expectedError);
        testDone();
      });
    }, DEFAULT_TIMEOUT);

    it("Given valid state Then must change current state=Disconnecting before calling _handleDisconnection", function (testDone) {
      var connectableObject = new ConnectableObject();

      var slotDisconnecting = jasmine.createSpy("onDisconnecting");
      connectableObject.on('disconnecting', slotDisconnecting);

      spyOn(connectableObject, 'canDisconnect').and.callFake(function () {
        return true;
      });
      spyOn(connectableObject, '_handleDisconnection').and.callFake(function () {
        expect(connectableObject.currentState).toEqual("Disconnecting");
        expect(slotDisconnecting).toHaveBeenCalled();
        testDone();
      });
      connectableObject.disconnect(function () {
        expect(false).toBeTruthy();
        testDone();
      });
    }, DEFAULT_TIMEOUT);

    it("Given valid state and _handleDisconnection returns error Then must emit connectionFailed and currentState=Initialized", function (testDone) {
      var connectableObject = new ConnectableObject();
      connectableObject.properties.currentState = "Ready";

      var slotDisconnectionFailed = jasmine.createSpy("onDisconnectionFailed");
      connectableObject.on('disconnectionFailed', slotDisconnectionFailed);

      spyOn(connectableObject, 'canDisconnect').and.callFake(function () {
        return true;
      });
      spyOn(connectableObject, '_handleDisconnection').and.callFake(function (callback) {
        callback(new Error("The error"));
      });
      connectableObject.disconnect(function () {
        expect(connectableObject.currentState).toEqual("Ready");
        expect(slotDisconnectionFailed).toHaveBeenCalled();
        testDone();
      });
    }, DEFAULT_TIMEOUT);

    it("Given valid state and _handleDisconnection returns ok Then must emit connected and currentState=Initialized", function (testDone) {
      var connectableObject = new ConnectableObject();

      var slotDisconnected = jasmine.createSpy("onDisconnected");
      connectableObject.on('disconnected', slotDisconnected);

      spyOn(connectableObject, 'canDisconnect').and.callFake(function () {
        return true;
      });
      connectableObject.disconnect(function () {
        expect(connectableObject.currentState).toEqual("Initialized");
        expect(slotDisconnected).toHaveBeenCalled();
        testDone();
      });
    }, DEFAULT_TIMEOUT);
  }); // End of connect

  describe("When _handleFinalization", function () {
    it("Given state Ready Then must call disconnect", function (testDone) {
      var connectableObject = new ConnectableObject();

      spyOn(connectableObject, 'isReady').and.callFake(function () {
        return true;
      });

      spyOn(connectableObject, 'disconnect').and.callFake(function (callback) {
        expect(callback).toEqual(jasmine.any(Function));
        testDone();
      });

      connectableObject._handleFinalization(undefined, function () {
        expect(false).toBeTruthy();
        testDone();
      });
    }, DEFAULT_TIMEOUT);

    it("Given state Ready and disconnect returns error Then must return error", function (testDone) {
      var connectableObject = new ConnectableObject();

      spyOn(connectableObject, 'isReady').and.callFake(function () {
        return true;
      });

      spyOn(connectableObject, 'disconnect').and.callFake(function (callback) {
        callback(new Error("The error"));
      });

      connectableObject._handleFinalization(undefined, function (error) {
        expect(error).toEqual(jasmine.any(Error));
        testDone();
      });
    }, DEFAULT_TIMEOUT);
  }); // End of _handleFinalization

  describe("When _onConnectionLost", function () {
    it("Then must emit connectionLost", function (testDone) {
      var connectableObject = new ConnectableObject();

      connectableObject.on('connectionLost', function () {
        expect(true).toBeTruthy();
        testDone();
      });

      connectableObject._onConnectionLost();
    }, DEFAULT_TIMEOUT);

    it("Then current state must be Initialized", function (testDone) {
      var connectableObject = new ConnectableObject();

      connectableObject._onConnectionLost(function () {
        expect(connectableObject.currentState).toEqual('Initialized');
        testDone();
      });
    }, DEFAULT_TIMEOUT);
  }); // End of _onConnectionLost

  describe("When _onReconnected", function () {
    it("Then must emit connectionLost", function (testDone) {
      var connectableObject = new ConnectableObject();

      connectableObject.on('reconnected', function () {
        expect(true).toBeTruthy();
        testDone();
      });

      connectableObject._onReconnected();
    }, DEFAULT_TIMEOUT);

    it("Then current state must be Ready", function (testDone) {
      var connectableObject = new ConnectableObject();

      connectableObject._onReconnected(function () {
        expect(connectableObject.currentState).toEqual('Ready');
        testDone();
      });
    }, DEFAULT_TIMEOUT);
  }); // End of _onConnectionLost
});
