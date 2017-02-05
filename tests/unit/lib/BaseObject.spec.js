/**
 * Unit Test - BaseObject
 */

var BaseObject = require("../../../lib/BaseObject");

var _ = require('lodash'),
    IllegalStateException = require("../../../lib/exceptions/IllegalStateException")
;

var DEFAULT_TIMEOUT = 2000;

describe("Unit Test - objectManager", function () {

    describe("When require the baseObject", function () {

        it("Must be a function", function () {
            expect(BaseObject).toEqual(jasmine.any(Function));
        });

        it("Must have the expected States", function () {
            expect(BaseObject.States).toEqual(jasmine.any(Object));
            if (_.isObject(BaseObject.States)) {
                var expectedStates = {
                    None: "None",
                    Ready: "Ready"
                };

                expect(BaseObject.States).toEqual(expectedStates);
            }
        });

        it("Must have the expected Signals", function () {
            expect(BaseObject.Signals).toEqual(jasmine.any(Object));
            if (_.isObject(BaseObject.Signals)) {
                var expectedSignals = {
                    ready: "ready",
                    currentStateChanged: "currentStateChanged",
                    ignoreSignalsChanged: "ignoreSignalsChanged",
                    flagChanged: "flagChanged",
                    propertyChanged: "propertyChanged"
                };

                expect(BaseObject.Signals).toEqual(expectedSignals);
            }
        });
    }); // End when require

    describe("When instantiate", function () {
        it("When not using the new operator Then must return new instance", function () {
            var value = BaseObject();
            expect(value).toEqual(jasmine.any(BaseObject));
        });

        it("When using the new operator must return new instance", function () {
            var value = new BaseObject();
            expect(value).toEqual(jasmine.any(BaseObject));
        });
    }); // End of When instantiate

    describe("When checking the instance", function () {
        describe("Property ignoreSignals", function () {
            it("When get ignoreSignals without setting it Then must return false", function () {
                var baseObject = new BaseObject();
                expect(baseObject.ignoreSignals).toBe(false);
            });

            it("When set ignoreSignals Then must have the new value", function () {
                var baseObject = new BaseObject();
                expect(baseObject.ignoreSignals).toBe(false);
                baseObject.ignoreSignals = true;
                expect(baseObject.ignoreSignals).toBe(true);
            });

            it("When set ignoreSignals Then must emit ignoreSignalsChanged", function (testDone) {
                var baseObject = new BaseObject();

                baseObject.on("ignoreSignalsChanged", function (newValue, previousValue) {
                    expect(newValue).toBe(true);
                    expect(previousValue).toBe(false);
                    testDone();
                });

                baseObject.ignoreSignals = true;
            }, 3000);

            it("Given same value When set ignoreSignals Then must not emit ignoreSignalsChanged", function () {
                var baseObject = new BaseObject();

                spyOn(baseObject, "on");

                baseObject.ignoreSignals = false;
                expect(baseObject.on).not.toHaveBeenCalled();
            });

            it("Given new value When set ignoreSignals Then must emit signal flagChanged", function (testDone) {
                var baseObject = new BaseObject();

                baseObject.on("flagChanged", function (flagName, newValue, previousValue) {
                    expect(flagName).toEqual("ignoreSignals");
                    expect(newValue).toBe(true);
                    expect(previousValue).toBe(false);
                    testDone();
                });

                baseObject.ignoreSignals = true;
            }, 3000);
        }); // End of Property ignoreSignals

        describe("Property currentState", function () {
            it("When get currentState at beginning Then must be NotInitialized", function () {
                var baseObject = new BaseObject();
                expect(baseObject.currentState).toEqual(BaseObject.States.None);
            });

            it("Given valid new state When set Then must change the value", function () {
                var baseObject = new BaseObject();
                expect(baseObject.currentState).toEqual(BaseObject.States.None);
                baseObject.currentState = BaseObject.States.Ready;
                expect(baseObject.currentState).toEqual(BaseObject.States.Ready);
            });

            it("Given invalid new state When set Then must not change the value", function () {
                var baseObject = new BaseObject();
                expect(baseObject.currentState).toEqual(BaseObject.States.None);
                baseObject.currentState = "This is an invalid state";
                expect(baseObject.currentState).toEqual(BaseObject.States.None);
            });

            it("Given invalid new state (not string) When set Then must not change the value", function () {
                var baseObject = new BaseObject();
                expect(baseObject.currentState).toEqual(BaseObject.States.None);
                baseObject.currentState = new Function();
                expect(baseObject.currentState).toEqual(BaseObject.States.None);
            });

            it("Given new value When set Then must emit currentStateChanged", function (testDone) {
                var baseObject = new BaseObject();
                var currentState = baseObject.currentState;

                baseObject.on("currentStateChanged", function (newValue, previousValue) {
                    expect(previousValue).toEqual(currentState);
                    expect(newValue).toEqual(BaseObject.States.Ready);
                    testDone();
                });

                baseObject.currentState = BaseObject.States.Ready;
            }, 3000);

            it("Given same value When set Then must not emit currentStateChanged", function () {
                var baseObject = new BaseObject();
                var currentState = baseObject.currentState;

                spyOn(baseObject, "on");

                baseObject.currentState = currentState;
                expect(baseObject.on).not.toHaveBeenCalled();
            });

            it("Given state ready When isReady Then must return true", function () {
                var baseObject = new BaseObject();
                baseObject.currentState = BaseObject.States.Ready;
                expect(baseObject.isReady()).toBe(true);
            });

            it("Given state different that ready When isReady Then must return false", function () {
                var baseObject = new BaseObject();
                baseObject.currentState = BaseObject.States.None;
                expect(baseObject.isReady()).toBe(false);
            });
        }); // Property currentState

        describe("When disabling the emit function", function () {
            it("Then must no be called", function () {
                var baseObject = new BaseObject();
                baseObject.currentState = BaseObject.States.None;

                baseObject.ignoreSignals = true;
                spyOn(baseObject, "on");

                baseObject.currentState = BaseObject.States.Ready;
                expect(baseObject.on).not.toHaveBeenCalled();
            });
        });

        describe("When check logger", function () {
            it("Given a logger with level is not debug When isDebugEnabled Then must return false", function () {
                var baseObject = new BaseObject();

                var response = baseObject.logger.isDebugEnabled();
                expect(response).toBeFalsy();
            });
        }); // End of When check logger
    }); // End of checking instance

    describe("When _applyPrototypeTo", function () {
        it("Given non function then must throw exception", function () {
            expect(function () {
                BaseObject._applyPrototypeTo("");
            }).toThrow();
        });

        it("Given function Then must apply prototype", function () {
            function TestA() {

            }
            BaseObject._applyPrototypeTo(TestA);

            var a = new TestA();
            expect(a).toEqual(jasmine.any(TestA));
            expect(a).toEqual(jasmine.any(BaseObject));
            expect(TestA.States).toEqual(BaseObject.States);
            expect(TestA.Signals).toEqual(BaseObject.Signals);
            expect(TestA._emptyCallback).toEqual(jasmine.any(Function));
            expect(TestA._applyPrototypeTo).toEqual(jasmine.any(Function));
        });

        it("Given function and options Then must apply prototype with options", function () {
            function TestA() {

            }
            BaseObject._applyPrototypeTo(TestA, {
                signals: {
                    sigA: "sigA1"
                },
                states: {
                    stateA: "StateA1"
                }
            });

            var a = new TestA();
            expect(a).toEqual(jasmine.any(TestA));
            expect(a).toEqual(jasmine.any(BaseObject));
            expect(TestA.States).toEqual(_.merge({}, BaseObject.States, {
                stateA: "StateA1"
            }));
            expect(TestA.Signals).toEqual(_.merge({}, BaseObject.Signals, {
                sigA: "sigA1"
            }));
            expect(TestA._emptyCallback).toEqual(jasmine.any(Function));
            expect(TestA._applyPrototypeTo).toEqual(jasmine.any(Function));
        });

        it("Given function that call also _applyPrototypeTo Then must be a 2 inheritance", function () {
            function TestA() {

            }
            BaseObject._applyPrototypeTo(TestA);
            function TestB() {

            }
            TestA._applyPrototypeTo(TestB);

            var b = new TestB();
            expect(b).toEqual(jasmine.any(TestB));
            expect(b).toEqual(jasmine.any(TestA));
            expect(b).toEqual(jasmine.any(BaseObject));
            expect(TestB.States).toEqual(BaseObject.States);
            expect(TestB.Signals).toEqual(BaseObject.Signals);
            expect(TestB._emptyCallback).toEqual(jasmine.any(Function));
            expect(TestB._applyPrototypeTo).toEqual(jasmine.any(Function));
        });
    }); // End of _applyPrototypeTo

    describe("When _defineProperty", function () {
        var validOptions = {
            set: function () {
                
            },
            get: function () {
                
            }
        };
        
        it("Given invalid constructor Then must throw TypeError", function () {
            var args = [
                '',
                undefined,
                {},
                null,
                1
            ];
            _.each(args, function (constructor) {
                expect(function () {
                    BaseObject._defineProperty(constructor);
                }).toThrow();
            });
        });

        it("Given invalid public name Then must throw TypeError", function () {
            var args = [
                '',
                '    ',
                undefined,
                {},
                null,
                function () { },
                12
            ];
            _.each(args, function (publicName) {
                expect(function () {
                    BaseObject._defineProperty(function () { }, publicName);
                }).toThrow();
            });
        });

        it("Given invalid options Then must throw TypeError", function () {
            var args = [
                '',
                undefined,
                null,
                function () { }
            ];
            _.each(args, function (options) {
                expect(function () {
                    BaseObject._defineProperty(function () { }, 'a', options);
                }).toThrow();
            });
        });

        it("Given invalid options.set Then must throw TypeError", function () {
            var args = [
                '',
                12,
                {}
            ];
            _.each(args, function (el) {
                expect(function () {
                    var options = _.clone(validOptions);
                    options.set = el;
                    BaseObject._defineProperty(function () { }, 'a', options);
                }).toThrow();
            });
        });

        it("Given invalid options.get Then must throw TypeError", function () {
            var args = [
                '',
                12,
                {}
            ];
            _.each(args, function (el) {
                expect(function () {
                    var options = _.clone(validOptions);
                    options.get = el;
                    BaseObject._defineProperty(function () { }, 'a', options);
                }).toThrow();
            });
        });

        it("Given invalid options.enumerable Then must throw TypeError", function () {
            var args = [
                '',
                12,
                {},
                function () {

                }
            ];
            _.each(args, function (el) {
                expect(function () {
                    var options = _.clone(validOptions);
                    options.enumerable = el;
                    BaseObject._defineProperty(function () { }, 'a', options);
                }).toThrow();
            });
        });

        it("Given invalid options.configurable Then must throw TypeError", function () {
            var args = [
                '',
                12,
                {},
                function () {

                }
            ];
            _.each(args, function (el) {
                expect(function () {
                    var options = _.clone(validOptions);
                    options.configurable = el;
                    BaseObject._defineProperty(function () { }, 'a', options);
                }).toThrow();
            });
        });
    }); // End of _defineProperty
});

