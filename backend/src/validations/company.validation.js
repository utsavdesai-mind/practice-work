const Joi = require("joi");

exports.companySchema = Joi.object({
  name: Joi.string().min(3).required(),
  address: Joi.string().allow("", null)
});
