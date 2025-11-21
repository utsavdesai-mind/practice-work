const authService = require('../services/auth.service');
const { successResponse } = require('../utils/response');

exports.register = async (req, res, next) => {
  try {
    const { user, token } = await authService.register(req.body);
    return successResponse(res, "User registered successfully", { user, token }, 201);
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { user, token } = await authService.login(req.body);
    return successResponse(res, "Login successful", { user, token });
  } catch (err) {
    next(err);
  }
};
