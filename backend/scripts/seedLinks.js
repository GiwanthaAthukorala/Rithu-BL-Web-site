require("dotenv").config();
const mongoose = require("mongoose");
const Link = require("../models/Link");

// Create a direct connection function for the seed script
const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log("MongoDB connected successfully for seeding");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
};

const facebookLinks = [
  {
    url: "https://www.facebook.com/share/1Dz7WK1eL3/",
    title: "පොස්ට් ලයික් කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },

  {
    url: "https://www.facebook.com/share/17irixtVGW/?mibextid=wwXIfr",
    title:
      "Indhu salon & Photography - පෙජ් එක ලයික්(Like)/ෆලෝ(follwer) කරන්න කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/17418BPsuW/",
    title: "Chandrika's Super  - පෙජ් එක ලයික්(Like)/ෆලෝ(follwer) කරන්න කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://web.facebook.com/profile.php?id=61586299390600",
    title:
      "HONDA MS Motors Holdings Co Pvt Ltd  - පෙජ් එක ලයික්(Like)/ෆලෝ(follwer) කරන්න කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },

  // Removed duplicate URL that was causing the error
  /*
  {
    url: "https://www.facebook.com/share/1ARA89E5H1/",
    title: "Cylora Fashion - පෙජ් එක ලයික් (Like)/ෆලෝ (follwer) කරන්න කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },*/
];

async function seedLinks() {
  try {
    await connectDB();

    // Clear existing Facebook links
    await Link.deleteMany({ platform: "facebook" });
    console.log("Cleared existing Facebook links");

    // Insert all links
    for (const linkData of facebookLinks) {
      await Link.create(linkData);
      console.log(`Added link: ${linkData.title}`);
    }

    console.log("Links seeding completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
}

seedLinks();
