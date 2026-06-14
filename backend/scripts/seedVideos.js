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

// Function to extract TikTok video ID
const extractTikTokId = (url) => {
  // Handle various TikTok URL formats
  const patterns = [
    /tiktok\.com\/@[^/]+\/video\/(\d+)/, // Regular video URL
    /tiktok\.com\/(?:@[^/]+\/)?video\/(\d+)/, // Alternative format
    /vm\.tiktok\.com\/([^/]+)/, // Shortened URL (will need redirect resolution)
    /vt\.tiktok\.com\/([^/]+)/, // Another shortened format
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  // Try to extract from URL parameters
  const urlObj = new URL(url);
  const pathSegments = urlObj.pathname.split("/");
  const videoId = pathSegments.find((segment) => /^\d+$/.test(segment));

  return videoId || null;
};

const sampleVideos = [
  {
    title:
      "ජපානයේ නිවාඩු දවසේ ක්‍රිකට්🏏 | A Cricket Day in Japan 🇯🇵 | Vlog #5",
    description:
      "ඔන්ලයින් දවසට විනාඩි 5ක් වැඩ කරලා රුපියල්   Watch for 0.50 minute to earn Rs 0.50.",
    videoUrl: "https://youtu.be/z2OIwheKCeA?si=bxdQWeVdnwqhcHMp",
    embedUrl: "https://youtube.com/shorts/rDp0tA2PCAc?si=t-bxdQWeVdnwqhcHMp",
    thumbnailUrl: "https://img.youtube.com/vi/bxdQWeVdnwqhcHMp/hqdefault.jpg",
    platform: "youtube",
    duration: 60,
    rewardAmount: 0.5,
    isActive: true,
  },
  {
    title:
      "අපේ Entrance Ceremony එක 🇯🇵🎉 | Our Entrance Ceremony Day in Japan | VLOG #6",
    description:
      "ඔන්ලයින් දවසට විනාඩි 5ක් වැඩ කරලා රුපියල්   Watch for 0.50 minute to earn Rs 0.50.",
    videoUrl: "https://youtu.be/UbxX-o7J9ds?si=xIY0SN6geEaobvo6",
    embedUrl: "https://youtube.com/shorts/rDp0tA2PCAc?si=t-xIY0SN6geEaobvo6",
    thumbnailUrl: "https://img.youtube.com/vi/xIY0SN6geEaobvo6/hqdefault.jpg",
    platform: "youtube",
    duration: 60,
    rewardAmount: 0.5,
    isActive: true,
  },
  {
    title:
      "සන්තොරි ඇප් එකෙන් Free බීම ගමු 😍 | Suntory App + PayPay = FREE Drinks 🧃🇯🇵 | Vlog #7",
    description:
      "ඔන්ලයින් දවසට විනාඩි 5ක් වැඩ කරලා රුපියල්   Watch for 0.50 minute to earn Rs 0.50.",
    videoUrl: "https://youtu.be/PnpnjUX1TJ4?si=CyYhuuCNbm9DpTT5",
    embedUrl: "https://youtube.com/shorts/rDp0tA2PCAc?si=t-CyYhuuCNbm9DpTT5",
    thumbnailUrl: "https://img.youtube.com/vi/CyYhuuCNbm9DpTT5/hqdefault.jpg",
    platform: "youtube",
    duration: 60,
    rewardAmount: 0.5,
    isActive: true,
  },
  {
    title:
      "Japan Visa Ceremony Day 🇯🇵🎓 | මගේ Dream එක Start උන දවස 😍 | Vlog #1",
    description:
      "ඔන්ලයින් දවසට විනාඩි 5ක් වැඩ කරලා රුපියල්   Watch for 0.50 minute to earn Rs 0.50.",
    videoUrl: "https://youtu.be/H4b8x1g4ZuE?si=jWy0m9KcUy8oFGaG",
    embedUrl: "https://youtube.com/shorts/rDp0tA2PCAc?si=t-jWy0m9KcUy8oFGaG",
    thumbnailUrl: "https://img.youtube.com/vi/jWy0m9KcUy8oFGaG/hqdefault.jpg",
    platform: "youtube",
    duration: 60,
    rewardAmount: 0.5,
    isActive: true,
  },
  /*{
    title: "❤️SAYASHOE❤️",
    description: "Daily dose of laughter with these funny TikTok videos",
    videoUrl: "https://vt.tiktok.com/ZSQFgpmV2/",
    platform: "tiktok",
    duration: 60,
    rewardAmount: 0.5,
    isActive: true,
  },
  {
    title: "ඔන්ලයින් දවසට විනාඩි 5ක් වැඩ කරලා රුපියල්",
    description:
      "ඔන්ලයින් දවසට විනාඩි 5ක් වැඩ කරලා රුපියල්   Watch for 0.50 minute to earn Rs 0.50.",
    videoUrl: "https://youtube.com/shorts/rDp0tA2PCAc?si=t-ONaDwZbs27b6D-",
    embedUrl: "https://youtube.com/shorts/rDp0tA2PCAc?si=t-ONaDwZbs27b6D-",
    thumbnailUrl: "https://img.youtube.com/vi/VXsnevrcEJk/hqdefault.jpg",
    platform: "youtube",
    duration: 60,
    rewardAmount: 0.5,
    isActive: true,
  },
  // TikTok video example
  {
    title: "Funny TikTok Compilation",
    description: "Daily dose of laughter with these funny TikTok videos",
    videoUrl: "https://www.tiktok.com/@creator/video/7324198321545415978",
    platform: "tiktok",
    duration: 45,
    rewardAmount: 0.75,
    isActive: true,
  },
  
  // Another TikTok example
  {
    title: "Cooking Tips on TikTok",
    description: "Quick and easy cooking hacks you need to know",
    videoUrl: "https://www.tiktok.com/@cheflife/video/7325199421584518186",
    platform: "tiktok",
    duration: 60,
    rewardAmount: 1.0,
    isActive: true,
  },*/
];

// Process videos to ensure proper embed format
const processVideos = (videos) => {
  return videos.map((video) => {
    // Handle YouTube videos
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
    // Handle TikTok videos
    else if (video.platform === "tiktok") {
      const videoId = extractTikTokId(video.videoUrl);

      if (videoId) {
        return {
          ...video,
          embedUrl: `https://www.tiktok.com/embed/v2/${videoId}`,
          // Note: TikTok doesn't provide direct thumbnail URLs through a simple pattern
          // You might need to use TikTok's API or a third-party service for thumbnails
          thumbnailUrl: `https://placehold.co/400x225/FF0050/FFFFFF?text=TikTok+Video&font=montserrat`,
        };
      } else {
        // For shortened URLs or if ID extraction fails, use the original URL in embed
        return {
          ...video,
          embedUrl: `https://www.tiktok.com/embed/v2?url=${encodeURIComponent(
            video.videoUrl,
          )}`,
          thumbnailUrl: `https://placehold.co/400x225/FF0050/FFFFFF?text=TikTok+Video&font=montserrat`,
        };
      }
    }

    // Return original video for custom/platforms
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
        `- ${video.title} (${video.platform}) - ${video.duration}s - Rs ${video.rewardAmount}`,
      );
      console.log(`  Embed URL: ${video.embedUrl}`);
      if (video.platform === "tiktok") {
        console.log(
          `  Note: TikTok videos require proper oEmbed/API setup for full functionality`,
        );
      }
    });

    process.exit(0);
  } catch (error) {
    console.error("Error seeding videos:", error);
    process.exit(1);
  }
};

seedVideos();
