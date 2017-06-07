/**
 * Contains the exception NotFound
 */

const BaseError = require("./BaseError");

/**
 * @description Tells when something is not found
 * @constructor
 */
function NotFoundException() {
  return NotFoundException.prototype._construct.apply(this, arguments);
}

BaseError.extend(NotFoundException);

exports = module.exports = NotFoundException;
