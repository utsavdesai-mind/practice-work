const Joi = require("joi");

exports.registerSchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  companyName: Joi.string().required(),
  companyAddress: Joi.string().required(),
  companySize: Joi.number().integer().min(1).required(),
  companyIndustry: Joi.string().required(),
});

exports.loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
