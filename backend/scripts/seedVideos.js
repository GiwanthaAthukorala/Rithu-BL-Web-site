require("dotenv").config();
const mongoose = require("mongoose");
const Video = require("../models/Video");

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log("MongoDB connected successfully for seeding");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    throw error;
  }
};

// Function to extract YouTube ID from URL
const extractYouTubeId = (url) => {
  const regExp =
    /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[7].length === 11 ? match[7] : null;
};

// Function to extract YouTube Shorts ID
const extractYouTubeShortsId = (url) => {
  const regExp = /youtube\.com\/shorts\/([^?&]+)/;
  const match = url.match(regExp);
  return match ? match[1] : null;
};

const sampleVideos = [
  {
    title: "Induwara Wickramarachchi - hitha (හිත) Official Music Video",
    description:
      "Induwara Wickramarachchi -  hitha (හිත) Official Music Video  Watch for 1 minute to earn Rs 1.",
    videoUrl: "https://youtu.be/VXsnevrcEJk?si=B28-wFlLbEvWRFP9",
    embedUrl: "https://youtu.be/VXsnevrcEJk?si=B28-wFlLbEvWRFP9",
    thumbnailUrl: "https://youtu.be/VXsnevrcEJk?si=B28-wFlLbEvWRFP9",
    platform: "youtube",
    duration: 60,
    rewardAmount: 0.5,
    isActive: true,
  },

  /* {
    title: "Motivational Success Story",
    description: "Inspirational story about achieving business success.",
    videoUrl:
      "https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-large.mp4",
    embedUrl:
      "https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-large.mp4",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=225&fit=crop",
    platform: "custom",
    duration: 60,
    rewardAmount: 1,
    isActive: true,
  },
  {
    title: "Technology Innovation",
    description: "Latest trends in technology and innovation.",
    videoUrl:
      "https://videos.pexels.com/video-files/855565/855565-hd_1920_1080_25fps.mp4",
    embedUrl:
      "https://videos.pexels.com/video-files/855565/855565-hd_1920_1080_25fps.mp4",
    thumbnailUrl:
      "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=225&fit=crop",
    platform: "custom",
    duration: 60,
    rewardAmount: 1,
    isActive: true,
  },*/
];

// Process YouTube URLs to ensure proper embed format
const processVideos = (videos) => {
  return videos.map((video) => {
    if (video.platform === "youtube") {
      let videoId = null;

      // Try regular YouTube URL
      if (video.videoUrl.includes("youtube.com/watch")) {
        videoId = extractYouTubeId(video.videoUrl);
      }
      // Try YouTube Shorts
      else if (video.videoUrl.includes("youtube.com/shorts")) {
        videoId = extractYouTubeShortsId(video.videoUrl);
      }

      if (videoId) {
        return {
          ...video,
          embedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&modestbranding=1`,
          thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        };
      }
    }
    return video;
  });
};

const processedVideos = processVideos(sampleVideos);

const seedVideos = async () => {
  try {
    await connectDB();

    // Clear existing videos
    await Video.deleteMany({});
    console.log("Cleared existing videos");

    // Insert processed videos
    await Video.insertMany(processedVideos);
    console.log(`Successfully created ${processedVideos.length} sample videos`);

    // Display the created videos
    const createdVideos = await Video.find({});
    console.log("\nCreated Videos:");
    createdVideos.forEach((video) => {
      console.log(
        `- ${video.title} (${video.platform}) - ${video.duration}s - Rs ${video.rewardAmount}`
      );
      console.log(`  Embed URL: ${video.embedUrl}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Error seeding videos:", error);
    process.exit(1);
  }
};

seedVideos();
