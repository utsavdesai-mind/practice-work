const Company = require("../models/company.model");
const Department = require("../models/department.model");
const ApiError = require("../utils/ApiError");

exports.createCompany = async (companyData) => {
  const existing = await Company.findOne({ name: new RegExp(`^${companyData.name}$`, 'i') });
  if (existing) {
    throw new ApiError(400, "Company with this name already exists");
  }
  const company = new Company(companyData);
  return await company.save();
};

exports.getCompanies = async () => {
  return await Company.find().populate("createdBy", "name email").sort({ createdAt: -1 });
};

exports.getCompanyById = async (companyId) => {
  return await Company.findById(companyId).populate("createdBy", "name email");
};

exports.updateCompany = async (companyId, updateData) => {
  if (updateData.name) {
    const existing = await Company.findOne({
      _id: { $ne: companyId },
      name: new RegExp(`^${updateData.name}$`, "i"),
    });

    if (existing) {
      throw new ApiError(400, "Another company with this name already exists");
    }
  }
  return await Company.findByIdAndUpdate(companyId, updateData, {
    new: true,
    runValidators: true,
  });
};

exports.deleteCompany = async (companyId) => {
  return await Company.findByIdAndDelete(companyId);
};

exports.deleteDepartmentsByCompanyId = async (companyId) => {
  return await Department.deleteMany({ company: companyId });
};
