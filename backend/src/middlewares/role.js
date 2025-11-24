const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const userRoleName = (req.user.role && req.user.role.name) ? req.user.role.name : '';
    const matched = allowedRoles.some(ar => ar.toLowerCase() === userRoleName.toLowerCase());
    if (!matched) {
      return res.status(403).json({ success: false, message: 'Forbidden: You do not have the required role to access this resource' });
    }
    next(); 
  };
};


module.exports = authorizeRole;