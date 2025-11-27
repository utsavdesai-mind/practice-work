const Role = require("../models/role.model");
const Permission = require("../models/permission.model");

const authorizePermissions = (...allowedPermissions) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    
    const userRole = await Role.findById(req.user.role);
    const userPermissions = await Permission.find({ _id: { $in: userRole.permissions } }); 
    const userPermissionsKeys = userPermissions.map(p => p.key);
    const lowerCaseAllowed = allowedPermissions.map(p => p.toLowerCase());
    
    const matched = userPermissionsKeys.some(userPerm => {
        return lowerCaseAllowed.includes(userPerm.toLowerCase());
    });
    
    if (!matched) {
      return res.status(403).json({ success: false, message: 'Forbidden: You do not have the required role to access this resource' });
    }
    
    next(); 
  };
};


module.exports = authorizePermissions;