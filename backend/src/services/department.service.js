const Company = require("../models/company.model");
const Department = require("../models/department.model");
const ApiError = require("../utils/ApiError");

exports.createDepartment = async (departmentData) => {
    const isCompanyExist = await Company.findById(departmentData.company);
    if (!isCompanyExist) {
        throw new ApiError(400, "Associated company does not exist");
    }

    const existing = await Department.findOne({ name: new RegExp(`^${departmentData.name}$`, 'i'), company: departmentData.company });
    if (existing) {
        throw new ApiError(400, "Department with this name already exists in the company");
    }
    const department = new Department(departmentData);
    return await department.save();
};

exports.getDepartments = async (companyId) => {
    const filter = {};
    if (companyId) {
        const isCompanyExist = await Company.findById(companyId);
        if (!isCompanyExist) {
            throw new ApiError(400, "Associated company does not exist");
        }

        filter.company = companyId;
    }

    return await Department.find(filter)
        .populate("company", "name")
        .populate("createdBy", "name email").sort({ createdAt: -1 });
};

exports.getDepartmentById = async (id) => {
    return await Department.findById(id)
        .populate("company", "name")
        .populate("createdBy", "name email");
};

exports.updateDepartment = async (id, updateData) => {
    const isCompanyExist = await Company.findById(updateData.company);
    if (!isCompanyExist) {
        throw new ApiError(400, "Associated company does not exist");
    }

    const existing = await Department.findOne({
        _id: { $ne: id },
        name: new RegExp(`^${updateData.name}$`, 'i'),
        company: updateData.company,
    });

    if (existing) {
        throw new ApiError(400, "Another department with this name already exists in the company");
    }

    return await Department.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
    });
};

exports.deleteDepartment = async (id) => {
    return await Department.findByIdAndDelete(id);
};
