const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const ApiError = require('../utils/ApiError');
const { generateToken } = require('../utils/token');

exports.register = async (data) => {
  const existUser = await User.findOne({ email: data.email });
  if (existUser) throw new ApiError(400, 'Email already exists');

  const user = await User.create(data);
  const token = generateToken(user._id);
  return { user, token };
};

exports.login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, 'User not found');

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new ApiError(401, 'Invalid credentials');

  const token = generateToken(user._id);
  return { user, token };
};
