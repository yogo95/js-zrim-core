const GenericBaseErrorTemplate = require('./GenericBaseErrorTemplate'),
  util = require('util');

/**
 * Generic base error. Has more information than the default Javascript Error
 * @implements {GenericBaseErrorTpl}
 * @constructor
 */
function BaseTypeError() {
  return BaseTypeError.prototype._construct.apply(this, arguments);
}

util.inherits(BaseTypeError, TypeError);
GenericBaseErrorTemplate.makeGenericError(BaseTypeError);

/**
 * @inheritDoc
 */
BaseTypeError.prototype._initDefaultProperties = function () {
  this.properties.message = "TypeError";
};

exports = module.exports = BaseTypeError;

