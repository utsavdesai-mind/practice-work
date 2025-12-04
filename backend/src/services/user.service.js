const User = require("../models/user.model");
const Role = require("../models/role.model");
const Company = require("../models/company.model");
const Department = require("../models/department.model");
const ApiError = require("../utils/ApiError");
const mongoose = require("mongoose");
const crypto = require("crypto");
const CredentialShareToken = require("../models/credentialShareToken.model");
const Credentials = require("../models/credentials.model");

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
  if (await User.findOne({ email: data.email, company: data.company })) {
    throw new ApiError(400, "Email already exists in your company");
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
    .populate("role", "name permissions")
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
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid User ID format");
  }

  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const creds = await Credentials.find({ userId: id }).select("_id").lean();
  const credIds = creds.map((c) => c._id);

  const performDeletion = async () => {
    if (credIds.length > 0) {
      await CredentialShareToken.deleteMany({ credentialId: { $in: credIds } });
    }

    await Credentials.deleteMany({ userId: id });

    const deletedUser = await User.findByIdAndDelete(id);
    return deletedUser;
  };

  if (credIds.length === 0) {
    return performDeletion();
  }

  const now = new Date();
  const shareTokens = await CredentialShareToken.find({
    credentialId: { $in: credIds },
    expiresAt: { $gt: now }
  });

  if (!shareTokens || shareTokens.length === 0) {
    throw new ApiError(
      400,
      "The user has credentials that haven't been shared yet. Please share credentials with the department first."
    );
  }

  const notAccepted = shareTokens.filter((t) => !t.accessed);
  if (notAccepted.length > 0) {
    throw new ApiError(
      400,
      "Some shared credentials requests are still pending acceptance. Cannot delete user until all requests are accepted."
    );
  }

  return performDeletion();
};

exports.inviteUser = async (id) => {
  if (id && !mongoose.isValidObjectId(id)) {
    throw new ApiError(400, "Invalid user ID");
  }

  const otp = crypto.randomInt(100000, 999999).toString();
  const token = crypto.randomBytes(32).toString("hex");

  const invitationExpiry = Date.now() + 24 * 60 * 60 * 1000;

  const user = await User.findByIdAndUpdate(
    id,
    {
      invitationOTP: otp,
      invitationToken: token,
      invitationTokenExpiry: invitationExpiry,
    },
    { new: true }
  );

  if (!user) throw new ApiError(404, "User not found");

  return {
    otp,
    expiry: invitationExpiry,
    invitationLink: `${process.env.FRONTEND_URL}/accept-invitation?token=${token}&isAccepted=${user.isAccepted}`,
  };
};

exports.acceptInvitation = async (otp, token) => {
  const user = await User.findOne({
    invitationOTP: otp,
    invitationToken: token,
    invitationTokenExpiry: { $gt: Date.now() },
  });

  if (!user)
    throw new ApiError(400, "Invalid or expired invitation token OR otp");

  user.invitationOTP = undefined;
  user.invitationToken = undefined;
  user.invitationTokenExpiry = undefined;
  user.is_first_login = false;
  user.isAccepted = true;

  await user.save();

  return user;
};

exports.createPassword = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");

  user.password = password;
  await user.save();

  return user;
};
