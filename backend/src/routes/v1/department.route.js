const express = require("express");
const router = express.Router();

const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const authorizeRole = require("../../middlewares/role");

const departmentController = require("../../controllers/department.controller");
const { departmentSchema } = require("../../validations/department.validation");

router.post("/", auth, authorizeRole('ceo'), validate(departmentSchema), departmentController.createDepartment);
router.get("/", auth, authorizeRole('ceo'), departmentController.getDepartments);
router.get("/:id", auth, authorizeRole('ceo'), departmentController.getDepartmentById);
router.put("/:id", auth, authorizeRole('ceo'), validate(departmentSchema), departmentController.updateDepartment);
router.delete("/:id", auth, authorizeRole('ceo'), departmentController.deleteDepartment);

module.exports = router;
