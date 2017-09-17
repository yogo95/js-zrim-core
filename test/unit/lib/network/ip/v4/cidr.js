
describe("Unit Test - Network - Cidr v4", function () {
  const Cidr4 = require('./../../../../../../lib/network/ip/v4/cidr');


  describe("#parse", function () {
    it("Given non string value Then must return undefined", function () {
      expect(Cidr4.parse({})).toBeUndefined();
      expect(Cidr4.parse(12)).toBeUndefined();
      expect(Cidr4.parse(null)).toBeUndefined();
      expect(Cidr4.parse()).toBeUndefined();
    });

    it("Given string but invalid cdr Then must return undefined", function () {
      expect(Cidr4.parse('27.3.0.9/23')).toBeUndefined();
    });
  });

});
