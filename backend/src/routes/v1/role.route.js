const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth');
const authorizePermissions = require('../../middlewares/permission');
const validate = require('../../middlewares/validate');
const roleController = require('../../controllers/role.controller');
const { roleSchema } = require('../../validations/role.validation');

router.post('/', auth, authorizePermissions('create.role'), validate(roleSchema), roleController.createRole);
router.get('/', auth, roleController.getAllRoles);
router.get('/:id', auth, authorizePermissions('get.role'), roleController.getRoleById);
router.put('/:id', auth, authorizePermissions('update.role'), validate(roleSchema), roleController.updateRole);
router.delete('/:id', auth, authorizePermissions('delete.role'), roleController.deleteRole);

router.post('/assign-permission/:id', auth, authorizePermissions('assign.role'), roleController.assignPermissions)

module.exports = router;
