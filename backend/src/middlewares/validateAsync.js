const ApiError = require('../utils/ApiError');

const validateAsync = (schema) => async (req, res, next) => {
  try {
    await schema.validateAsync(req.body, { abortEarly: false });
    next();
  } catch (error) {
    const errorMessage = error.details ? error.details[0].message : error.message;
    return next(new ApiError(400, errorMessage));
  }
};

module.exports = validateAsync;
