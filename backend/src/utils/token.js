const jwt = require('jsonwebtoken');

exports.generateToken = (userId, userRoleId) => {
  return jwt.sign({ id: userId, role: userRoleId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};
