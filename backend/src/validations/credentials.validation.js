const Joi = require("joi");

exports.createCredentialSchema = Joi.object({
  company: Joi.string().required(),
  name: Joi.string().min(3).max(100).required(),
  url: Joi.string().uri().required(),
  userName: Joi.string().min(1).required(),
  password: Joi.string().min(6).required(),
});

exports.updateCredentialSchema = Joi.object({
  name: Joi.string().min(3).max(100),
  url: Joi.string().uri(),
  userName: Joi.string().min(1),
  password: Joi.string().min(6),
}).min(1);

exports.shareCredentialSchema = Joi.object({
  company: Joi.string().required(),
  email: Joi.string().email().optional(),
  department: Joi.string().optional(),
}).external(async (value) => {
  if (!value.email && !value.department) {
    throw new Error("Either email or department must be provided");
  }
  if (value.email && value.department) {
    throw new Error("Only one of email or departmentId can be provided");
  }
});

