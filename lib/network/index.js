// Contains sub module
/**
 * @typedef {Function} NetworkSubModule
 * @property {IpSubModule} ip The ip sub module
 */

/**
 * @type {NetworkSubModule}
 */
function requireSubModule() {

}

requireSubModule.ip = require("./ip");

exports = module.exports = requireSubModule;
