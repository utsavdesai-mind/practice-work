const User = require("../models/user.model");
const Role = require("../models/role.model");
const Company = require("../models/company.model");
const Department = require("../models/department.model");
const ApiError = require("../utils/ApiError");
const mongoose = require("mongoose");

const resolveEntityByIdOrName = async (model, data, fieldName, query = {}) => {
  if (!data[fieldName]) return null;

  if (mongoose.isValidObjectId(data[fieldName])) {
    return data[fieldName];
  }

  const doc = await model.findOne({ name: data[fieldName], ...query });
  if (!doc) {
    throw new ApiError(400, `${fieldName} '${data[fieldName]}' does not exist`);
  }

  return doc._id;
};

exports.createUser = async (data) => {
  if (await User.findOne({ email: data.email })) {
    throw new ApiError(400, "Email already exists");
  }

  data.role =
    (await resolveEntityByIdOrName(Role, data, "role")) ||
    (await Role.findOne({ name: "User" }))._id;
  data.company = await resolveEntityByIdOrName(Company, data, "company");
  data.department = await resolveEntityByIdOrName(
    Department,
    data,
    "department",
    { company: data.company }
  );

  const user = new User(data);
  return await user.save();
};

exports.getUsers = async (companyId, departmentId, roleId) => {
  const filter = {};
  if (!companyId) {
    throw new ApiError(400, "Company ID is required to fetch users");
  }

  if (companyId) {
    const isCompanyExist = await Company.findById(companyId);
    if (!isCompanyExist) {
      throw new ApiError(400, "Associated company does not exist");
    }

    filter.company = companyId;
  }

  if (departmentId) {
    const isDepartmentExist = await Department.findById(departmentId);
    if (!isDepartmentExist) {
      throw new ApiError(400, "Associated department does not exist");
    }

    filter.department = departmentId;
  }

  const adminRoles = await Role.find({
    name: { $in: ["admin", "superAdmin", "CEO"] },
  }).distinct("_id");
  filter.role = { $nin: adminRoles };

  if (roleId) {
    const isRoleExist = await Role.findById(roleId);
    if (!isRoleExist) {
      throw new ApiError(400, "Associated role does not exist");
    }

    filter.role = { $eq: roleId };
  }

  return User.find(filter)
    .populate("role", "name")
    .populate("company", "name")
    .populate("department", "name")
    .sort({ createdAt: -1 });
};

exports.getUserById = async (id) => {
  const user = await User.findById(id)
    .populate("role", "name")
    .populate("company", "name")
    .populate("department", "name");

  if (!user) throw new ApiError(404, "User not found");
  return user;
};

exports.updateUser = async (id, data) => {
  const user = await User.findById(id);
  if (!user) throw new ApiError(404, "User not found");

  data.role = (await resolveEntityByIdOrName(Role, data, "role")) || user.role;
  data.company =
    (await resolveEntityByIdOrName(Company, data, "company")) || user.company;
  data.department =
    (await resolveEntityByIdOrName(Department, data, "department", {
      company: data.company,
    })) || user.department;

  return User.findByIdAndUpdate(id, data, { new: true })
    .populate("role", "name")
    .populate("company", "name")
    .populate("department", "name");
};

exports.deleteUser = async (id) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) throw new ApiError(404, "User not found");
  return user;
};
