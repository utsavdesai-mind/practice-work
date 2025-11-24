const express = require("express");
const router = express.Router();

const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const authorizeRole = require("../../middlewares/role");

const departmentController = require("../../controllers/department.controller");
const { departmentSchema } = require("../../validations/department.validation");

router.post("/", auth, authorizeRole('admin', 'superAdmin'), validate(departmentSchema), departmentController.createDepartment);
router.get("/", auth, authorizeRole('admin', 'superAdmin'), departmentController.getDepartments);
router.get("/:id", auth, authorizeRole('admin', 'superAdmin'), departmentController.getDepartmentById);
router.put("/:id", auth, authorizeRole('admin', 'superAdmin'), validate(departmentSchema), departmentController.updateDepartment);
router.delete("/:id", auth, authorizeRole('admin', 'superAdmin'), departmentController.deleteDepartment);

module.exports = router;
