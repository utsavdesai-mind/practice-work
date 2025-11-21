const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.route');
const userRoutes = require('./user.route');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);

module.exports = router;
