const express = require("express");
const router = express.Router();

const auth = require("../../middlewares/auth");
const authorizePermissions = require("../../middlewares/permission");
const validate = require("../../middlewares/validate");
const validateAsync = require("../../middlewares/validateAsync");

const credentialsController = require("../../controllers/credentials.controller");
const {
  createCredentialSchema,
  updateCredentialSchema,
  shareCredentialSchema,
} = require("../../validations/credentials.validation");

router.post(
  "/",
  auth,
  authorizePermissions("create.credit"),
  validate(createCredentialSchema),
  credentialsController.createCredential
);

router.get(
  "/",
  auth,
  authorizePermissions("get.credit"),
  credentialsController.getCredentials
);

router.get(
  "/:id",
  auth,
  authorizePermissions("get.credit"),
  credentialsController.getCredentialById
);

router.put(
  "/:id",
  auth,
  authorizePermissions("update.credit"),
  validate(updateCredentialSchema),
  credentialsController.updateCredential
);

router.delete(
  "/:id",
  auth,
  authorizePermissions("delete.credit"),
  credentialsController.deleteCredential
);

router.post(
  "/:id/share",
  auth,
  authorizePermissions("share.credit"),
  validateAsync(shareCredentialSchema),
  credentialsController.shareCredential
);

router.get(
  "/access/:shareToken",
  auth,
  credentialsController.accessSharedCredential
);

module.exports = router;
