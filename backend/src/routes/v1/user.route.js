const express = require('express');
const router = express.Router();
const auth = require('../../middlewares/auth');
const userController = require('../../controllers/user.controller');

router.get('/', auth, userController.getAllUsers);

module.exports = router;