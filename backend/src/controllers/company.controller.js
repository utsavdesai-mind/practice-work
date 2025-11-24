const ApiError = require("../utils/ApiError");
const { successResponse } = require("../utils/response");
const companyService = require("../services/company.service");

exports.createCompany = async (req, res, next) => {
  try {
    const data = { ...req.body, createdBy: req.user.id };
    const company = await companyService.createCompany(data);

    return successResponse(res, "Company created successfully", company, 201);
  } catch (err) {
    next(err);
  }
};

exports.getCompanies = async (req, res, next) => {
  try {
    const companies = await companyService.getCompanies();
    return successResponse(res, "Companies fetched successfully", companies, 200);
  } catch (err) {
    next(err);
  }
};

exports.getCompanyById = async (req, res, next) => {
  try {
    const company = await companyService.getCompanyById(req.params.id);
    if (!company) return next(new ApiError(404, "Company not found"));

    return successResponse(res, "Company fetched successfully", company, 200);
  } catch (err) {
    next(err);
  }
};

exports.updateCompany = async (req, res, next) => {
  try {
    const company = await companyService.updateCompany(req.params.id, req.body);
    if (!company) return next(new ApiError(404, "Company not found"));

    return successResponse(res, "Company updated successfully", company, 200);
  } catch (err) {
    next(err);
  }
};

exports.deleteCompany = async (req, res, next) => {
  try {
    // First delete all departments associated with the company
    await companyService.deleteDepartmentsByCompanyId(req.params.id);

    // Then delete the company itself
    const company = await companyService.deleteCompany(req.params.id);
    if (!company) return next(new ApiError(404, "Company not found"));

    return successResponse(res, "Company deleted successfully", null, 200);
  } catch (err) {
    next(err);
  }
};
