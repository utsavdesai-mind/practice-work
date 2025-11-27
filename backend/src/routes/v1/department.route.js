const express = require("express");
const router = express.Router();

const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const authorizePermissions = require('../../middlewares/permission');

const departmentController = require("../../controllers/department.controller");
const { departmentSchema } = require("../../validations/department.validation");

router.post("/", auth, authorizePermissions('create.dept'), validate(departmentSchema), departmentController.createDepartment);
router.get("/", auth, authorizePermissions('get.dept'), departmentController.getDepartments);
router.get("/:id", auth, authorizePermissions('get.dept'), departmentController.getDepartmentById);
router.put("/:id", auth, authorizePermissions('update.dept'), validate(departmentSchema), departmentController.updateDepartment);
router.delete("/:id", auth, authorizePermissions('delete.dept'), departmentController.deleteDepartment);

module.exports = router;
