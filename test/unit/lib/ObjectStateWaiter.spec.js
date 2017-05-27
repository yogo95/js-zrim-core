/**
 * Unit test for ObjectStateWaiter
 */

describe("Unit Test - ObjectStateWaiter", function () {

  const _ = require("lodash"),
    ObjectStateWaiter =  require("./../../../lib/ObjectStateWaiter"),
    BaseObject = require("./../../../lib/BaseObject"),
    LoggerMock = require("./../../../lib/mocks").LoggerMock;


  /**
   * Create instance for test
   * @return {ObjectStateWaiter} The object created
   */
  function createInstance() {
    return new ObjectStateWaiter({
      loggerTarget: new LoggerMock()
    });
  }

  describe("When require", function () {
    it("Then must be a function", function () {
      expect(ObjectStateWaiter).toEqual(jasmine.any(Function));
    });
  }); // End of When require

  describe("When instantiate", function () {
    it("Given no operator new Then must return new instance", function () {
      expect(ObjectStateWaiter()).toEqual(jasmine.any(ObjectStateWaiter));
      const a = ObjectStateWaiter();
      const b = ObjectStateWaiter();

      expect(a).not.toBe(b);
      expect(a).toEqual(jasmine.any(ObjectStateWaiter));
      expect(b).toEqual(jasmine.any(ObjectStateWaiter));
    });

    it("Given operator new Then must return new instance", function () {
      expect(new ObjectStateWaiter()).toEqual(jasmine.any(ObjectStateWaiter));
    });
  }); // End of when instance

  describe("#watch", function () {
    it("Must return itself", function () {
      const instance = new ObjectStateWaiter();
      expect(instance.watch()).toBe(instance);
    });

    it("Given invalid argument Then must not call _watch", function () {
      const instance = createInstance();
      spyOn(instance, '_watch');

      _.each([
        [],
        [{}],
        [12],
        [function () { }],
        [""],
        [["", {}, [], 12]]
      ], function (args) {
        instance.watch.apply(instance, args);
      });

      expect(instance._watch).not.toHaveBeenCalled();
    });

    it("Given BaseObject Then must call _watch", function () {
      const instance = createInstance();
      spyOn(instance, '_watch');

      const objs = [
        new BaseObject(),
        new BaseObject()
      ];

      instance.watch(objs[0]);
      instance.watch([objs[1]]);
      expect(instance._watch).toHaveBeenCalledTimes(2);
      expect(instance._watch).toHaveBeenCalledWith(objs[0]);
      expect(instance._watch).toHaveBeenCalledWith(objs[1]);
    });
  }); // End of #watch

  describe("#_watch", function () {
    it("Given invalid argument Then must not add it into the list", function () {
      const instance = createInstance();
      spyOn(instance.properties.watchContainers, 'push');

      _.each([
        [],
        [{}],
        [12],
        [function () { }],
        [""],
        [[]]
      ], function (args) {
        instance._watch.apply(instance, args);
      });

      expect(instance.properties.watchContainers.push).not.toHaveBeenCalled();
    });

    it("Given BaseObject Then must add teh container", function () {
      const instance = createInstance();
      const obj = new BaseObject();

      spyOn(instance.properties.watchContainers, 'push').and.callFake(function (el) {
        expect(el).toEqual(jasmine.any(Object));
        if (_.isObject(el)) {
          expect(el.id).toMatch(/^[a-f0-9]{8}(?:-[a-f0-9]{4}){4}[a-f0-9]{8}$/ig);
          expect(el.object).toBe(obj);
        }
      });

      instance._watch(obj);
      expect(instance.properties.watchContainers.push).toHaveBeenCalledTimes(1);
    });
  }); // End of #_watch

  describe("#timeout", function () {
    it("Must return itself", function () {
      const instance = createInstance();
      expect(instance.timeout()).toBe(instance);
    });

    it("Given invalid argument Then must do nothing", function () {
      const instance = createInstance();
      instance.properties.timeout = -1;

      _.each([
        [{}],
        [function () { }],
        [""],
        [[]],
        [-58]
      ], function (args) {
        instance.timeout.apply(instance, args);
      });

      expect(instance.properties.timeout).toEqual(-1);
    });

    it("Given number Then must set the value", function () {
      const instance = createInstance();
      instance.timeout(128);
      expect(instance.properties.timeout).toEqual(128);
    });

    it("Given undefined Then must set the default value", function () {
      const instance = createInstance();
      instance.properties.timeout = -1;
      instance.timeout();
      expect(instance.properties.timeout).not.toEqual(-1);
    });
  }); // End of #timeout

  describe("#getTimeout", function () {
    it("Given nothing Then must return timeout value", function () {
      const instance = createInstance();
      expect(instance.getTimeout()).toBe(instance.properties.timeout);
    });
  }); // End of #getTimeout

  describe("#stateName", function () {
    it("Must return itself", function () {
      const instance = createInstance();
      expect(instance.stateName()).toBe(instance);
    });

    it("Given invalid argument Then must do nothing", function () {
      const instance = createInstance();
      instance.properties.stateName = "-1";

      _.each([
        [{}],
        [function () { }],
        [[]],
        [-58]
      ], function (args) {
        instance.stateName.apply(instance, args);
      });

      expect(instance.properties.stateName).toEqual("-1");
    });

    it("Given string Then must set the value", function () {
      const instance = createInstance();
      instance.stateName("state");
      expect(instance.properties.stateName).toEqual("state");
    });

    it("Given undefined Then must set the default value", function () {
      const instance = createInstance();
      instance.properties.stateName = "-1";
      instance.stateName();
      expect(instance.properties.stateName).toEqual(undefined);
    });
  }); // End of #stateName

  describe("#getStateName", function () {
    it("Given nothing Then must return state value", function () {
      const instance = createInstance();
      instance.properties.stateName = "as";
      expect(instance.getStateName()).toBe(instance.properties.stateName);
    });
  }); // End of #getStateName

  describe("#wait", function () {
    it("Then must return Promise object", function () {
      const instance = createInstance();
      expect(instance.wait()).toEqual(jasmine.any(Promise));
    });

    it("Given no object to wait and no callback Then must return success", function (testDone) {
      const instance = createInstance();
      instance.wait()
        .then(() => {
          expect(true).toBeTruthy();
          testDone();
        })
        .catch(error => {
          expect(error).not.toBeDefined();
          expect(true).toBeFalsy();
          testDone();
        });
    });

    it("Given object to wait and object never ready Then must return error", function (testDone) {
      const instance = createInstance();
      instance.watch(new BaseObject()).stateName(BaseObject.States.Ready).timeout(10).wait()
        .then(() => {
          expect(false).toBeTruthy();
          testDone();
        })
        .catch(error => {
          expect(error).toEqual(jasmine.any(Error));
          testDone();
        });
    });

    it("Given object to wait already ready Then must call success before the timeout", function (testDone) {
      const instance = createInstance();
      const objToWait = new BaseObject();
      objToWait.currentState = BaseObject.States.Ready;
      instance.watch(objToWait).stateName(BaseObject.States.Ready).timeout(5).wait()
        .then(() => {
          expect(true).toBeTruthy();
          testDone();
        })
        .catch(() => {
          expect(false).toBeTruthy();
          testDone();
        });
    });

    it("Given object to wait that will become ready Then must call success before the timeout", function (testDone) {
      const instance = createInstance();
      const objToWait = new BaseObject();

      setTimeout(() => {
        objToWait.currentState = BaseObject.States.Ready;
      }, 5);

      instance.watch(objToWait).stateName(BaseObject.States.Ready).timeout(10).wait()
        .then(() => {
          expect(true).toBeTruthy();
          testDone();
        })
        .catch(() => {
          expect(false).toBeTruthy();
          testDone();
        });
    });
  });
});
