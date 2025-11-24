const ApiError = require('../utils/ApiError');
const { successResponse } = require('../utils/response');
const roleService = require('../services/role.service');

exports.createRole = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (req.user && req.user.id) payload.createdBy = req.user.id;

    const role = await roleService.createRole(payload);
    return successResponse(res, 'Role created successfully', role, 201);
  } catch (err) {
    return next(err);
  }
};

exports.getAllRoles = async (req, res, next) => {
  try {
    const roles = await roleService.getRoles();
    return successResponse(res, 'Roles fetched successfully', roles, 200);
  } catch (err) {
    next(err);
  }
};

exports.getRoleById = async (req, res, next) => {
  try {
    const role = await roleService.getRoleById(req.params.id);
    if (!role) {
      return next(new ApiError(404, 'Role not found'));
    }
    return successResponse(res, 'Role fetched successfully', role, 200);
  } catch (err) {
    next(err);
  }
};

exports.updateRole = async (req, res, next) => {
  try {
    const role = await roleService.updateRole(req.params.id, req.body);
    if (!role) {
      return next(new ApiError(404, 'Role not found'));
    }
    return successResponse(res, 'Role updated successfully', role, 200);
  } catch (err) {
    next(err);
  }
};

exports.deleteRole = async (req, res, next) => {
  try {
    const role = await roleService.deleteRole(req.params.id);
    if (!role) {
      return next(new ApiError(404, 'Role not found'));
    }
    return successResponse(res, 'Role deleted successfully', null, 200);
  } catch (err) {
    next(err);
  }
};
