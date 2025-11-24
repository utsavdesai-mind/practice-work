const express = require("express");
const router = express.Router();

const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const authorizeRole = require("../../middlewares/role");

const companyController = require("../../controllers/company.controller");
const { companySchema } = require("../../validations/company.validation");

router.post("/", auth, authorizeRole('admin', 'superAdmin'), validate(companySchema), companyController.createCompany);
router.get("/", auth, authorizeRole('admin', 'superAdmin'), companyController.getCompanies);
router.get("/:id", auth, authorizeRole('admin', 'superAdmin'), companyController.getCompanyById);
router.put("/:id", auth, authorizeRole('admin', 'superAdmin'), validate(companySchema), companyController.updateCompany);
router.delete("/:id", auth, authorizeRole('admin', 'superAdmin'), companyController.deleteCompany);

module.exports = router;
