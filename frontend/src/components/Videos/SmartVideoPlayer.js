"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Youtube,
  Video,
  Play,
  CheckCircle,
  X,
  Clock,
  ExternalLink,
  AlertCircle,
} from "lucide-react";

const SmartVideoPlayer = ({ video, onClose, onTimeUpdate, sessionId, onPlay }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [embedError, setEmbedError] = useState(false);
  const videoRef = useRef(null);
  const iframeRef = useRef(null);
  const timeIntervalRef = useRef(null);

  // Platform configuration
  const platformConfig = {
    youtube: {
      embeddable: false,
      icon: <Youtube size={20} className="text-red-500" />,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      btnClass: "from-red-600 to-red-700 hover:from-red-700 hover:to-red-800",
      btnText: "Watch on YouTube",
    },
    custom: {
      embeddable: true,
      icon: <Video size={20} className="text-purple-500" />,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      btnClass: "from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700",
      btnText: "Open Video",
    },
    facebook: {
      embeddable: false,
      icon: <span className="text-blue-500">📘</span>,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      btnClass: "from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800",
      btnText: "Watch on Facebook",
    },
    instagram: {
      embeddable: false,
      icon: <span className="text-pink-500">📷</span>,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      borderColor: "border-pink-200",
      btnClass: "from-pink-600 to-pink-700 hover:from-pink-700 hover:to-pink-800",
      btnText: "Watch on Instagram",
    },
    tiktok: {
      embeddable: false,
      icon: <span className="text-black">🎵</span>,
      color: "text-black",
      bgColor: "bg-gray-50",
      borderColor: "border-gray-200",
      btnClass: "from-gray-800 to-black hover:from-black hover:to-gray-900",
      btnText: "Watch on TikTok",
    },
  };

  const config = platformConfig[video.platform] || platformConfig.custom;

  useEffect(() => {
    setIsClient(true);
    return () => {
      if (timeIntervalRef.current) {
        clearInterval(timeIntervalRef.current);
      }
    };
  }, []);

  const startTimeTracking = () => {
    if (timeIntervalRef.current) {
      clearInterval(timeIntervalRef.current);
    }

    let seconds = 0;
    timeIntervalRef.current = setInterval(() => {
      seconds += 1;
      setCurrentTime(seconds);

      // Send progress update every 5 seconds
      if (seconds % 5 === 0) {
        onTimeUpdate?.(seconds);
      }

      // Check if video duration reached
      if (seconds >= video.duration) {
        completeVideo();
      }
    }, 1000);
  };

  const completeVideo = () => {
    if (timeIntervalRef.current) {
      clearInterval(timeIntervalRef.current);
      timeIntervalRef.current = null;
    }
    setIsCompleted(true);
    setIsPlaying(false);
    onTimeUpdate?.(video.duration, true);
  };

  const handlePlay = () => {
    setIsPlaying(true);
    startTimeTracking();
    onPlay?.();
  };

  const handlePause = () => {
    setIsPlaying(false);
    if (timeIntervalRef.current) {
      clearInterval(timeIntervalRef.current);
      timeIntervalRef.current = null;
    }
  };

  const handleVideoEnd = () => {
    completeVideo();
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentTime = Math.floor(videoRef.current.currentTime);
      setCurrentTime(currentTime);

      // Update progress every 5 seconds
      if (currentTime % 5 === 0) {
        onTimeUpdate?.(currentTime);
      }

      if (currentTime >= video.duration) {
        completeVideo();
      }
    }
  };

  const handleIframeError = () => {
    console.error("Iframe failed to load, using fallback");
    setEmbedError(true);
  };

  // YouTube Player with proper embed URL
  const renderYouTubePlayer = () => {
    if (embedError) {
      return renderExternalFallback();
    }

    return (
      <div className="w-full h-96 rounded-2xl overflow-hidden bg-black relative">
        <iframe
          ref={iframeRef}
          src={video.embedUrl}
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={video.title}
          onLoad={handlePlay}
          onError={handleIframeError}
        />
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p>Loading YouTube player...</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Custom Video Player (MP4, WebM, etc.)
  const renderCustomVideoPlayer = () => (
    <div className="w-full h-96 rounded-2xl overflow-hidden bg-black relative">
      <video
        ref={videoRef}
        className="w-full h-full"
        controls
        autoPlay
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleVideoEnd}
        onTimeUpdate={handleTimeUpdate}
        poster={video.thumbnailUrl}
      >
        <source src={video.embedUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Custom play button overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <button
            onClick={handlePlay}
            className="bg-white/90 hover:bg-white text-gray-900 rounded-full p-4 transition-all duration-300 transform hover:scale-110"
          >
            <Play size={32} fill="currentColor" />
          </button>
        </div>
      )}
    </div>
  );

  // External Fallback when embedding fails
  const renderExternalFallback = () => (
    <div className="w-full h-96 rounded-2xl overflow-hidden bg-yellow-50 border-2 border-yellow-200 flex flex-col items-center justify-center p-8 text-center">
      <AlertCircle size={48} className="text-yellow-500 mb-4" />
      <h3 className="text-2xl font-bold text-gray-800 mb-4">{video.title}</h3>
      <p className="text-gray-600 mb-2">Direct embedding not available</p>
      <p className="text-sm text-gray-500 mb-6 max-w-md">
        Click below to watch this video on YouTube. Time tracking will continue
        automatically.
      </p>

      <button
        onClick={() => {
          window.open(video.videoUrl, "_blank");
          handlePlay();
        }}
        className="bg-gradient-to-r from-red-600 to-red-700 text-white px-8 py-4 rounded-2xl font-bold hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2"
      >
        <Play size={20} />
        <span>Watch on YouTube</span>
        <ExternalLink size={16} />
      </button>
    </div>
  );

  // External Platform Player (for non-embeddable platforms)
  const renderExternalPlatformPlayer = () => {
    const btnClass = config.btnClass || "from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700";
    const btnText = config.btnText || "Open Video";
    const platformName = video.platform.charAt(0).toUpperCase() + video.platform.slice(1);

    return (
      <div
        className={`w-full h-96 rounded-2xl overflow-hidden ${config.bgColor} border-2 ${config.borderColor} flex flex-col items-center justify-center p-8 text-center`}
      >
        <div className="text-4xl mb-4">{config.icon}</div>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">{video.title}</h3>
        <p className="text-gray-600 mb-2">Watch on {platformName}</p>
        <p className="text-sm text-gray-500 mb-6 max-w-md">
          To earn your reward, click the button below to watch the video on {platformName}.
          Keep this window open to track your progress automatically.
        </p>

        <button
          onClick={() => {
            window.open(video.videoUrl, "_blank");
            handlePlay();
          }}
          className={`bg-gradient-to-r ${btnClass} text-white px-8 py-4 rounded-2xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2`}
        >
          <Play size={20} />
          <span>{btnText}</span>
          <ExternalLink size={16} />
        </button>
      </div>
    );
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getProgressPercentage = () => {
    return (currentTime / video.duration) * 100;
  };

  const renderVideoPlayer = () => {
    if (video.platform === "youtube" && config.embeddable) {
      return renderYouTubePlayer();
    } else if (config.embeddable) {
      return renderCustomVideoPlayer();
    } else {
      return renderExternalPlatformPlayer();
    }
  };

  if (!isClient) {
    return (
      <div className="w-full h-96 rounded-2xl overflow-hidden bg-gray-200 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Platform Header */}
      <div className="absolute top-4 left-4 bg-black/75 text-white px-4 py-2 rounded-full flex items-center space-x-2 z-10">
        {config.icon}
        <span className="text-sm font-medium capitalize">{video.platform}</span>
      </div>

      {/* Video Player */}
      {renderVideoPlayer()}

      {/* Progress Tracking */}
      <div className="mt-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="flex justify-between text-sm text-gray-700 mb-2">
          <span>
            Progress: {formatTime(currentTime)} / {formatTime(video.duration)}
          </span>
          <span>{Math.round(getProgressPercentage())}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-green-500 h-3 rounded-full transition-all duration-300"
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>

        {isCompleted && (
          <div className="mt-3 p-3 bg-green-100 border border-green-300 rounded-lg">
            <div className="flex items-center text-green-700">
              <CheckCircle size={20} className="mr-2" />
              <span className="font-medium">
                Video Completed! Rs {video.rewardAmount} earned!
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-4 p-4 bg-blue-50 border border-blue-300 rounded-xl">
        <p className="text-blue-800 text-sm text-center">
          💡 <strong>Keep this window open</strong> while watching to receive
          your Rs {video.rewardAmount} reward
        </p>
      </div>
    </div>
  );
};

export default SmartVideoPlayer;
