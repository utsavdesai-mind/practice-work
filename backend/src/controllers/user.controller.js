const ApiError = require("../utils/ApiError");
const { successResponse } = require("../utils/response");
const userService = require("../services/user.service");

exports.createUser = async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body);
    return successResponse(res, "User created successfully", user, 201);
  } catch (err) {
    next(err);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const { company, department, role } = req.query;
    const users = await userService.getUsers(company, department, role);
    return successResponse(res, "Users fetched successfully", users, 200);
  } catch (err) {
    next(err);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await userService.getUserById(req.params.id);
    if (!user) throw new ApiError(404, "User not found");

    return successResponse(res, "User fetched successfully", user, 200);
  } catch (err) {
    next(err);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const user = await userService.updateUser(req.params.id, req.body);
    if (!user) throw new ApiError(404, "User not found");

    return successResponse(res, "User updated successfully", user, 200);
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    const user = await userService.deleteUser(req.params.id);
    if (!user) throw new ApiError(404, "User not found");

    return successResponse(res, "User deleted successfully", null, 200);
  } catch (err) {
    next(err);
  }
};
