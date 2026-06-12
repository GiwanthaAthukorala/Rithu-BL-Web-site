require("dotenv").config({ path: ".env" });
const mongoose = require("mongoose");
const User = require("../models/userModel");

const createSuperAdmin = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB successfully");

    const superAdminData = {
      firstName: "Super",
      lastName: "Admin",
      email: "superadmin@rithu.com",
      phoneNumber: "0000000000",
      password: "superadmin123",
      role: "superadmin",
      isActive: true,
    };

    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({
      email: superAdminData.email,
      role: "superadmin",
    });

    if (!existingSuperAdmin) {
      const superAdmin = await User.create(superAdminData);
      console.log("✅ Super Admin created successfully!");
      console.log("Email:", superAdmin.email);
      console.log("Password: superadmin123");
      console.log("Role:", superAdmin.role);
    } else {
      console.log("ℹ️ Super Admin already exists:");
      console.log("Email:", existingSuperAdmin.email);
      console.log("Role:", existingSuperAdmin.role);

      // Update password if needed
      existingSuperAdmin.password = superAdminData.password;
      await existingSuperAdmin.save();
      console.log("✅ Super Admin password updated");
    }

    // Create regular admin user
    const adminData = {
      firstName: "Admin",
      lastName: "User",
      email: "admin@rithu.com",
      phoneNumber: "1111111111",
      password: "admin123",
      role: "admin",
      isActive: true,
    };

    const existingAdmin = await User.findOne({
      email: adminData.email,
      role: "admin",
    });

    if (!existingAdmin) {
      const admin = await User.create(adminData);
      console.log("✅ Admin user created successfully!");
      console.log("Email:", admin.email);
      console.log("Password: admin123");
      console.log("Role:", admin.role);
    } else {
      console.log("ℹ️ Admin user already exists:");
      console.log("Email:", existingAdmin.email);
      console.log("Role:", existingAdmin.role);
    }

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    console.log("\n📋 Login Credentials:");
    console.log(
      "Super Admin - Email: superadmin@rithu.com, Password: superadmin123"
    );
    console.log("Admin - Email: admin@rithu.com, Password: admin123");
    console.log("\n⚠️  Change these passwords after first login!");
  } catch (error) {
    console.error("❌ Error creating admin users:", error.message);
    console.error("Full error details:", error);
    process.exit(1);
  }
};

createSuperAdmin();
