/**
 * Contains the exception NotFound
 */

const util = require('util'),
  NotFoundException = require("./NotFoundException")
;

/**
 * @description Requirements not found or invalid
 * @constructor
 */
function RequirementsNotSatisfiedException() {
  if (!(this instanceof RequirementsNotSatisfiedException)) {
    return new(Function.prototype.bind.apply(RequirementsNotSatisfiedException, Array.prototype.concat.apply([null], arguments)));
  }

  NotFoundException.apply(this, arguments);
}

util.inherits(RequirementsNotSatisfiedException, NotFoundException);

exports = module.exports = RequirementsNotSatisfiedException;
