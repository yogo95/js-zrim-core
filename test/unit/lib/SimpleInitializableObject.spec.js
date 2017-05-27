describe("Unit Test - SimpleInitializableObject", function () {
  const SimpleInitializableObject = require("./../../../lib/SimpleInitializableObject"),
    LoggerMock = require("./../../../lib/mocks").LoggerMock;


  /**
   * Create the instance for test
   * @return {SimpleInitializableObject} The new instance
   */
  function createInstance() {
    return new SimpleInitializableObject({
      loggerTarget: new LoggerMock()
    });
  }

  describe("#initialize", function () {
    it("Given initialize succeed Then must change state to ready", function (testDone) {
      const instance = createInstance();

      instance.initialize({})
        .then(() => {
          setTimeout(() => {
            expect(instance.currentState).toEqual("Ready");
            testDone();
          }, 10);
        })
        .catch(error => {
          expect(error).toBeUndefined();
          testDone();
        });
    });
  }); // #initialize
});
