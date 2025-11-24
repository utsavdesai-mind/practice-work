const User = require('../models/user.model');
const Role = require('../models/role.model');
const bcrypt = require('bcryptjs');
const ApiError = require('../utils/ApiError');
const { generateToken } = require('../utils/token');

exports.register = async (data) => {
  const existUser = await User.findOne({ email: data.email });
  if (existUser) throw new ApiError(400, 'Email already exists');

  const role = await Role.findById(data.role);
  if (!role) throw new ApiError(400, 'Invalid role');

  const user = await User.create(data);
  const token = generateToken(user._id, role.name);
  return { user, token };
};

exports.login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, 'User not found');

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new ApiError(401, 'Invalid credentials');

  const role = await Role.findById(user.role);
  if (!role) throw new ApiError(400, 'Invalid role');

  const token = generateToken(user._id, role.name);
  return { user, token };
};
