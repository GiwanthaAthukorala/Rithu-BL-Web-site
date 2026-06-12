"use client";

import React from "react";
import {
  Youtube,
  Facebook,
  Instagram,
  MessageCircle,
  AlertCircle,
} from "lucide-react";

const UniversalVideoPlayer = ({ video }) => {
  // YouTube Player
  const renderYouTubePlayer = () => (
    <iframe
      src={video.videoUrl}
      className="w-full h-96 rounded-2xl"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      title={video.title}
    />
  );

  // Facebook Player (using Facebook embed)
  const renderFacebookPlayer = () => (
    <iframe
      src={video.videoUrl}
      className="w-full h-96 rounded-2xl"
      frameBorder="0"
      allowFullScreen
      title={video.title}
      scrolling="no"
    />
  );

  // Instagram Player
  const renderInstagramPlayer = () => (
    <iframe
      src={video.videoUrl}
      className="w-full h-96 rounded-2xl"
      frameBorder="0"
      scrolling="no"
      allowTransparency="true"
      title={video.title}
    />
  );

  // TikTok Player
  const renderTikTokPlayer = () => (
    <iframe
      src={video.videoUrl}
      className="w-full h-96 rounded-2xl"
      frameBorder="0"
      scrolling="no"
      title={video.title}
    />
  );

  // Universal Video Player with fallback
  const renderUniversalPlayer = () => {
    try {
      switch (video.platform) {
        case "youtube":
          return renderYouTubePlayer();
        case "facebook":
          return renderFacebookPlayer();
        case "instagram":
          return renderInstagramPlayer();
        case "tiktok":
          return renderTikTokPlayer();
        default:
          return renderFallbackPlayer();
      }
    } catch (error) {
      console.error("Error rendering video player:", error);
      return renderFallbackPlayer();
    }
  };

  // Fallback player for unsupported platforms
  const renderFallbackPlayer = () => (
    <div className="w-full h-96 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex flex-col items-center justify-center p-8 text-center">
      <div className="text-6xl mb-4">📱</div>
      <h3 className="text-2xl font-bold text-gray-800 mb-4">
        Direct Video Player
      </h3>
      <p className="text-gray-600 mb-6">
        This {video.platform} video is playing in a secure embedded player.
      </p>
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <AlertCircle size={16} />
        <span>
          If video doesn't load, it may be due to platform restrictions
        </span>
      </div>
    </div>
  );

  return (
    <div className="relative">
      {renderUniversalPlayer()}

      {/* Platform indicator */}
      <div className="absolute top-4 left-4 bg-black/75 text-white px-3 py-2 rounded-full flex items-center space-x-2 z-10">
        {video.platform === "youtube" && (
          <Youtube size={16} className="text-red-500" />
        )}
        {video.platform === "facebook" && (
          <Facebook size={16} className="text-blue-500" />
        )}
        {video.platform === "instagram" && (
          <Instagram size={16} className="text-pink-500" />
        )}
        {video.platform === "tiktok" && (
          <MessageCircle size={16} className="text-white" />
        )}
        <span className="text-sm font-medium capitalize">{video.platform}</span>
      </div>
    </div>
  );
};

export default UniversalVideoPlayer;
