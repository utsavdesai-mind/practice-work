const express = require("express");
const router = express.Router();

const auth = require("../../middlewares/auth");
const authorizeRole = require("../../middlewares/role");
const validate = require("../../middlewares/validate");

const userController = require("../../controllers/user.controller");
const { createUserSchema, updateUserSchema } = require("../../validations/user.validation");

router.post("/", auth, authorizeRole('admin', 'superAdmin'), validate(createUserSchema), userController.createUser);
router.get("/", auth, authorizeRole('admin', 'superAdmin'), userController.getUsers);
router.get("/:id", auth, authorizeRole('admin', 'superAdmin'), userController.getUserById);
router.put("/:id", auth, authorizeRole('admin', 'superAdmin'), validate(updateUserSchema), userController.updateUser);
router.delete("/:id", auth, authorizeRole('admin', 'superAdmin'), userController.deleteUser);

module.exports = router;