"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/Context/AuthContext";
import { useSocket } from "@/Context/SocketContext";
import api from "@/lib/api";
import {
  Play,
  Clock,
  DollarSign,
  CheckCircle,
  X,
  AlertCircle,
  History,
  Video,
  Sparkles,
  TrendingUp,
  Award,
  Eye,
} from "lucide-react";
import Header from "@/components/Header/Header";
import SmartVideoPlayer from "@/components/Videos/SmartVideoPlayer";

export default function VideoRewards() {
  const [videos, setVideos] = useState([]);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [watchHistory, setWatchHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState("available");
  const [imageErrors, setImageErrors] = useState({});
  const [trackingSession, setTrackingSession] = useState(null);
  const [secondsWatched, setSecondsWatched] = useState(0);

  const trackingTimerRef = useRef(null);
  const { user } = useAuth();
  const socket = useSocket();

  useEffect(() => {
    fetchAvailableVideos();
    fetchWatchHistory();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("videoCompleted", handleVideoCompleted);
      return () => {
        socket.off("videoCompleted", handleVideoCompleted);
      };
    }
  }, [socket]);

  useEffect(() => {
    return () => {
      if (trackingTimerRef.current) {
        clearInterval(trackingTimerRef.current);
      }
    };
  }, []);

  const fetchAvailableVideos = async () => {
    try {
      const response = await api.get("/api/videos/available");
      setVideos(response.data.data || []);
    } catch (error) {
      console.error("Fetch videos error:", error);
      setError("Failed to load videos");
    }
  };

  const fetchWatchHistory = async () => {
    try {
      const response = await api.get("/api/videos/history");
      setWatchHistory(response.data.data || []);
    } catch (error) {
      console.error("Fetch history error:", error);
    }
  };

  const startVideoSession = async (video) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await api.post(`/api/videos/${video._id}/start`);
      const session = response.data.data;

      setCurrentVideo(video);
      setTrackingSession(session);
      setSecondsWatched(0);

      // Start tracking immediately
      startTimeTracking(session.sessionId, video.duration);
    } catch (error) {
      console.error("Start session error:", error);
      setError(
        error.response?.data?.message || "Failed to start video session"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const startTimeTracking = (sessionId, duration) => {
    let localSeconds = 0;

    trackingTimerRef.current = setInterval(async () => {
      localSeconds += 1;
      setSecondsWatched(localSeconds);

      try {
        // Update progress every 5 seconds
        if (localSeconds % 5 === 0 || localSeconds >= duration) {
          await api.put(`/api/videos/session/${sessionId}/progress`, {
            currentTime: localSeconds,
          });
        }

        // Check if video completed locally
        if (localSeconds >= duration) {
          console.log("Video completed locally, sending final update");
          await api.put(`/api/videos/session/${sessionId}/progress`, {
            currentTime: duration,
          });
          completeTracking(sessionId, false);
        }
      } catch (error) {
        console.error("Progress update error:", error);
        if (error.message?.includes("already completed")) {
          completeTracking(sessionId, true);
        }
      }
    }, 1000);
  };

  const completeTracking = (sessionId, immediate = false) => {
    if (trackingTimerRef.current) {
      clearInterval(trackingTimerRef.current);
      trackingTimerRef.current = null;
    }

    if (!immediate) {
      setTimeout(() => {
        setTrackingSession(null);
        setCurrentVideo(null);
        setSecondsWatched(0);
        fetchAvailableVideos();
        fetchWatchHistory();
      }, 2000);
    } else {
      setTrackingSession(null);
      setCurrentVideo(null);
      setSecondsWatched(0);
      fetchAvailableVideos();
      fetchWatchHistory();
    }
  };

  const handleVideoCompleted = (data) => {
    setSuccess(
      `Congratulations! You earned Rs ${data.amount} for watching "${data.videoTitle}"!`
    );

    fetchAvailableVideos();
    fetchWatchHistory();

    setTimeout(() => setSuccess(null), 8000);
  };

  const stopTracking = () => {
    if (trackingTimerRef.current) {
      clearInterval(trackingTimerRef.current);
      trackingTimerRef.current = null;
    }
    setTrackingSession(null);
    setCurrentVideo(null);
    setSecondsWatched(0);
  };

  const closeVideo = () => {
    stopTracking();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getProgressPercentage = () => {
    if (!currentVideo) return 0;
    return (secondsWatched / currentVideo.duration) * 100;
  };

  const handleImageError = (videoId) => {
    setImageErrors((prev) => ({
      ...prev,
      [videoId]: true,
    }));
  };

  const getThumbnailUrl = (video) => {
    if (imageErrors[video._id]) {
      return null;
    }
    return video.thumbnailUrl;
  };

  const getWatchCount = (videoId) => {
    return watchHistory.filter(
      (session) =>
        session.video?._id === videoId && session.status === "completed"
    ).length;
  };

  const totalEarned = watchHistory
    .filter((session) => session.status === "completed")
    .reduce((total, session) => total + (session.amountEarned || 0), 0);

  // Get platform icon
  const getPlatformIcon = (platform) => {
    switch (platform) {
      case "youtube":
        return <span className="text-red-600">📺</span>;
      case "facebook":
        return <span className="text-blue-600">📘</span>;
      case "instagram":
        return <span className="text-pink-600">📷</span>;
      case "tiktok":
        return <span className="text-black">🎵</span>;
      default:
        return <span className="text-gray-600">📱</span>;
    }
  };

  // Check if video can be embedded
  const canEmbedVideo = (video) => {
    return video.platform === "youtube" && video.embedUrl;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 relative overflow-hidden">
      <Header />

      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div
          className="absolute top-40 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Smart Video Rewards
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Watch videos from all platforms! YouTube plays embedded, other
            platforms open in new tabs with automatic time tracking.
          </p>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-purple-100">
              <div className="text-3xl font-bold text-gray-900">
                Rs {totalEarned}
              </div>
              <div className="text-sm text-gray-600">Total Earned</div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-purple-100">
              <div className="text-3xl font-bold text-gray-900">
                {watchHistory.filter((s) => s.status === "completed").length}
              </div>
              <div className="text-sm text-gray-600">Videos Watched</div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-purple-100">
              <div className="text-3xl font-bold text-gray-900">
                {videos.length}
              </div>
              <div className="text-sm text-gray-600">Available Videos</div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            <div className="flex items-center">
              <AlertCircle size={20} className="mr-2" />
              <span>{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700">
            <div className="flex items-center">
              <CheckCircle size={20} className="mr-2" />
              <span>{success}</span>
            </div>
          </div>
        )}

        {/* Video Player Modal */}
        {currentVideo && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold">{currentVideo.title}</h3>
                  <p className="text-purple-100">
                    Earn Rs {currentVideo.rewardAmount} by watching
                  </p>
                </div>
                <button
                  onClick={closeVideo}
                  className="p-2 hover:bg-white/20 rounded-xl"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Video Content */}
              <div className="p-6">
                <SmartVideoPlayer video={currentVideo} onClose={closeVideo} />

                {/* Progress Tracking */}
                <div className="mt-6 p-4 bg-gray-50 rounded-xl border">
                  <div className="flex justify-between text-sm text-gray-700 mb-2">
                    <span>
                      Progress: {formatTime(secondsWatched)} /{" "}
                      {formatTime(currentVideo.duration)}
                    </span>
                    <span>{Math.round(getProgressPercentage())}% Complete</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getProgressPercentage()}%` }}
                    ></div>
                  </div>

                  {secondsWatched >= currentVideo.duration && (
                    <div className="mt-3 p-3 bg-green-100 border border-green-300 rounded-lg">
                      <div className="flex items-center text-green-700">
                        <CheckCircle size={20} className="mr-2" />
                        <span className="font-medium">
                          Video Completed! Rs {currentVideo.rewardAmount}{" "}
                          earned!
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rest of your component remains the same for tabs and video display */}
        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-2xl p-1 shadow-lg border">
            <button
              onClick={() => setActiveTab("available")}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === "available"
                  ? "bg-purple-600 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Available Videos
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                activeTab === "history"
                  ? "bg-purple-600 text-white shadow-md"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Watch History
            </button>
          </div>
        </div>

        {/* Available Videos Grid */}
        {activeTab === "available" && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock size={32} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No Videos Available
                </h3>
                <p className="text-gray-500">
                  Check back later for new videos to watch and earn money.
                </p>
              </div>
            ) : (
              videos.map((video) => {
                const watchCount = getWatchCount(video._id);
                if (watchCount >= 20) return null;

                return (
                  <div
                    key={video._id}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="relative h-48 bg-gray-100">
                      {getThumbnailUrl(video) ? (
                        <img
                          src={getThumbnailUrl(video)}
                          alt={video.title}
                          className="w-full h-full object-cover"
                          onError={() => handleImageError(video._id)}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100">
                          <Video size={32} className="text-gray-400" />
                        </div>
                      )}

                      <div className="absolute top-3 right-3 bg-black/75 text-white px-2 py-1 rounded-full text-xs">
                        {formatTime(video.duration)}
                      </div>
                      <div className="absolute top-3 left-3 bg-white/90 text-gray-800 px-2 py-1 rounded-full text-xs font-medium flex items-center">
                        {getPlatformIcon(video.platform)}
                        <span className="ml-1 capitalize text-xs">
                          {video.platform}
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3 bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">
                        Rs {video.rewardAmount}
                      </div>
                      <div className="absolute bottom-3 right-3 bg-purple-600 text-white px-2 py-1 rounded-full text-xs font-medium animate-pulse">
                        {watchCount}/20 Views
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">
                        {video.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {video.description}
                      </p>

                      <button
                        onClick={() => startVideoSession(video)}
                        disabled={isLoading || currentVideo}
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                            Starting...
                          </>
                        ) : (
                          <>
                            <Play size={16} className="mr-2" />
                            Watch & Earn
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Watch History */}
        {activeTab === "history" && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                <History className="mr-3" size={24} />
                Your Watch History
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {watchHistory.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-gray-500">No watch history yet.</p>
                </div>
              ) : (
                watchHistory.map((session) => (
                  <div key={session._id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {session.video?.title}
                        </h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                          <span>
                            Watched: {formatTime(session.watchDuration)}
                          </span>
                          {session.amountEarned > 0 && (
                            <span className="text-green-600 font-medium">
                              Earned: Rs {session.amountEarned}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-500">
                        {new Date(session.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
