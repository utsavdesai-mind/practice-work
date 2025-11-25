const Joi = require("joi");

exports.roleSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  company: Joi.string().required(),
  permissions: Joi.array().items(Joi.string()).optional(),
});
