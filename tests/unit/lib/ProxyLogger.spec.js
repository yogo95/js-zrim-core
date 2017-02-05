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

            _.each(['debug', 'info', 'warn', 'error', 'critical', 'fatal'], function (levelName) {
                expect(value[levelName]).toEqual(jasmine.any(Function));
            });
        });
    }); // End of When instantiate
});
