const Permission = require("../models/permission.model");
const Role = require("../models/role.model");
const ApiError = require("../utils/ApiError");

exports.getPermissions = async () => {
  return Permission.find();
};

exports.getPermissionsByRole = async (roleId) => {
  const role = await Role.findById(roleId).populate("permissions");
  
  if (!role) {
    throw new ApiError(404, "Role not found");
  }

  return role.permissions || [];
};