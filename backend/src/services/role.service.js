const Role = require("../models/role.model");
const Company = require("../models/company.model");
const Permission = require("../models/permission.model");
const ApiError = require("../utils/ApiError");

exports.createRole = async (roleData) => {
  const isCompanyExist = await Company.findById(roleData.company);
  if (!isCompanyExist) {
    throw new ApiError(400, "Associated company does not exist");
  }

  const existing = await Role.findOne({
    name: new RegExp(`^${roleData.name}$`, "i"),
    company: roleData.company,
  });
  if (existing) {
    throw new ApiError(400, "Role with this name already exists");
  }
  const role = new Role(roleData);
  return await role.save();
};

exports.getRoles = async (companyId) => {
  const filter = {};

  if (!companyId) {
    throw new ApiError(400, "Company ID is required to fetch departments");
  }

  if (companyId) {
    const isCompanyExist = await Company.findById(companyId);
    if (!isCompanyExist) {
      throw new ApiError(400, "Associated company does not exist");
    }

    filter.company = companyId;
  }

  if (filter.isSystemRole === undefined) {
    filter.isSystemRole = false;
  }

  const ceoRoles = await Role.find({
    name: { $in: ["CEO"] },
    company: companyId,
  }).distinct("_id");

  filter._id = { $nin: ceoRoles };

  return await Role.find(filter).sort({ createdAt: -1 });
};

exports.getRoleById = async (roleId) => {
  return await Role.findById(roleId);
};

exports.updateRole = async (roleId, updateData) => {
  const isCompanyExist = await Company.findById(updateData.company);
  if (!isCompanyExist) {
    throw new ApiError(400, "Associated company does not exist");
  }

  const existing = await Role.findOne({
    _id: { $ne: roleId },
    name: new RegExp(`^${updateData.name}$`, "i"),
    company: updateData.company,
  });

  if (existing) {
    throw new ApiError(400, "Another role with this name already exists");
  }

  return await Role.findByIdAndUpdate(roleId, updateData, {
    new: true,
    runValidators: true,
  });
};

exports.deleteRole = async (roleId) => {
  return await Role.findByIdAndDelete(roleId);
};

exports.assignPermissions = async (roleId, rolePermissions) => {
  if (!Array.isArray(rolePermissions) || rolePermissions.length === 0) {
    throw new ApiError(400, "Permission list cannot be empty");
  }

  const existingPermissionsCount = await Permission.countDocuments({ 
    _id: { $in: rolePermissions } 
  });

  if (existingPermissionsCount !== rolePermissions.length) {
    throw new ApiError(400, "One or more entered permissions are invalid.");
  }

  return await Role.findByIdAndUpdate(
    roleId,
    { $set: { permissions: rolePermissions } },
    { new: true, runValidators: true } 
  );
};
