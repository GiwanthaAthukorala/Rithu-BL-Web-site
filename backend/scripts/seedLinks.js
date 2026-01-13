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
    url: "https://www.facebook.com/share/v/15TniTfGbKg/?mibextid=wwXIfr",
    title: "පොස්ට් ලයික් කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/v/1JqWGkC185/?mibextid=wwXIfr",
    title: "පොස්ට් ලයික් කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/1DM118HKnR/",
    title:
      "Priyantha sirikumara - පෙජ් එක ලයික්(Like)/ෆලෝ(follwer) කරන්න කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/1F9gKWvgzx/",
    title: "Deva - දේවා - පෙජ් එක ලයික්(Like)/ෆලෝ(follwer) කරන්න කරන්න",
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
