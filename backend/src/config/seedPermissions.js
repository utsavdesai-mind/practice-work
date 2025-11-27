const Role = require("../models/role.model");
const Permission = require("../models/permission.model");

const seedPermissions = async () => {
  const defaultPermissions = [
    { label: "Create Role", key: "create.role", module: "role" },
    { label: "Update Role", key: "update.role", module: "role" },
    { label: "Delete Role", key: "delete.role", module: "role" },
    { label: "Get Role", key: "get.role", module: "role" },
    { label: "Assign Role", key: "assign.role", module: "role" },
    { label: "Create User", key: "create.user", module: "user" },
    { label: "Update User", key: "update.user", module: "user" },
    { label: "Delete User", key: "delete.user", module: "user" },
    { label: "Get User", key: "get.user", module: "user" },
    { label: "Invite User", key: "invite.user", module: "user" },
    { label: "Create Department", key: "create.dept", module: "department" },
    { label: "Update Department", key: "update.dept", module: "department" },
    { label: "Delete Department", key: "delete.dept", module: "department" },
    { label: "Get Department", key: "get.dept", module: "department" },
  ];

  for (const permission of defaultPermissions) {
    const exists = await Permission.findOne({ key: permission.key });
    if (!exists) {
      await Permission.create(permission);
      console.log(`Permission Created: ${permission.key}`);
    }
  }

  const allCEORoles = await Role.find({ name: "CEO" });
  if (allCEORoles.length === 0) {
      console.log("No CEO roles found. Skipping permission assignment.");
      return;
  }
  
  const allExistingPermissions = await Permission.find();
  const allPermissionIds = allExistingPermissions.map(p => p._id);  

  for (const ceoRole of allCEORoles) {
    await Role.findByIdAndUpdate(
        ceoRole._id,
        { $addToSet: { permissions: { $each: allPermissionIds } } },
        { new: true } 
    );
  }

  console.log("Permission seeding and assignment complete.");
};

module.exports = seedPermissions;