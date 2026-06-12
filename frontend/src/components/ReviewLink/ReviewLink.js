"use client";

import { useState, useEffect } from "react";
import {
  ExternalLink,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/Context/AuthContext";

export default function ReviewLink({ platform, onLinkClick }) {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchLinks();
    }
  }, [user, platform, retryCount]);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/api/review-links/${platform}`);

      if (response.data.success) {
        setLinks(response.data.data);
      } else {
        setError(response.data.message || "Failed to load links");
      }
    } catch (err) {
      console.error("Error fetching links:", err);
      setError(err.message || "Failed to load links. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLinkClick = async (link, e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      // Track the click
      const response = await api.post(`/api/review-links/${link._id}/click`);

      if (response.data.success) {
        // If the link is now completed, remove it from the list
        if (response.data.completed) {
          setLinks(links.filter((l) => l._id !== link._id));
        } else {
          // Update the link with new click count
          const updatedLinks = links.map((l) => {
            if (l._id === link._id) {
              return {
                ...l,
                userClickCount: response.data.clickCount,
                remainingClicks: response.data.remainingClicks,
              };
            }
            return l;
          });
          setLinks(updatedLinks);
        }

        // Mobile-friendly link opening
        const isMobile =
          /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
          ) || window.innerWidth <= 768;

        if (isMobile) {
          // For mobile devices, use direct navigation
          window.location.href = link.url;
        } else {
          // For desktop, open in new tab
          window.open(link.url, "_blank", "noopener,noreferrer");
        }

        // Notify parent component
        if (onLinkClick) {
          onLinkClick(link._id, response.data.clickCount);
        }
      }
    } catch (err) {
      console.error("Error tracking link click:", err);

      if (err.response?.data?.maxClicksReached) {
        // Remove the link from the list if max clicks reached
        const updatedLinks = links.filter((l) => l._id !== link._id);
        setLinks(updatedLinks);
        alert("This link has already been clicked.");
      } else {
        // Even if tracking fails, still open the link
        const isMobile =
          /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
          ) || window.innerWidth <= 768;

        if (isMobile) {
          window.location.href = link.url;
        } else {
          window.open(link.url, "_blank", "noopener,noreferrer");
        }
        alert(
          "There was an error tracking your click, but the link has been opened."
        );
      }
    }
  };

  const getClickStatus = (link) => {
    if (link.userClickCount >= link.maxClicks) {
      return "completed";
    } else if (link.userClickCount > 0) {
      return "in-progress";
    } else {
      return "not-started";
    }
  };

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-4 bg-gray-100 rounded-lg animate-pulse">
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-center mb-3">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <h3 className="text-red-800 font-medium">Failed to load links</h3>
        </div>
        <p className="text-red-700 text-sm mb-4">{error}</p>
        <button
          onClick={handleRetry}
          className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          Try Again
        </button>
      </div>
    );
  }

  if (links.length === 0) {
    return (
      <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg text-center">
        <p className="text-blue-700 font-medium">
          You've completed all available tasks for this platform!
        </p>
        <p className="text-blue-600 text-sm mt-1">
          Check back later for new tasks.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {links.map((link) => {
        const status = getClickStatus(link);
        const isCompleted = status === "completed";

        return (
          <div
            key={link._id}
            onClick={isCompleted ? null : (e) => handleLinkClick(link, e)}
            className={`flex items-center justify-between p-4 rounded-lg transition-colors duration-200 border ${
              isCompleted
                ? "bg-green-50 border-green-200 cursor-not-allowed"
                : "bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer"
            } group`}
            style={{
              minHeight: "44px",
              touchAction: "manipulation",
            }}
          >
            <div className="flex-1">
              <span
                className={`${
                  isCompleted
                    ? "text-green-700 line-through"
                    : "text-gray-700 group-hover:text-blue-700"
                }`}
              >
                {link.title}
              </span>

              {isCompleted && (
                <div className="mt-2 flex items-center text-sm text-green-600">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  <span>Completed (1/1 click)</span>
                </div>
              )}
            </div>

            {!isCompleted ? (
              <ExternalLink className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform flex-shrink-0 ml-2" />
            ) : (
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 ml-2" />
            )}
          </div>
        );
      })}
    </div>
  );
}
