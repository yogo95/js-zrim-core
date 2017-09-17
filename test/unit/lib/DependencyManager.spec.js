/**
 * Unit test for DependencyManager
 */

const DependencyManager = require("./../../../lib/DependencyManager"),
  DependencyEntry = require("./../../../lib/DependencyEntry"),
  _ = require("lodash");

describe("Unit test - DependencyManager", function () {

  describe("When require the manager", function () {

    it("Must be a function", function () {
      expect(DependencyManager).toEqual(jasmine.any(Function));
    });
  }); // End when require

  describe("When instantiate", function () {
    it("When not using the new operator Then must return new instance", function () {
      const instance = DependencyManager();
      expect(instance).toEqual(jasmine.any(DependencyManager));
    });

    it("When using the new operator must return new instance", function () {
      const instance = DependencyManager();
      expect(instance).toEqual(jasmine.any(DependencyManager));
    });
  }); // End of When instantiate

  describe("#_refreshIndexes", function () {
    it("Given no dependencies Then must do nothing", function () {
      const instance = new DependencyManager();
      instance._registerIndex = jasmine.createSpy("_registerIndex");
      instance._removeIndexes = jasmine.createSpy("_removeIndexes");
      instance._refreshIndexes();
      expect(instance._removeIndexes).toHaveBeenCalled();
      expect(instance._registerIndex).not.toHaveBeenCalled();
    });

    it("Given dependencies Then must call _registerIndex", function () {
      const dependencies = [{
          a: 1
        }, {
          b: 2
        }], expectedCalls = [];

      _.each(dependencies, function (dependency, index) {
        expectedCalls.push([dependency, index]);
      });

      const instance = new DependencyManager();
      instance.properties.dependencies = dependencies;
      instance._registerIndex = jasmine.createSpy("_registerIndex");
      instance._removeIndexes = jasmine.createSpy("_removeIndexes");
      instance._refreshIndexes();
      expect(instance._removeIndexes).toHaveBeenCalled();
      expect(instance._registerIndex).toHaveBeenCalledTimes(expectedCalls.length);
      _.each(expectedCalls, function (expectedCall) {
        expect(instance._registerIndex).toHaveBeenCalledWith(expectedCall[0], expectedCall[1]);
      });
    });
  }); // End of #_refreshIndexes

  describe("#_removeIndexes", function () {
    it("Given indexes The must reset it", function () {
      const instance = new DependencyManager();
      instance.properties.dependencyIndexes = {
        byName: {
          a: 1
        }
      };

      instance._removeIndexes();
      expect(instance.properties.dependencyIndexes).toEqual({
        byName: {}
      });
    });
  }); // End of #_removeIndexes

  describe("#_registerIndex", function () {
    it("Given invalid entry Then must throw error", function () {
      const instance = new DependencyManager();
      expect(() => instance._registerIndex({}, 1)).toThrowError();
    });

    it("Given valid entry and invalid index Then must throw error", function () {
      const instance = new DependencyManager();
      expect(() => instance._registerIndex(Object.create(DependencyEntry.prototype), {})).toThrowError();
    });

    it("Given valid argument Then must create index", function () {
      const instance = new DependencyManager(),
        entry = Object.create(DependencyEntry.prototype, {
          name: {
            value: "a"
          }
        });

      instance._registerIndex(entry, 12);
      expect(instance.properties.dependencyIndexes.byName.a).toEqual(12);
    });
  }); // End of #_registerIndex

  describe("#_removeIndex", function () {
    it("Given invalid entry Then must throw error", function () {
      const instance = new DependencyManager();
      expect(() => instance._removeIndex({}, 1)).toThrowError();
    });

    it("Given valid entry and invalid index Then must throw error", function () {
      const instance = new DependencyManager();
      expect(() => instance._removeIndex(Object.create(DependencyEntry.prototype), {})).toThrowError();
    });

    it("Given valid argument Then must delete index", function () {
      const instance = new DependencyManager(),
        entry = Object.create(DependencyEntry.prototype, {
          name: {
            value: "a"
          }
        });

      instance.properties.dependencyIndexes.byName.a = 12;
      expect(instance.properties.dependencyIndexes.byName.hasOwnProperty("a")).toBeTruthy();
      instance._removeIndex(entry, 12);
      expect(instance.properties.dependencyIndexes.byName.hasOwnProperty("a")).toBeFalsy();
    });
  }); // End of #_removeIndex

  describe("#findIndexByName", function () {
    it("Given invalid name Then must return -1", function () {
      const instance = new DependencyManager();
      expect(instance.findIndexByName({})).toEqual(-1);
    });

    it("Given valid name but not exists Then must return -1", function () {
      const instance = new DependencyManager();
      expect(instance.findIndexByName("a")).toEqual(-1);
    });

    it("Given valid name and exists Then must return expected index", function () {
      const instance = new DependencyManager();
      instance.properties.dependencyIndexes.byName.a = 15;
      expect(instance.findIndexByName("a")).toEqual(15);
    });
  }); // End of findIndexByName

  describe("#indexOf", function () {
    it("Given invalid argument Then must return -1", function () {
      const instance = new DependencyManager();
      instance.findIndexByName = jasmine.createSpy("findIndexByName");
      expect(instance.indexOf({})).toEqual(-1);
      expect(instance.findIndexByName).not.toHaveBeenCalled();
    });

    it("Given string then must call findIndexByName and return expected value", function () {
      const instance = new DependencyManager();
      instance.findIndexByName = jasmine.createSpy("findIndexByName").and.callFake(() => 129);
      expect(instance.indexOf("b")).toEqual(129);
      expect(instance.findIndexByName).toHaveBeenCalledWith("b");
    });

    it("Given entry then must call findIndexByName and return expected value", function () {
      const instance = new DependencyManager(),
        entry = Object.create(DependencyEntry.prototype, {
          name: {
            value: "c"
          }
        });
      instance.findIndexByName = jasmine.createSpy("findIndexByName").and.callFake(() => 129);
      expect(instance.indexOf(entry)).toEqual(129);
      expect(instance.findIndexByName).toHaveBeenCalledWith("c");
    });
  }); // End of indexOf

  describe("#add", function () {
    it("Given invalid name Then must throw error", function () {
      const instance = new DependencyManager();
      expect(() => instance.add({})).toThrowError();
    });

    it("Given valid argument and not exists Then must add entry", function () {
      const instance = new DependencyManager(),
        name_in = "v", dependency_in = {}
        ;

      instance.indexOf = jasmine.createSpy("indexOf").and.callFake(() => -1);
      instance._registerIndex = jasmine.createSpy("_registerIndex").and.callFake((entry, index) => {
        expect(index).toEqual(0);
        expect(entry).toEqual(jasmine.any(DependencyEntry));
        if (entry instanceof DependencyEntry) {
          expect(entry.name).toEqual(name_in);
          expect(entry.dependency).toBe(dependency_in);
        }
      });

      instance.add(name_in, dependency_in);
      expect(instance.properties.dependencies[0]).toEqual(jasmine.any(DependencyEntry));
      if (instance.properties.dependencies[0] instanceof DependencyEntry) {
        expect(instance.properties.dependencies[0].name).toEqual(name_in);
        expect(instance.properties.dependencies[0].dependency).toEqual(dependency_in);
      }
    });

    it("Given valid argument and exists Then must replace entry", function () {
      const instance = new DependencyManager(),
        name_in = "v", dependency_in = {}
        ;

      instance.properties.dependencies = [
        {},
        {}
      ];
      instance.indexOf = jasmine.createSpy("indexOf").and.callFake(() => 1);
      instance._registerIndex = jasmine.createSpy("_registerIndex").and.callFake((entry, index) => {
        expect(index).toEqual(1);
        expect(entry).toEqual(jasmine.any(DependencyEntry));
        if (entry instanceof DependencyEntry) {
          expect(entry.name).toEqual(name_in);
          expect(entry.dependency).toBe(dependency_in);
        }
      });

      instance.add(name_in, dependency_in);
      expect(instance.properties.dependencies[1]).toEqual(jasmine.any(DependencyEntry));
      if (instance.properties.dependencies[1] instanceof DependencyEntry) {
        expect(instance.properties.dependencies[1].name).toEqual(name_in);
        expect(instance.properties.dependencies[1].dependency).toEqual(dependency_in);
      }
    });
  }); // End of add

  describe("#replace", function () {
    it("Given invalid old name Then mus throw error", function () {
      const instance = new DependencyManager();
      expect(() => instance.replace({}, "b", undefined)).toThrowError();
    });

    it("Given invalid new name Then mus throw error", function () {
      const instance = new DependencyManager();
      expect(() => instance.replace("a", {}, undefined)).toThrowError();
    });

    it("Given valid argument Then must replace it", function () {
      const instance = new DependencyManager(),
        dependency_in = {
          b: 90
        }
        ;
      instance.remove = jasmine.createSpy("remove");
      instance.add = jasmine.createSpy("add");
      instance.replace("a", "b", dependency_in);
      expect(instance.remove).toHaveBeenCalledWith("a");
      expect(instance.add).toHaveBeenCalledWith("b", dependency_in);
    });
  }); // End of #replace

  describe("#remove", function () {
    it("Given entry not exists Then must do nothing", function () {
      const instance = new DependencyManager();
      instance.indexOf = jasmine.createSpy("indexOf").and.callFake(() => -1);
      instance._refreshIndexes = jasmine.createSpy("_refreshIndexes");

      instance.properties.dependencies = [
        1,
        2
      ];

      instance.remove("c");

      expect(instance.properties.dependencies).toEqual([
        1,
        2
      ]);
      expect(instance.indexOf).toHaveBeenCalledWith("c");
      expect(instance._refreshIndexes).not.toHaveBeenCalled();
    });

    it("Given entry exists Then must remove it", function () {
      const instance = new DependencyManager();
      instance.indexOf = jasmine.createSpy("indexOf").and.callFake(() => 1);
      instance._refreshIndexes = jasmine.createSpy("_refreshIndexes");

      instance.properties.dependencies = [
        1,
        2,
        3
      ];

      instance.remove("c");

      expect(instance.properties.dependencies).toEqual([
        1,
        3
      ]);
      expect(instance.indexOf).toHaveBeenCalledWith("c");
      expect(instance._refreshIndexes).toHaveBeenCalled();
    });
  }); // End of #remove

  describe("#contains", function () {
    it("Given entry not exists Then must return false", function () {
      const instance = new DependencyManager();
      instance.indexOf = jasmine.createSpy("indexOf").and.callFake(() => -1);
      expect(instance.contains("d")).toBeFalsy();
      expect(instance.indexOf).toHaveBeenCalledWith("d");
    });

    it("Given entry not exists Then must return false", function () {
      const instance = new DependencyManager();
      instance.indexOf = jasmine.createSpy("indexOf").and.callFake(() => 1);
      expect(instance.contains("d")).toBeTruthy();
      expect(instance.indexOf).toHaveBeenCalledWith("d");
    });
  }); // End of #contains

  describe("#get", function () {
    it("Given entry not exists Then must return default value", function () {
      const instance = new DependencyManager(),
        expectedDefaultValue = {
          n: 2
        };
      instance.indexOf = jasmine.createSpy("indexOf").and.callFake(() => -1);
      expect(instance.get("d", expectedDefaultValue)).toBe(expectedDefaultValue);
      expect(instance.indexOf).toHaveBeenCalledWith("d");
    });

    it("Given entry that exists Then must return expected value", function () {
      const instance = new DependencyManager(),
        expectedValue = {
          b: 12
        };
      instance.properties.dependencies = [
        {
          dependency: expectedValue
        }
      ];
      instance.indexOf = jasmine.createSpy("indexOf").and.callFake(() => 0);
      expect(instance.get("d", undefined)).toBe(expectedValue);
      expect(instance.indexOf).toHaveBeenCalledWith("d");
    });
  }); // End of #get

  describe("#dependencyNames", function () {
    it("Then must return expected names", function () {
      const instance = new DependencyManager();
      instance.properties.dependencyIndexes.byName = {
        a: 1,
        d: 2,
        c: 5
      };

      expect(instance.dependencyNames()).toEqual([
        "a", "c", "d"
      ]);
    });
  }); // End of #dependencyNames

  describe("#all", function () {
    it("Then must return expected array", function () {
      const instance = new DependencyManager();
      instance.properties.dependencies = [
        1, 2, 5, 6, 8
      ];
      expect(instance.all()).toEqual([
        1, 2, 5, 6, 8
      ]);
    });
  }); // End of #all

  describe("#containAll", function () {
    it("Given no array and do not contains Then must return expected value", function () {
      const instance = new DependencyManager();
      instance.contains = jasmine.createSpy("contains").and.callFake(() => false);
      expect(instance.containAll("az")).toEqual({
        found: {
          names: []
        },
        notFound: {
          names: ["az"]
        }
      });
    });

    it("Given array Then must return expected value", function () {
      const instance = new DependencyManager();
      instance.contains = jasmine.createSpy("contains").and.callFake(name => name === "a");
      expect(instance.containAll(["c", "a", "b"])).toEqual({
        found: {
          names: ["a"]
        },
        notFound: {
          names: ["c", "b"]
        }
      });
      expect(instance.contains).toHaveBeenCalledWith("a");
      expect(instance.contains).toHaveBeenCalledWith("b");
      expect(instance.contains).toHaveBeenCalledWith("c");
    });
  }); // End of #containAll
});
