const User = require("../models/user.model");
const Role = require("../models/role.model");

const seedUsers = async () => {
  try {
    const superAdminRole = await Role.findOne({ name: "superAdmin" });
    const adminRole = await Role.findOne({ name: "admin" });

    if (!superAdminRole || !adminRole) {
      console.log("Please seed roles before seeding users.");
      return;
    }

    const defaultUsers = [
      {
        name: "Super Admin",
        email: process.env.SUPER_ADMIN_EMAIL,
        password: process.env.SUPER_ADMIN_PASSWORD,
        role: superAdminRole._id,
      },
      {
        name: "Admin",
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        role: adminRole._id,
      },
    ];

    for (const userData of defaultUsers) {
      const exists = await User.findOne({ email: userData.email });

      if (!exists) {
        await User.create({
          ...userData,
          password: userData.password,
        });

        console.log(`Default User Created: ${userData.email}`);
      }
    }
  } catch (err) {
    console.error("Seed Users Error:", err.message);
  }
};

module.exports = seedUsers;
