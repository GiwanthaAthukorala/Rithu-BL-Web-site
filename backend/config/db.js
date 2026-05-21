const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 30000,
    });
    console.log("MongoDB connected successfully");

    // Programmatically drop the unique index on videowatchsessions if it exists
    try {
      const db = mongoose.connection.db;
      if (db) {
        await db.collection("videowatchsessions").dropIndex("user_1_video_1");
        console.log("Dropped unique index user_1_video_1 on videowatchsessions");
      }
    } catch (error) {
      // IndexNotFound is codeName 'IndexNotFound' and code 27, which is completely safe to ignore
      if (error.codeName !== "IndexNotFound" && error.code !== 27) {
        console.warn("Unique index drop check warning:", error.message);
      }
    }
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
};

// Prevent premature closing in serverless
if (!process.env.VERCEL) {
  process.on("SIGTERM", async () => {
    await mongoose.connection.close();
    console.log("MongoDB connection closed gracefully");
    process.exit(0);
  });
}

module.exports = connectDB;
