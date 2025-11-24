const Role = require("../models/role.model");

const seedRoles = async () => {
  const defaultRoles = [
    { name: "superAdmin", isSystemRole: true },
    { name: "admin", isSystemRole: true }
  ];

  for (const role of defaultRoles) {
    const exists = await Role.findOne({ name: role.name });
    if (!exists) {
      await Role.create(role);
      console.log(`Default Role Created: ${role.name}`);
    }
  }
};

module.exports = seedRoles;
