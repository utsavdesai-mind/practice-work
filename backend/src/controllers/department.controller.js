const ApiError = require("../utils/ApiError");
const { successResponse } = require("../utils/response");
const departmentService = require("../services/department.service");

exports.createDepartment = async (req, res, next) => {
  try {
    const data = {
      ...req.body,
      createdBy: req.user.id,
    };

    const department = await departmentService.createDepartment(data);

    return successResponse(res, "Department created successfully", department, 201);
  } catch (err) {
    next(err);
  }
};

exports.getDepartments = async (req, res, next) => {
  try {
    const { company } = req.query;
    const departments = await departmentService.getDepartments(company);

    return successResponse(res, "Departments fetched successfully", departments, 200);
  } catch (err) {
    next(err);
  }
};


exports.getDepartmentById = async (req, res, next) => {
  try {
    const department = await departmentService.getDepartmentById(req.params.id);
    if (!department) return next(new ApiError(404, "Department not found"));

    return successResponse(res, "Department fetched successfully", department, 200);
  } catch (err) {
    next(err);
  }
};

exports.updateDepartment = async (req, res, next) => {
  try {
    const department = await departmentService.updateDepartment(req.params.id, req.body);
    if (!department) return next(new ApiError(404, "Department not found"));

    return successResponse(res, "Department updated successfully", department, 200);
  } catch (err) {
    next(err);
  }
};

exports.deleteDepartment = async (req, res, next) => {
  try {
    const department = await departmentService.deleteDepartment(req.params.id);
    if (!department) return next(new ApiError(404, "Department not found"));

    return successResponse(res, "Department deleted successfully", null, 200);
  } catch (err) {
    next(err);
  }
};
