/**
 * Contains the exception Requirement not satisfied
 */

const NotFoundException = require("./NotFoundException");

/**
 * @description Requirements not found or invalid
 * @constructor
 */
function RequirementsNotSatisfiedException() {
  return RequirementsNotSatisfiedException.prototype._construct.apply(this, arguments);
}

NotFoundException.extend(RequirementsNotSatisfiedException);

exports = module.exports = RequirementsNotSatisfiedException;
