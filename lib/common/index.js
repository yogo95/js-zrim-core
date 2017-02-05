/**
* Help to import by the namespace
*/

/**
 * @typedef {Function} CommonsModule
 * @property {JavaScriptHelper} javaScriptHelper The javascript helper
 * @property {StringUtils} stringUtils The string utils
 * @property {EqualsBuilder} EqualsBuilder The equals builder
 */

/**
 * @type CommonsModule
 */
function commons() {

}

commons.javaScriptHelper = require("./js-helper");
commons.stringUtils = require("./StringUtils");
commons.EqualsBuilder = require("./EqualsBuilder");

exports = module.exports = commons;
