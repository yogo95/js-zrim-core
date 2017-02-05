/**
 * Unit test for the main of the module
 */

var main = require('../../index');

var _ = require('lodash')
;

describe("Unit Test - index.js", function () {
    describe("When require", function () {
        it("Must be a function", function () {
            expect(main).toEqual(jasmine.any(Function));
        });

        // Create the it for all exception
        var expectedFunctions = [
            'InitializableObject',
            'BaseObject',
            'ConnectableObject',
            'ProxyLogger',
            'exceptions'
        ];
        _.each(expectedFunctions, function (fnName) {
            it("Must contains '" + fnName + "' as 'Function'", function () {
                expect(main[fnName]).toEqual(jasmine.any(Function));
            });
        });
    }); // End when require
});
