const Joi = require("joi");

exports.createUserSchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  role: Joi.string().optional(),
  company: Joi.string().optional(),
  department: Joi.string().optional(),
});

exports.updateUserSchema = Joi.object({
  name: Joi.string().min(3),
  role: Joi.string(),
  company: Joi.string(),
  department: Joi.string(),
});

exports.createPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});
