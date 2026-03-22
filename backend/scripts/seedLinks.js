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
    url: "https://www.facebook.com/share/p/189ez4RSmA/",
    title: "පොස්ට් ලයික් (Like) කරන්න.",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/17BZXdoYKV/",
    title: "පොස්ට් ලයික් (Like) කරන්න.",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/p/1VwgCvg7sT/",
    title: "පොස්ට් ලයික් (Like) කරන්න.",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/p/1GXdFQmjXY/?mibextid=wwXIfr",
    title: "පොස්ට් ලයික් (Like) කරන්න.",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/17UGyJBNSE/?mibextid=wwXIfr",
    title: "Land Sale Kesbewa - පෙජ් එක ලයික්(Like)/ෆලෝ(follwer) කරන්න කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/1BMeWSakUT/?mibextid=wwXIfr",
    title: "𝑻𝒓𝒂𝒄𝒌 𝑲𝒊𝒍𝒍𝒆𝒓 - පෙජ් එක ලයික්(Like)/ෆලෝ(follwer) කරන්න කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/profile.php?id=61553594189722&mibextid=ZbWKwL",
    title: "naturaly - පෙජ් එක ලයික්(Like)/ෆලෝ(follwer) කරන්න කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://www.facebook.com/share/1AKzruJ6hT/?mibextid=wwXIfr",
    title:
      "Laki Cooking life with Travel - පෙජ් එක ලයික්(Like)/ෆලෝ(follwer) කරන්න කරන්න",
    platform: "facebook",
    earnings: 1.0,
  },

  // Removed duplicate URL that was causing the error
  /*
  {
    url: "https://www.facebook.com/share/r/1WqjjbihPU/",
    title: "පොස්ට් ලයික් (Like) කරන්න.",
    platform: "facebook",
    earnings: 1.0,
  },
  {
    url: "https://m.facebook.com/story.php?story_fbid=pfbid021ouhx5gG5fgw5tcmBTqDizQ2fjY3eNekmRRm5hBKP9SS1sKnVK9AcA9xw7bzxzvEl&id=100010122966156&mibextid=wwXIfr",
    title: "පොස්ට් ලයික් (Like) කරන්න.",
    platform: "facebook",
    earnings: 1.0,
  },
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
