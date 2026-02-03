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
    url: "https://www.facebook.com/share/1NNGJpYSCT",
    title:
      "Signature Gold House - පෙජ් එක ලයික්(Like)/ෆලෝ(follwer) කරන්න කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/1FmLCXH6hU",
    title: "Chamara Dilshan - පෙජ් එක ලයික්(Like)/ෆලෝ(follwer) කරන්න කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/1DSFRqaB5G",
    title:
      "Apexaura Wellness product with gimhani - Media - පෙජ් එක ලයික්(Like)/ෆලෝ(follwer) කරන්න කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://web.facebook.com/profile.php?id=100063634343067",
    title:
      "Akalanka Karunarathna Photography - පෙජ් එක ලයික්(Like)/ෆලෝ(follwer) කරන්න කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/1QxWfTuuJy/?mibextid=wwXIfr",
    title:
      "Soft Gallery Digital - පෙජ් එක ලයික්(Like)/ෆලෝ(follwer) කරන්න කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://web.facebook.com/profile.php?id=61578106467661",
    title:
      "බත්තිරන් Food Village & Caterers - පෙජ් එක ලයික්(Like)/ෆලෝ(follwer) කරන්න කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://web.facebook.com/profile.php?id=61587547283948&rdid=oV43XcqtVZFQbNeR&share_url=https%3A%2F%2Fweb.facebook.com%2Fshare%2F1CMJBjfKNj%2F%3F_rdc%3D1%26_rdr",
    title: "Twinkle in korea - පෙජ් එක ලයික්(Like)/ෆලෝ(follwer) කරන්න කරන්න",
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
