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

    // Super Admin Data with dummy bank details
    const superAdminData = {
      firstName: "Super",
      lastName: "Admin",
      email: "superadmin@rithu.com",
      phoneNumber: "0000000000",
      password: "superadmin123",
      bankName: "Admin Bank",
      bankBranch: "Admin Branch",
      bankAccountNo: "0000000000000000",
      role: "superadmin",
      isActive: true,
    };

    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({
      email: superAdminData.email,
    });

    if (existingSuperAdmin) {
      // Update existing user to superadmin role
      existingSuperAdmin.role = "superadmin";
      existingSuperAdmin.password = superAdminData.password;
      existingSuperAdmin.bankName = superAdminData.bankName;
      existingSuperAdmin.bankBranch = superAdminData.bankBranch;
      existingSuperAdmin.bankAccountNo = superAdminData.bankAccountNo;
      existingSuperAdmin.isActive = true;

      await existingSuperAdmin.save();
      console.log("✅ Existing user updated to Super Admin!");
    } else {
      const superAdmin = await User.create(superAdminData);
      console.log("✅ Super Admin created successfully!");
    }

    // Regular Admin User with dummy bank details
    const adminData = {
      firstName: "Admin",
      lastName: "User",
      email: "admin@rithu.com",
      phoneNumber: "1111111111",
      password: "admin123",
      bankName: "Admin Bank",
      bankBranch: "Admin Branch",
      bankAccountNo: "1111111111111111",
      role: "admin",
      isActive: true,
    };

    const existingAdmin = await User.findOne({
      email: adminData.email,
    });

    if (existingAdmin) {
      // Update existing user to admin role
      existingAdmin.role = "admin";
      existingAdmin.password = adminData.password;
      existingAdmin.bankName = adminData.bankName;
      existingAdmin.bankBranch = adminData.bankBranch;
      existingAdmin.bankAccountNo = adminData.bankAccountNo;
      existingAdmin.isActive = true;

      await existingAdmin.save();
      console.log("✅ Existing user updated to Admin!");
    } else {
      const admin = await User.create(adminData);
      console.log("✅ Admin user created successfully!");
    }

    // Display final credentials
    const finalSuperAdmin = await User.findOne({
      email: "superadmin@rithu.com",
    });
    const finalAdmin = await User.findOne({ email: "admin@rithu.com" });

    console.log("\n📋 Final Admin Credentials:");
    console.log("Super Admin:");
    console.log("  Email:", finalSuperAdmin.email);
    console.log("  Password: superadmin123");
    console.log("  Role:", finalSuperAdmin.role);

    console.log("\nAdmin:");
    console.log("  Email:", finalAdmin.email);
    console.log("  Password: admin123");
    console.log("  Role:", finalAdmin.role);

    await mongoose.disconnect();
    console.log("\n✅ Admin setup completed successfully!");
  } catch (error) {
    console.error("❌ Error creating admin users:", error.message);

    // More detailed error information
    if (error.name === "ValidationError") {
      console.error("Validation errors:");
      Object.keys(error.errors).forEach((key) => {
        console.error(`  - ${key}: ${error.errors[key].message}`);
      });
    }

    process.exit(1);
  }
};

createSuperAdmin();
