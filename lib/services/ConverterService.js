
const BaseObject = require("./../BaseObject"),
  _  = require("lodash"),
  util = require("util"),
  Joi = require("joi"),
  exceptions = require("./../exceptions");


/**
 * @typedef {Object} ConverterFn~Options
 * @description Contains information for the conversion
 * @property {string} sourceTypeName The source type name
 * @property {string} outputTypeName The output type name
 */
/**
 * @function ConverterFn
 * @description The function use to convert a value
 * @param {*} input The input value to convert
 * @param {ConverterFn~Options} options The options to help convert the value
 * @throws {Error} In case of failure
 */

/**
 * This service help you to add diver converters to your application.
 * By using the name of the input and output you can register or directly convert your value
 * @implements {BaseObject}
 * @see ConverterFn
 * @constructor
 */
function ConverterService() {
  if (!(this instanceof ConverterService)) {
    return new (Function.prototype.bind.apply(ConverterService, Array.prototype.concat.apply([null], arguments)))();
  }

  BaseObject.apply(this, arguments);

  this.properties = _.assign({}, this.properties, {
    // Key is source type name, after contains object of all output type and then an object with the converter
    convertersDB: {}
  });
}

BaseObject._applyPrototypeTo(ConverterService);

const convertOptionsSchema = Joi.object().keys({
  sourceTypeName: Joi.string().min(1).required(),
  outputTypeName: Joi.string().min(1).required()
}).required();

/**
 * @typedef {Object} ConverterService.convert~Options
 * @description Contains information for the conversion
 * @property {string} sourceTypeName The source type name
 * @property {string} outputTypeName The output type name
 */
/**
 * Convert the value
 * @param {*} input The input value to convert
 * @param {ConverterService.convert~Options} options The options to use for the conversion
 * @return {*} The value converted
 * @throw {Error} if cannot convert the value
 */
ConverterService.prototype.convert = function (input, options) {
  const __pretty_name__ = "convert";

  // Validate the response
  const {error, value} = Joi.validate(options, convertOptionsSchema);

  if (error) {
    this.logger.warn("[%s] Received invalid options : %s\n%s", __pretty_name__, error.message, error.stack);
    throw new exceptions.IllegalArgumentException(util.format("Invalid options : %s", error.message), error);
  }

  if (this.properties.convertersDB[value.sourceTypeName] &&
    _.isObjectLike(this.properties.convertersDB[value.sourceTypeName][value.outputTypeName]) &&
    _.isFunction(this.properties.convertersDB[value.sourceTypeName][value.outputTypeName].converter)) {
    let valueConverted;
    try {
      valueConverted = this.properties.convertersDB[value.sourceTypeName][value.outputTypeName].converter(input, {
        sourceTypeName: value.sourceTypeName,
        outputTypeName: value.outputTypeName
      });
    } catch (exception) {
      this.logger.debug("[%s] Converter throw an error : %s\n%s", __pretty_name__, exception.message, exception.stack);
      throw exception;
    }

    return valueConverted;
  }

  throw new exceptions.NotFoundException(util.format("Convert for %s -> %s not found", options.sourceTypeName, options.outputTypeName));
};

const registerOptionsSchema = Joi.object().keys({
  sourceTypeName: Joi.string().min(1).required(),
  outputTypeName: Joi.string().min(1).required(),
  converter: Joi.func().required()
}).required();

/**
 * @typedef {Object} ConverterService.register~Options
 * @property {string} sourceTypeName The type name given to the source
 * @property {string} outputTypeName The type name given to the converted value
 * @property {function:ConverterFn} converter The converter function to use {@link ConverterFn}
 */
/**
 * Register a convert into the service
 * @param {ConverterService.register~Options} options The options used to register the converter
 * @return {ConverterService} itself
 * @throws {Error} in case of error or invalid options
 */
ConverterService.prototype.register = function (options) {
  const __pretty_name__ = "register";

  // Validate the response
  const {error, value} = Joi.validate(options, registerOptionsSchema);

  if (error) {
    this.logger.warn("[%s] Received invalid options : %s\n%s", __pretty_name__, error.message, error.stack);
    throw new exceptions.IllegalArgumentException(util.format("Invalid options : %s", error.message), error);
  }

  // Register the converter
  if (!this.properties.convertersDB[value.sourceTypeName]) {
    this.properties.convertersDB[value.sourceTypeName] = {};
  }

  this.properties.convertersDB[value.sourceTypeName][value.outputTypeName] = {
    converter: value.converter
  };

  return this;
};


const canConvertOptionsSchema = Joi.object().keys({
  sourceTypeName: Joi.string().min(1).required(),
  outputTypeName: Joi.string().min(1).required()
}).required();
/**
 * @typedef {Object} ConverterService.canConvert~Options
 * @property {string} sourceTypeName The type name given to the source
 * @property {string} outputTypeName The type name given to the converted value
 */
/**
 * Check if the service can convert the specific value
 * @param {ConverterService.canConvert~Options} options The options
 * @return {boolean} true fi can convert, otherwise false
 */
ConverterService.prototype.canConvert = function (options) {
  const __pretty_name__ = "register";

  // Validate the response
  const {error, value} = Joi.validate(options, canConvertOptionsSchema);

  if (error) {
    this.logger.warn("[%s] Received invalid options : %s\n%s", __pretty_name__, error.message, error.stack);
    return false;
  }

  if (this.properties.convertersDB[value.sourceTypeName] &&
    _.isObjectLike(this.properties.convertersDB[value.sourceTypeName][value.outputTypeName])) {
    return _.isFunction(this.properties.convertersDB[value.sourceTypeName][value.outputTypeName].converter);
  }

  return false;
};

exports = module.exports = ConverterService;
