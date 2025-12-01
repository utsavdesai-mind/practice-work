const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.route');
const userRoutes = require('./user.route');
const roleRoutes = require('./role.route');
const companyRoutes = require('./company.route');
const departmentRoutes = require('./department.route');
const permissionRoutes = require('./permission.route');
const credentialsRoutes = require('./credentials.route');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);
router.use('/companies', companyRoutes);
router.use('/departments', departmentRoutes);
router.use('/permissions', permissionRoutes);
router.use('/credentials', credentialsRoutes);

module.exports = router;
