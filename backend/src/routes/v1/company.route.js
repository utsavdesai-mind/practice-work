const express = require("express");
const router = express.Router();

const auth = require("../../middlewares/auth");
const validate = require("../../middlewares/validate");
const authorizeRole = require("../../middlewares/role");

const companyController = require("../../controllers/company.controller");
const { companySchema } = require("../../validations/company.validation");

router.post("/", auth, authorizeRole('ceo'), validate(companySchema), companyController.createCompany);
router.get("/", auth, authorizeRole('ceo'), companyController.getCompanies);
router.get("/:id", auth, authorizeRole('ceo'), companyController.getCompanyById);
router.put("/:id", auth, authorizeRole('ceo'), validate(companySchema), companyController.updateCompany);
router.delete("/:id", auth, authorizeRole('ceo'), companyController.deleteCompany);

module.exports = router;
