const userService = require('../services/user.service');
const ApiError = require('../utils/ApiError');

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getUsers();
    res.json({ success: true, users });
  } catch (err) {
    next(new ApiError(500, err.message));
  }
};
