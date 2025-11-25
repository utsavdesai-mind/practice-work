const express = require("express");
const router = express.Router();

const auth = require("../../middlewares/auth");
const authorizeRole = require("../../middlewares/role");
const validate = require("../../middlewares/validate");

const userController = require("../../controllers/user.controller");
const { createUserSchema, updateUserSchema } = require("../../validations/user.validation");

router.post("/", auth, authorizeRole('ceo'), validate(createUserSchema), userController.createUser);
router.get("/", auth, authorizeRole('ceo'), userController.getUsers);
router.get("/:id", auth, authorizeRole('ceo'), userController.getUserById);
router.put("/:id", auth, authorizeRole('ceo'), validate(updateUserSchema), userController.updateUser);
router.delete("/:id", auth, authorizeRole('ceo'), userController.deleteUser);

module.exports = router;