const Role = require('../models/role.model');
const ApiError = require('../utils/ApiError');

exports.createRole = async (roleData) => {
  const existing = await Role.findOne({ name: new RegExp(`^${roleData.name}$`, 'i') });
  if (existing) {
    throw new ApiError(400, 'Role with this name already exists');
  }
  const role = new Role(roleData);
  return await role.save();
};

exports.getRoles = async (filter = {}) => {
  if (filter.isSystemRole === undefined) {
    filter.isSystemRole = false;
  }
  return await Role.find(filter).sort({ createdAt: -1 });
};

exports.getRoleById = async (roleId) => {
  return await Role.findById(roleId);
};

exports.updateRole = async (roleId, updateData) => {
  if (updateData.name) {
    const existing = await Role.findOne({ 
      _id: { $ne: roleId }, 
      name: new RegExp(`^${updateData.name}$`, 'i') 
    });
    if (existing) {
      throw new ApiError(400, 'Another role with this name already exists');
    }
  }
  return await Role.findByIdAndUpdate(roleId, updateData, { new: true, runValidators: true });
};

exports.deleteRole = async (roleId) => {
  return await Role.findByIdAndDelete(roleId);
};
