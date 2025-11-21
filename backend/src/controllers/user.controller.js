const userService = require('../services/user.service');
const ApiError = require('../utils/ApiError');
const { successResponse } = require('../utils/response');

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getUsers();
    return successResponse(res, "Get all users successfully", users, 200);
  } catch (err) {
    next(new ApiError(500, err.message));
  }
};
