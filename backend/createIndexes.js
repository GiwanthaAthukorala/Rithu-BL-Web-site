// createIndexes.js
const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = require("./config/db");

const createIndexes = async () => {
  try {
    await connectDB();

    console.log("Creating database indexes...");

    // Get all models
    const Submission = require("./models/Submission");
    const YoutubeSubmission = require("./models/YoutubeSubmission");
    const FbReviewSubmission = require("./models/FbReviewSubmission");
    const FbCommentSubmission = require("./models/FbCommentSubmission");
    const GoogleReviewSubmission = require("./models/GoogleReviewModel");
    const Instrgram = require("./models/InstrgramModel");
    const TiktokSubmission = require("./models/TiktokModel");

    // Create compound indexes for each model
    await Promise.all([
      Submission.createIndexes([
        { createdAt: -1 },
        { status: 1, createdAt: -1 },
      ]),
      YoutubeSubmission.createIndexes([
        { createdAt: -1 },
        { status: 1, createdAt: -1 },
      ]),
      FbReviewSubmission.createIndexes([
        { createdAt: -1 },
        { status: 1, createdAt: -1 },
      ]),
      FbCommentSubmission.createIndexes([
        { createdAt: -1 },
        { status: 1, createdAt: -1 },
      ]),
      GoogleReviewSubmission.createIndexes([
        { createdAt: -1 },
        { status: 1, createdAt: -1 },
      ]),
      Instrgram.createIndexes([
        { createdAt: -1 },
        { status: 1, createdAt: -1 },
      ]),
      TiktokSubmission.createIndexes([
        { createdAt: -1 },
        { status: 1, createdAt: -1 },
      ]),
    ]);

    console.log("✅ All indexes created successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating indexes:", error);
    process.exit(1);
  }
};

createIndexes();
