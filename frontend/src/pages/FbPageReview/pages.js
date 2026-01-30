"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Upload, ExternalLink, CheckCircle, Camera, Image } from "lucide-react";
import Header from "@/components/Header/Header";
import api from "@/lib/api";
import { useAuth } from "@/Context/AuthContext";
import DuplicateWarningModal from "@/components/DuplicateWarningModal";
import ReviewTaskLinks from "@/components/ReviewLink/ReviewLink";

export default function FacebookReview() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [previousSubmissionDate, setPreviousSubmissionDate] = useState("");
  const [selectedLinkId, setSelectedLinkId] = useState(null);
  const [linkClickCounts, setLinkClickCounts] = useState({});

  // Mobile detection
  const isMobile = () => {
    return (
      typeof window !== "undefined" &&
      (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      ) ||
        window.innerWidth <= 768)
    );
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(selectedFile.type)) {
      setError("Only JPEG, JPG, and PNG images are allowed");
      return;
    }

    // Validate file size (5MB max)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    setFile(selectedFile);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleLinkClick = (linkId, clickCount) => {
    console.log(`Link ${linkId} clicked ${clickCount} times`);

    setLinkClickCounts((prev) => ({
      ...prev,
      [linkId]: clickCount,
    }));

    // Set as selected link for the first click
    if (clickCount === 1) {
      setSelectedLinkId(linkId);
      console.log(`Selected link: ${linkId}`);
    }

    // Provide feedback for mobile users
    if (isMobile() && navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !user) return;

    // Validate link clicks if a link is selected
    /*if (selectedLinkId && linkClickCounts[selectedLinkId] < 1) {
      setError(
        `You need to click the link at least 1 times before submitting (current: ${
          linkClickCounts[selectedLinkId] || 0
        })`
      );
      return;
    }*/

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("screenshot", file);
      formData.append("platform", "facebook");

      /* if (selectedLinkId) {
        formData.append("linkId", selectedLinkId);
      }*/

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }

      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://rithu-bl-web-site.vercel.app";
      console.log("Submitting to:", `${apiUrl}/api/fb-reviews`);
      console.log("Token exists:", !!token);
      const response = await fetch(`${apiUrl}/api/fb-reviews`, {
        method: "POST",
        body: formData,
        credentials: "include", // Important for cookies/auth
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      console.log("Response status:", response.status);

      if (!response.headers.get("content-type")?.includes("application/json")) {
        const text = await response.text();
        throw new Error(text || "Invalid server response");
      }

      if (!response.ok) {
        const errorData = await response.json();

        // Handle duplicate image case
        if (errorData.message.includes("too similar")) {
          const dateMatch = errorData.message.match(/\d{1,2}\/\d{1,2}\/\d{4}/);
          setPreviousSubmissionDate(dateMatch ? dateMatch[0] : "previously");
          setShowDuplicateModal(true);
          return;
        }

        if (response.status === 429) {
          setError(errorData.message || "Rate limit exceeded");
          return;
        }

        throw new Error(errorData.message || "Submission failed");
      }

      const result = await response.json();
      console.log("Success response:", result);

      // Mark link as submitted if we have one
      /* if (selectedLinkId) {
        try {
          await api.post(`/review-links/${selectedLinkId}/submit`);
          console.log("Link marked as submitted");
        } catch (submitError) {
          console.error("Failed to mark link as submitted:", submitError);
          // Don't fail the whole submission for this
        }
      }*/

      setIsSubmitted(true);
      //setSelectedLinkId(null);

      // Navigate to profile after success
      setTimeout(() => {
        router.push("/Profile/page");
      }, 2000);
    } catch (error) {
      console.error("Submission error:", error);
      if (!error.message.includes("too similar")) {
        setError(error.message || "Submission failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-md mx-auto p-6">
          <div className="bg-white p-8 rounded-xl shadow-sm text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Submission Successful!</h2>
            <p className="text-gray-600 mb-6">
              You've earned Rs 30.00! Your balance has been updated.
            </p>
            <button
              onClick={() => router.push("/Profile/page")}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Your Earnings
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header />
      <div className="max-w-4xl mx-auto p-4">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 rounded-t-2xl shadow-lg">
          {/* Content */}
          <div className="relative z-10 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start sm:space-x-6 space-y-4 sm:space-y-0">
              {/* Facebook Icon */}
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-300 rounded-2xl blur-sm opacity-60 animate-pulse"></div>
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300">
                  <img
                    src="/review.png"
                    alt="Facebook Icon"
                    className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
                  />
                </div>
              </div>

              {/* Title Section */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    Facebook Page Review
                  </h1>
                  <div className="mt-2 sm:mt-0 px-3 py-1 bg-green-500 text-white text-sm font-semibold rounded-full shadow-md animate-bounce w-max mx-auto sm:mx-0">
                    Rs 30.00
                  </div>
                </div>

                <p className="text-blue-100 text-base sm:text-lg font-medium">
                  Earn money by reviewing Facebook pages
                </p>

                <div className="flex flex-col sm:flex-row items-center sm:items-center justify-center sm:justify-start space-y-2 sm:space-y-0 sm:space-x-4 mt-3">
                  <div className="flex items-center space-x-2 text-blue-200">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm">Active Task</span>
                  </div>
                  <div className="flex items-center space-x-2 text-blue-200">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">Instant Payout</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-b-2xl shadow-xl border-t-0">
          {/* Instructions Section */}
          <div className="p-6">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  !
                </div>
                <span>Instructions</span>
              </h2>
              <div className="bg-gray-50 p-6 rounded-xl">
                <ol className="list-decimal list-inside space-y-3 text-gray-700">
                  <li className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      1
                    </span>
                    <span>Click on a Facebook page link below</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      2
                    </span>
                    <span>Review the page on Facebook</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      3
                    </span>
                    <span>Take a screenshot showing your review</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      4
                    </span>
                    <span>Upload the screenshot to earn Rs 30.00</span>
                  </li>
                </ol>
              </div>
            </div>

            {/* Facebook Pages Links */}
            {/*  <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                <ExternalLink className="w-5 h-5 text-blue-600" />
                <span>Facebook Pages to Review</span>
              </h3>

              {/* Custom TaskLinks component for FB Review 
              <ReviewTaskLinks
                platform="facebook"
                onLinkClick={handleLinkClick}
              />

              {selectedLinkId && linkClickCounts[selectedLinkId] && (
                <div className="mt-4 p-4 bg-blue-100 border border-blue-300 rounded-lg">
                  <div className="flex items-center justify-between">
                    <p className="text-blue-700 font-medium">
                      ✓ Link selected - Progress:{" "}
                      {linkClickCounts[selectedLinkId]}/1 click
                    </p>
                    {linkClickCounts[selectedLinkId] >= 1 && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  {linkClickCounts[selectedLinkId] >= 1 ? (
                    <p className="text-green-700 text-sm mt-1">
                      Ready to submit! Upload your screenshot below.
                    </p>
                  ) : (
                    <p className="text-blue-600 text-sm mt-1">
                      Click the link to complete
                    </p>
                  )}
                </div>
              )}
            </div>*/}

            {/* Upload Section */}
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
                <Upload className="w-6 h-6 text-blue-600" />
                <span>Upload Review Screenshot</span>
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Screenshot File
                  </label>

                  {preview ? (
                    <div className="border-2 border-dashed border-green-300 bg-green-50 rounded-xl p-6 text-center">
                      <img
                        src={preview}
                        alt="Screenshot preview"
                        className="max-h-64 mx-auto mb-4 rounded-lg shadow-md"
                      />
                      <div className="bg-white p-4 rounded-lg inline-block shadow-sm">
                        <p className="text-green-700 font-semibold mb-2">
                          {file.name}
                        </p>
                        <p className="text-sm text-gray-600 mb-3">
                          File size: {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setFile(null);
                            setPreview(null);
                          }}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        >
                          Remove file
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-300">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Upload className="w-8 h-8 text-blue-600" />
                        </div>
                        <p className="text-gray-600 mb-2 text-lg font-medium">
                          {isMobile()
                            ? "Select your screenshot from gallery"
                            : "Drag and drop your screenshot here or click to browse"}
                        </p>
                        <p className="text-sm text-gray-500 mb-6">
                          Supported formats: PNG, JPG, JPEG (max 5MB)
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                          <label className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl cursor-pointer hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold">
                            <Image className="w-5 h-5 inline mr-2" />
                            {isMobile() ? "Choose from Gallery" : "Choose File"}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600 font-medium">
                        {error}
                      </p>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!file || isSubmitting}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] ${
                    file
                      ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Upload className="w-5 h-5" />
                      <span>Submit Screenshot & Earn Rs 30.00</span>
                    </div>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Duplicate Warning Modal */}
        {showDuplicateModal && (
          <DuplicateWarningModal
            onClose={() => {
              setShowDuplicateModal(false);
              setFile(null);
              setPreview(null);
            }}
            previousDate={previousSubmissionDate}
          />
        )}
      </div>
    </div>
  );
}
