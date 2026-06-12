require("dotenv").config({ path: ".env" }); // Load environment variables
const mongoose = require("mongoose");
const User = require("../models/userModel");

const createAdminUser = async () => {
  try {
    // Check if MONGO_URI is available
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    console.log("Connecting to MongoDB...");
    console.log(
      "MongoDB URI:",
      process.env.MONGO_URI.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@")
    ); // Hide credentials

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("Connected to MongoDB successfully");

    const adminUser = {
      firstName: "Admin",
      lastName: "User",
      email: "admin@rithu.com",
      phoneNumber: "1234567890",
      bankName: "Admin Bank",
      bankBranch: "Admin Branch",
      bankAccountNo: "0000000000",
      password: "admin123", // This will be hashed automatically by the model
      role: "superadmin",
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminUser.email });
    if (!existingAdmin) {
      const user = await User.create(adminUser);
      console.log("✅ Admin user created successfully!");
      console.log("Email:", user.email);
      console.log("Password: admin123");
      console.log("Role:", user.role);
    } else {
      console.log("ℹ️ Admin user already exists:");
      console.log("Email:", existingAdmin.email);
      console.log("Role:", existingAdmin.role);

      // Update password if needed
      if (existingAdmin.role !== "superadmin") {
        existingAdmin.role = "superadmin";
        await existingAdmin.save();
        console.log("✅ Updated user role to superadmin");
      }
    }

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Error creating admin user:", error.message);
    console.error("Full error:", error);
    process.exit(1);
  }
};

// Run the function
createAdminUser();
