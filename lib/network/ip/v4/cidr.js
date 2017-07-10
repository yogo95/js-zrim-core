/**
 * The CIDR version 4.<br />
 * Contains all necessary data to manage the value
 * @constructor
 */
function Cidr4() {

}

/**
 * Check if the container is valid
 * @return {Boolean} true if the cidr container is valid, otherwise false
 */
Cidr4.prototype.isValid = function () {

};

Cidr4.prototype.getNetwork = function () {

};

Cidr4.prototype.getBroadcast = function () {

};

Cidr4.prototype.getNetworkClassName = function () {

};

Cidr4.prototype.isIn = function () {

};

Cidr4.prototype.getSize = function () {

};


function isCidr4(str) {
  if (typeof str !== 'string') {
    return false;
  }


}



const cidr4RegexpValidator = /^((?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])(?:\.(?:25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]|[0-9])){3})\/(3[0-2]|[1-2][0-9]|[0-9])$/i;



Cidr4.parse = function (str) {
  if (typeof str !== 'string') {
    return undefined;
  }

  const matches = str.match(cidr4RegexpValidator);
  if (!matches) {
    return undefined;
  }

  const ipAddress = matches[1],
    ipAddressParts = ipAddress.split('.'),
    routingPrefix = parseInt(matches[2]);

  let uint32Ip = 0;
  for (let i = 0; i < 4; ++i) {
    ipAddressParts[i] = parseInt(ipAddressParts[i]);
    uint32Ip <<= 8;
    uint32Ip |= ipAddressParts[i];
  }

  const unit32Mask = 0xFFFFFFFF << (32 - routingPrefix),
    networkIpParts = [];
  let networkIp = uint32Ip & unit32Mask;

  for (let i = 3; i >= 0; --i) {
    networkIpParts[i] = networkIp & 0x0FF;
    networkIp >>= 8;
  }




  return {
    ipAddress: ipAddress,
    ipAddressParts: ipAddressParts,
    routingPrefix: routingPrefix
  };
};

Cidr4.isValid = function (str) {

};


console.log(Cidr4.parse("192.168.2.9/24"));

exports = module.exports = Cidr4;
