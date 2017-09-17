// Contains sub module
/**
 * @typedef {Function} IpSubModule
 * @property {Ip4SubModule} v4 The ip v4 sub module
 */

/**
 * @type {IpSubModule}
 */
function requireSubModule() {

}

requireSubModule.v4 = require("./v4");

exports = module.exports = requireSubModule;
