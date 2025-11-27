const express = require("express");
const router = express.Router();

const auth = require("../../middlewares/auth");
const authorizePermissions = require('../../middlewares/permission');
const validate = require("../../middlewares/validate");

const userController = require("../../controllers/user.controller");
const { createUserSchema, updateUserSchema, createPasswordSchema } = require("../../validations/user.validation");

router.post("/", auth, authorizePermissions('create.user'), validate(createUserSchema), userController.createUser);
router.get("/", auth, authorizePermissions('get.user'), userController.getUsers);
router.get("/:id", auth, authorizePermissions('get.user'), userController.getUserById);
router.put("/:id", auth, authorizePermissions('update.user'), validate(updateUserSchema), userController.updateUser);
router.delete("/:id", auth, authorizePermissions('delete.user'), userController.deleteUser);

router.post("/invite/:id", auth, authorizePermissions('invite.user'), userController.inviteUser);
router.post("/accept-invitation", userController.acceptInvitation);
router.post("/create-password", validate(createPasswordSchema), userController.createPassword)

module.exports = router;