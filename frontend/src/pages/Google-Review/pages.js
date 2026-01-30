"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  ExternalLink,
  CheckCircle,
  Camera,
  Image,
  Star,
} from "lucide-react";
import Header from "@/components/Header/Header";
import api from "@/lib/api";
import { useAuth } from "@/Context/AuthContext";
import DuplicateWarningModal from "@/components/DuplicateWarningModal";

export default function GoogleReview() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [previousSubmissionDate, setPreviousSubmissionDate] = useState("");
  //const [selectedLinkId, setSelectedLinkId] = useState(null);
  //const [linkClickCounts, setLinkClickCounts] = useState({});

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
      formData.append("platform", "GoogleReview");

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
      console.log("Submitting to:", `${apiUrl}/api/googlereviews`);
      console.log("Token exists:", !!token);
      const response = await fetch(`${apiUrl}/api/googlereviews`, {
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
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
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
            <h2 className="text-2xl font-bold mb-2">
              Review Submitted Successfully!
            </h2>
            <p className="text-gray-600 mb-6">
              You've earned Rs 40.00! Your balance has been updated.
            </p>
            <button
              onClick={() => router.push("/Profile/page")}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              View Your Earnings
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      <Header />
      <div className="max-w-4xl mx-auto p-4">
        {/* Enhanced Header with Google branding */}
        <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-red-700 to-orange-600 rounded-t-2xl shadow-2xl">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full translate-x-20 translate-y-20"></div>
            <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-white rounded-full opacity-50"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start sm:space-x-6 space-y-4 sm:space-y-0">
              {/* Google Icon */}
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-orange-400 rounded-2xl blur-sm opacity-60 animate-pulse"></div>
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl flex items-center justify-center shadow-xl transform hover:scale-105 transition-all duration-300">
                  <svg
                    className="w-12 h-12 sm:w-16 sm:h-16"
                    viewBox="0 0 48 48"
                  >
                    <path
                      fill="#FFC107"
                      d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                    />
                    <path
                      fill="#FF3D00"
                      d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                    />
                    <path
                      fill="#4CAF50"
                      d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                    />
                    <path
                      fill="#1976D2"
                      d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                    />
                  </svg>
                </div>
              </div>

              {/* Title Section */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    Google Business Review
                  </h1>
                  <div className="mt-2 sm:mt-0 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-bold rounded-full shadow-lg animate-bounce w-max mx-auto sm:mx-0 flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-current" />
                    <span>Rs 40.00/=</span>
                  </div>
                </div>

                <p className="text-red-100 text-base sm:text-lg font-medium mb-3">
                  Share your experience and earn rewards
                </p>

                <div className="flex flex-col sm:flex-row items-center sm:items-center justify-center sm:justify-start space-y-2 sm:space-y-0 sm:space-x-6 mt-3">
                  <div className="flex items-center space-x-2 text-red-200">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Active Campaign</span>
                  </div>
                  <div className="flex items-center space-x-2 text-red-200">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Instant Reward</span>
                  </div>
                  <div className="flex items-center space-x-2 text-red-200">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-sm font-medium">
                      Verified Reviews
                    </span>
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
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-full flex items-center justify-center font-bold shadow-lg">
                  <Star className="w-4 h-4 fill-current" />
                </div>
                <span>How to Submit Your Google Review</span>
              </h2>
              <div className="bg-gradient-to-r from-gray-50 to-red-50 p-6 rounded-xl border border-red-100">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                        1
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          Visit Google Business
                        </h4>
                        <p className="text-sm text-gray-600">
                          Search for a local business on Google Maps or Google
                          Search
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                        2
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          Write Your Review
                        </h4>
                        <p className="text-sm text-gray-600">
                          Click on "Write a review" and share your honest
                          experience
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                        3
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          Capture Screenshot
                        </h4>
                        <p className="text-sm text-gray-600">
                          Take a screenshot showing your published review
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                        4
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          Upload & Earn
                        </h4>
                        <p className="text-sm text-gray-600">
                          Submit your screenshot below to receive Rs 30.00
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Google Business Links Section */}
            {/*  <div className="mb-8 bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-xl border border-red-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                <ExternalLink className="w-5 h-5 text-red-600" />
                <span>Google Business Locations to Review</span>
              </h3>

              {/* Custom TaskLinks component for Google Review 
              <ReviewTaskLinks
                platform="google"
                onLinkClick={handleLinkClick}
              />

              {selectedLinkId && linkClickCounts[selectedLinkId] && (
                <div className="mt-4 p-4 bg-red-100 border border-red-300 rounded-lg">
                  <div className="flex items-center justify-between">
                    <p className="text-red-700 font-medium">
                      ✓ Business selected - Progress:{" "}
                      {linkClickCounts[selectedLinkId]}/1 visit
                    </p>
                    {linkClickCounts[selectedLinkId] >= 1 && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  {linkClickCounts[selectedLinkId] >= 1 ? (
                    <p className="text-green-700 text-sm mt-1">
                      Ready to submit! Upload your review screenshot below.
                    </p>
                  ) : (
                    <p className="text-red-600 text-sm mt-1">
                      Visit the business page to continue
                    </p>
                  )}
                </div>
              )}
            </div>*/}

            {/* Upload Section */}
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
                <Upload className="w-6 h-6 text-red-600" />
                <span>Upload Your Review Screenshot</span>
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Screenshot of Your Google Review
                  </label>

                  {preview ? (
                    <div className="border-2 border-dashed border-green-300 bg-green-50 rounded-xl p-6 text-center">
                      <img
                        src={preview}
                        alt="Review screenshot preview"
                        className="max-h-64 mx-auto mb-4 rounded-lg shadow-lg border border-gray-200"
                      />
                      <div className="bg-white p-4 rounded-lg inline-block shadow-sm border border-gray-200">
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <p className="text-green-700 font-semibold">
                            {file.name}
                          </p>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          File size: {(file.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setFile(null);
                            setPreview(null);
                          }}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-sm"
                        >
                          Choose Different File
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-red-400 hover:bg-red-50 transition-all duration-300">
                        <div className="w-20 h-20 bg-gradient-to-r from-red-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Upload className="w-10 h-10 text-red-600" />
                        </div>
                        <h4 className="text-lg font-semibold text-gray-800 mb-2">
                          Upload Your Google Review Screenshot
                        </h4>
                        <p className="text-gray-600 mb-2 text-base">
                          {isMobile()
                            ? "Tap to select your screenshot from gallery"
                            : "Drag and drop your screenshot here or click to browse"}
                        </p>
                        <p className="text-sm text-gray-500 mb-6">
                          Supported formats: PNG, JPG, JPEG • Maximum size: 5MB
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                          <label className="inline-flex items-center bg-gradient-to-r from-red-600 to-orange-600 text-white px-8 py-3 rounded-xl cursor-pointer hover:from-red-700 hover:to-orange-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold">
                            <Image className="w-5 h-5 mr-2" />
                            {isMobile()
                              ? "Choose from Gallery"
                              : "Select Screenshot"}
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
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-xs font-bold">
                            !
                          </span>
                        </div>
                        <p className="text-sm text-red-600 font-medium">
                          {error}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!file || isSubmitting}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] ${
                    file
                      ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-3">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
                      <span>Submitting Your Review...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-3">
                      <Star className="w-5 h-5 fill-current" />
                      <span>Submit Review & Earn Rs 40.00</span>
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
