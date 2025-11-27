const Permission = require("../models/permission.model");

exports.getPermissions = async () => {
  return Permission.find();
};