const permissionService = require("../services/permission.service");
const { successResponse } = require("../utils/response");

exports.getPermissions = async (req, res, next) => {
  try {
    const permissions = await permissionService.getPermissions();
    return successResponse(res, "Permissions fetched successfully", permissions, 200);
  } catch (err) {
    next(err);
  }
};