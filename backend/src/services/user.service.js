const User = require('../models/user.model');

exports.getUsers = async () => {
  return await User.find();
};
