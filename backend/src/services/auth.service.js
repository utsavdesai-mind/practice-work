const mongoose = require("mongoose");
const User = require("../models/user.model");
const Role = require("../models/role.model");
const Company = require("../models/company.model");
const Permission = require("../models/permission.model");
const bcrypt = require("bcryptjs");
const ApiError = require("../utils/ApiError");
const { generateToken } = require("../utils/token");

exports.register = async (data) => {
  const {
    name,
    email,
    password,
    companyName,
    companyAddress,
    companySize,
    companyIndustry,
  } = data;
  const existUser = await User.findOne({ email: data.email });
  if (existUser) throw new ApiError(400, "Email already exists");

  const session = await mongoose.startSession();
  let resultUser = null;
  let resultToken = null;
  try {
    await session.withTransaction(async () => {
      const user = new User({ name, email, password });
      await user.save({ session });

      const company = new Company({
        name: companyName,
        address: companyAddress,
        size: companySize,
        industry: companyIndustry,
        createdBy: user._id,
      });
      await company.save({ session });

      const allExistingPermissions = await Permission.find();
      const allPermissionIds = allExistingPermissions.map((p) => p._id);

      const role = new Role({
        name: "CEO",
        company: company._id,
        createdBy: user._id,
        permissions: allPermissionIds,
        isSystemRole: true,
      });
      await role.save({ session });

      user.role = role._id;
      user.company = company._id;
      await user.save({ session });

      resultUser = user;
      resultToken = generateToken(user._id, role._id);
    });
  } catch (err) {
    throw err;
  } finally {
    session.endSession();
  }

  if (resultUser) {
    resultUser = resultUser.toObject();
    delete resultUser.password;
  }

  

  return { user: resultUser, token: resultToken };
};

exports.login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new ApiError(401, "Invalid credentials");

  let role = null;
  if (user.role) role = await Role.findById(user.role).lean();
  if (!role) role = await Role.findOne({ createdBy: user._id }).lean();
  if (!role) throw new ApiError(404, "Role not found for user");

  let company = null;
  if (user.company) company = await Company.findById(user.company).lean();
  if (!company) company = await Company.findOne({ createdBy: user._id }).lean();
  if (!company) throw new ApiError(404, "Company not found for user");

  const permissionDocs = await Permission.find({
    _id: { $in: role.permissions },
  })
    .select("key -_id")
    .lean();
  const permissionKeys = permissionDocs.map((p) => p.key);
  role.permissions = permissionKeys;

  const userObj = user.toObject();
  delete userObj.password;
  userObj.role = role;
  userObj.company = company;

  const token = generateToken(user._id, role._id);
  return { user: userObj, token };
};
