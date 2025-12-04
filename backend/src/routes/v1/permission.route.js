const express = require("express");
const router = express.Router();

const auth = require("../../middlewares/auth");

const permissionController = require("../../controllers/permission.controller");

router.get("/", auth, permissionController.getPermissions);
router.get("/role/:roleId", auth, permissionController.getPermissionsByRole);

module.exports = router;