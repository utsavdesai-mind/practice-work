const Joi = require("joi");

exports.departmentSchema = Joi.object({
  name: Joi.string().min(3).required(),
  company: Joi.string().required()
});
