/**
* Help to import by the namespace
*/

/**
 * @typedef {Function} CommonsModule
 * @property {JavaScriptHelper} JavaScriptHelper The javascript helper
 * @property {StringUtils} stringUtils The string utils
 * @property {EqualsBuilder} EqualsBuilder The equals builder
 */

/**
 * @type {CommonsModule}
 */
function commons() {

}

commons.JavaScriptHelper = require("./js-helper").JavaScriptHelper;
commons.javaScriptHelper = require("./js-helper").javaScriptHelper;
commons.stringUtils = require("./StringUtils");

exports = module.exports = commons;
