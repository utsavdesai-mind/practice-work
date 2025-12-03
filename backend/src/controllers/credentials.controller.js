const { successResponse } = require("../utils/response");
const credentialsService = require("../services/credentials.service");

exports.createCredential = async (req, res, next) => {
  try {
    const credential = await credentialsService.createCredential(
      req.user._id,
      req.body
    );
    return successResponse(
      res,
      "Credential created successfully",
      credential,
      201
    );
  } catch (err) {
    next(err);
  }
};

exports.getCredentials = async (req, res, next) => {
  try {
    const credentials = await credentialsService.getCredentials(
      req.query
    );
    return successResponse(
      res,
      "Credentials fetched successfully",
      credentials,
      200
    );
  } catch (err) {
    next(err);
  }
};

exports.getCredentialById = async (req, res, next) => {
  try {
    const credential = await credentialsService.getCredentialById(
      req.params.id,
      req.user._id
    );
    return successResponse(
      res,
      "Credential fetched successfully",
      credential,
      200
    );
  } catch (err) {
    next(err);
  }
};

exports.updateCredential = async (req, res, next) => {
  try {
    const credential = await credentialsService.updateCredential(
      req.params.id,
      req.body
    );
    return successResponse(
      res,
      "Credential updated successfully",
      credential,
      200
    );
  } catch (err) {
    next(err);
  }
};

exports.deleteCredential = async (req, res, next) => {
  try {
    await credentialsService.deleteCredential(req.params.id);
    return successResponse(res, "Credential deleted successfully", null, 200);
  } catch (err) {
    next(err);
  }
};

exports.shareCredential = async (req, res, next) => {
  try {
    const result = await credentialsService.shareCredential(
      req.params.id,
      req.user._id,
      req.body
    );
    return successResponse(res, result.message, result, 200);
  } catch (err) {
    next(err);
  }
};

exports.accessSharedCredential = async (req, res, next) => {
  try {
    const credential = await credentialsService.accessSharedCredential(
      req.params.shareToken,
      req.user._id
    );
    return successResponse(
      res,
      "Shared credential accessed successfully",
      credential,
      200
    );
  } catch (err) {
    next(err);
  }
};

