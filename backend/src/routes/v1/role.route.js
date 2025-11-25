const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth');
const authorizeRole = require('../../middlewares/role');
const validate = require('../../middlewares/validate');
const roleController = require('../../controllers/role.controller');
const { roleSchema } = require('../../validations/role.validation');

router.post('/', auth, authorizeRole('ceo'), validate(roleSchema), roleController.createRole);
router.get('/', auth, authorizeRole('ceo'), roleController.getAllRoles);
router.get('/:id', auth, authorizeRole('ceo'), roleController.getRoleById);
router.put('/:id', auth, authorizeRole('ceo'), validate(roleSchema), roleController.updateRole);
router.delete('/:id', auth, authorizeRole('ceo'), roleController.deleteRole);

module.exports = router;
