"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  ExternalLink,
  CheckCircle,
  Clock,
  Camera,
  Image,
  X,
  AlertCircle,
} from "lucide-react";
import Header from "@/components/Header/Header";
import api from "@/lib/api";
import { useAuth } from "@/Context/AuthContext";
import DuplicateWarningModal from "@/components/DuplicateWarningModal";
import TaskLinks from "@/components/TaskLinks/TaskLinks";
import Link from "next/link";
import { MdRateReview } from "react-icons/md";
import SubmissionSummaryModal from "@/components/SubmissionSummaryModal";

export default function FbVerificationTask() {
  const [files, setFiles] = useState([]); // Changed from single file to array
  const [previews, setPreviews] = useState([]); // Changed from single preview to array
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [previousSubmissionDate, setPreviousSubmissionDate] = useState("");
  const [selectedLinkId, setSelectedLinkId] = useState(null);
  const [linkClickCounts, setLinkClickCounts] = useState({});
  const [submissionSummary, setSubmissionSummary] = useState(null);

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
    const selectedFiles = Array.from(e.target.files);

    // Reset error
    setError(null);

    // Validate number of files
    if (selectedFiles.length > 5) {
      setError("You can only upload up to 5 screenshots at once");
      return;
    }

    // Validate each file
    const validFiles = [];
    const errors = [];

    selectedFiles.forEach((file, index) => {
      // Validate file type
      const validTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!validTypes.includes(file.type)) {
        errors.push(
          `File ${index + 1}: Only JPEG, JPG, and PNG images are allowed`,
        );
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        errors.push(`File ${index + 1}: Image size must be less than 5MB`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      setError(errors.join(", "));
      return;
    }

    // Combine with existing files if any
    const allFiles = [...files, ...validFiles];
    if (allFiles.length > 5) {
      setError("Maximum 5 screenshots allowed. Remove some files first.");
      return;
    }

    setFiles(allFiles);

    // Create previews for new files
    const newPreviewsPromises = validFiles.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({
            id: Date.now() + Math.random(),
            name: file.name,
            url: reader.result,
            size: file.size,
            file: file,
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(newPreviewsPromises).then((newPreviews) => {
      setPreviews((prev) => [...prev, ...newPreviews]);
    });
  };

  const removeFile = (index) => {
    const newFiles = [...files];
    const newPreviews = [...previews];

    newFiles.splice(index, 1);
    newPreviews.splice(index, 1);

    setFiles(newFiles);
    setPreviews(newPreviews);
  };

  const clearAllFiles = () => {
    setFiles([]);
    setPreviews([]);
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

    // Validate files
    if (!files.length || !user) {
      setError(
        files.length === 0
          ? "Please select at least one screenshot"
          : "User not authenticated",
      );
      return;
    }

    // Validate link clicks if a link is selected
    if (selectedLinkId && linkClickCounts[selectedLinkId] < 2) {
      setError(
        `You need to click the link at least 2 times before submitting (current: ${linkClickCounts[selectedLinkId] || 0})`,
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();

      // Append all files
      files.forEach((file) => {
        formData.append("screenshots", file); // Use same field name for all files
      });

      formData.append("platform", "facebook");
      formData.append("count", files.length.toString());

      if (selectedLinkId) {
        formData.append("linkId", selectedLinkId);
      }

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }

      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://rithu-bl-web-site.vercel.app";
      console.log("Submitting to:", `${apiUrl}/api/submissions/multiple`);
      console.log("Number of files:", files.length);

      const response = await fetch(`${apiUrl}/api/submissions/multiple`, {
        method: "POST",
        body: formData,
        credentials: "include", // Important for cookies/auth
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          // Don't set Content-Type - let browser set it for FormData
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
        if (errorData.message?.includes("too similar")) {
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
      if (selectedLinkId) {
        try {
          await api.post(`/links/${selectedLinkId}/submit`);
          console.log("Link marked as submitted");
        } catch (submitError) {
          console.error("Failed to mark link as submitted:", submitError);
          // Don't fail the whole submission for this
        }
      }

      setIsSubmitted(true);

      // Set submission summary if available
      if (result.data) {
        setSubmissionSummary({
          successful: result.data.successful || 0,
          duplicates: result.data.duplicates || 0,
          failed: result.data.failed || 0,
          totalEarned: result.data.totalEarned || 0,
          details: result.data.details,
        });
      }

      // Navigate to profile after success
      setTimeout(() => {
        router.push("/facebook-verification/page");
      }, 3000);
    } catch (error) {
      console.error("Submission error:", error);
      if (!error.message?.includes("too similar")) {
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

  if (isSubmitted && submissionSummary) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <SubmissionSummaryModal
          summary={submissionSummary}
          onClose={() => {
            setSubmissionSummary(null);
            router.push("/facebook-verification/page");
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header />
      <div className="max-w-4xl mx-auto p-4">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 rounded-t-2xl shadow-lg">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-y-6 origin-top-left"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full transform translate-x-16 -translate-y-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full transform -translate-x-12 translate-y-12"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start sm:space-x-6 space-y-4 sm:space-y-0">
              {/* Facebook Icon */}
              <div className="relative flex-shrink-0">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-300 rounded-2xl blur-sm opacity-60 animate-pulse"></div>
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300">
                  <img
                    src="/facebook.png"
                    alt="Facebook Icon"
                    className="w-12 h-12 sm:w-16 sm:h-16 object-contain"
                  />
                </div>
              </div>

              {/* Title Section */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                    Facebook Verification
                  </h1>
                  <div className="mt-2 sm:mt-0 px-3 py-1 bg-green-500 text-white text-sm font-semibold rounded-full shadow-md animate-bounce w-max mx-auto sm:mx-0">
                    Rs 1.00 per screenshot
                  </div>
                </div>

                <p className="text-blue-100 text-base sm:text-lg font-medium">
                  Upload up to 5 screenshots at once
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
                  <div className="flex items-center space-x-2 text-blue-200">
                    <Upload className="w-4 h-4" />
                    <span className="text-sm">Multiple Uploads</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Wave */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg
              className="w-full h-4 text-white"
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
            >
              <path
                d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
                opacity=".25"
                fill="currentColor"
              ></path>
              <path
                d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
                opacity=".5"
                fill="currentColor"
              ></path>
              <path
                d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
                fill="currentColor"
              ></path>
            </svg>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-b-2xl shadow-xl border-t-0">
          {/* Instructions Section */}
          <div className="p-6">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  <MdRateReview />
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
                    <span>Like or follow the page on Facebook</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      3
                    </span>
                    <span>
                      Click the link 20 times to track your engagement
                    </span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      4
                    </span>
                    <span>
                      Take up to 20 different screenshots showing your
                      likes/follows
                    </span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      20
                    </span>
                    <span>
                      Upload all screenshots at once to earn Rs 1.00 each
                    </span>
                  </li>
                </ol>

                {/* Multiple Upload Info */}
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        !
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-blue-800 font-medium">
                        Multiple Upload Feature
                      </p>
                      <p className="text-blue-700 text-sm mt-1">
                        • Upload 1-5 screenshots at once
                        <br />
                        • Earn Rs 1.00 for each unique screenshot
                        <br />
                        • Duplicate screenshots are automatically filtered out
                        <br />• Save time by processing multiple submissions
                        together
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold"></div>

              <span>Facebook pages Review Section</span>
            </h2>

            {/* Facebook Pages Links */}
            <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                <ExternalLink className="w-5 h-5 text-blue-600" />
                <span>Facebook Pages to Follow or Like and Share Posts</span>
              </h3>

              <TaskLinks platform="facebook" onLinkClick={handleLinkClick} />

              {selectedLinkId && linkClickCounts[selectedLinkId] && (
                <div className="mt-4 p-4 bg-blue-100 border border-blue-300 rounded-lg">
                  <div className="flex items-center justify-between">
                    <p className="text-blue-700 font-medium">
                      ✓ Link selected - Progress:{" "}
                      {linkClickCounts[selectedLinkId]}/20 clicks
                    </p>
                    {linkClickCounts[selectedLinkId] >= 20 && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  {linkClickCounts[selectedLinkId] >= 2 ? (
                    <p className="text-green-700 text-sm mt-1">
                      Ready to submit! Upload your screenshots below.
                    </p>
                  ) : (
                    <p className="text-blue-600 text-sm mt-1">
                      Click {20 - linkClickCounts[selectedLinkId]} more times to
                      complete
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Screenshot Requirements */}
            <div className="mb-8 bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-200">
              <h3 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center space-x-2">
                <div className="w-6 h-6 bg-yellow-600 text-white rounded-full flex items-center justify-center text-sm">
                  !
                </div>
                <span>Screenshot Requirements</span>
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-yellow-800">
                    Must clearly show the liked/followed page
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-yellow-800">
                    Each screenshot should be different
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-yellow-800">
                    No edited or cropped images
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-yellow-800">
                    File size under 5MB each
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile-specific instructions */}
            {isMobile() && (
              <div className="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                <h3 className="text-lg font-semibold text-purple-800 mb-4 flex items-center space-x-2">
                  <span className="text-xl">📱</span>
                  <span>Mobile Instructions</span>
                </h3>
                <div className="space-y-3 text-purple-700">
                  <p className="flex items-start space-x-2">
                    <span className="text-purple-600 font-bold">•</span>
                    <span>
                      Links will open in new tabs or redirect you to Facebook
                    </span>
                  </p>
                  <p className="flex items-start space-x-2">
                    <span className="text-purple-600 font-bold">•</span>
                    <span>
                      Use your browser's back button to return here after liking
                    </span>
                  </p>
                  <p className="flex items-start space-x-2">
                    <span className="text-purple-600 font-bold">•</span>
                    <span>
                      Take screenshots using your device's screenshot function
                      (usually Power + Volume Down)
                    </span>
                  </p>
                  <p className="flex items-start space-x-2">
                    <span className="text-purple-600 font-bold">•</span>
                    <span>Select multiple screenshots from your gallery</span>
                  </p>
                </div>
              </div>
            )}

            {/* Upload Section */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
                  <Upload className="w-6 h-6 text-blue-600" />
                  <span>Upload Screenshots ({files.length}/5)</span>
                </h3>
                {files.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAllFiles}
                    className="px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  {previews.length > 0 ? (
                    <div className="border-2 border-dashed border-green-300 bg-green-50 rounded-xl p-4">
                      {/* File counter */}
                      <div className="mb-4 text-center">
                        <div className="inline-flex items-center bg-white px-4 py-2 rounded-full shadow-sm">
                          <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-2">
                            {files.length}
                          </div>
                          <span className="text-gray-700 font-medium">
                            Screenshots selected
                          </span>
                          <div className="ml-4 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                            Rs {files.length}.00
                          </div>
                        </div>
                      </div>

                      {/* Preview grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        {previews.map((preview, index) => (
                          <div
                            key={preview.id}
                            className="relative bg-white rounded-lg p-3 shadow-sm border border-gray-200"
                          >
                            <div className="absolute -top-2 -right-2">
                              <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>

                            <div className="mb-2 text-center">
                              <div className="w-6 h-6 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center text-xs font-bold mx-auto">
                                {index + 1}
                              </div>
                            </div>

                            <img
                              src={preview.url}
                              alt={`Screenshot preview ${index + 1}`}
                              className="w-full h-40 object-contain rounded mb-2"
                            />
                            <div className="text-xs text-gray-600 truncate mb-1">
                              {preview.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {(preview.size / (1024 * 1024)).toFixed(2)} MB
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Add more files button */}
                      {files.length < 5 && (
                        <div className="text-center">
                          <label className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors cursor-pointer">
                            <Upload className="w-4 h-4 mr-2" />
                            Add More Files ({5 - files.length} remaining)
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="hidden"
                              multiple
                            />
                          </label>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-300">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Upload className="w-8 h-8 text-blue-600" />
                      </div>
                      <p className="text-gray-600 mb-2 text-lg font-medium">
                        {isMobile()
                          ? "Select up to 5 screenshots from gallery"
                          : "Drag and drop up to 5 screenshots or click to browse"}
                      </p>
                      <p className="text-sm text-gray-500 mb-6">
                        Supported formats: PNG, JPG, JPEG (max 5MB each)
                      </p>

                      {/* File selection buttons */}
                      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                        <label className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl cursor-pointer hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold">
                          <Image className="w-5 h-5 inline mr-2" />
                          {isMobile() ? "Choose from Gallery" : "Choose Files"}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                            multiple
                          />
                        </label>
                      </div>

                      {/* Mobile help text */}
                      {isMobile() && (
                        <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                          <p className="text-xs text-gray-600">
                            <strong>Tip:</strong> You can select multiple
                            screenshots at once from your gallery.
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600 font-medium">
                        {error}
                      </p>
                    </div>
                  )}

                  {/* Earnings calculation */}
                  {files.length > 0 && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-800 font-medium">
                            Potential Earnings:
                          </p>
                          <p className="text-green-700 text-sm">
                            {files.length} screenshots × Rs 1.00 = Rs{" "}
                            {files.length}.00
                          </p>
                        </div>
                        <div className="text-lg font-bold text-green-700">
                          Rs {files.length}.00
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Submission validation messages */}
                {selectedLinkId &&
                  linkClickCounts[selectedLinkId] &&
                  linkClickCounts[selectedLinkId] < 2 && (
                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-yellow-800 font-medium">
                        ⚠️ Please complete{" "}
                        {20 - linkClickCounts[selectedLinkId]} more clicks on
                        your selected link before submitting.
                      </p>
                    </div>
                  )}

                <button
                  type="submit"
                  disabled={
                    !files.length ||
                    isSubmitting ||
                    (selectedLinkId && linkClickCounts[selectedLinkId] < 20)
                  }
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] ${
                    files.length > 0 &&
                    (!selectedLinkId || linkClickCounts[selectedLinkId] >= 20)
                      ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      <span>Processing {files.length} screenshots...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Upload className="w-5 h-5" />
                      <span>
                        Submit {files.length}{" "}
                        {files.length === 1 ? "Screenshot" : "Screenshots"} &
                        Earn Rs {files.length}.00
                      </span>
                    </div>
                  )}
                </button>

                {/* Mobile-specific submission note */}
                {isMobile() && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-700 text-sm">
                      📱 <strong>Mobile Tip:</strong> After submitting, you'll
                      see a summary of what was processed and then be redirected
                      to your profile page.
                    </p>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

        {/* Duplicate Warning Modal */}
        {showDuplicateModal && (
          <DuplicateWarningModal
            onClose={() => {
              setShowDuplicateModal(false);
              clearAllFiles();
            }}
            previousDate={previousSubmissionDate}
          />
        )}
      </div>

      {/* Add mobile-specific styles */}
      <style jsx>{`
        @media (max-width: 768px) {
          .task-link:active {
            transform: scale(0.98);
            background-color: rgba(59, 130, 246, 0.2);
          }

          .task-link {
            -webkit-tap-highlight-color: rgba(59, 130, 246, 0.1);
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            user-select: none;
            min-height: 44px;
            touch-action: manipulation;
          }

          /* Ensure file inputs work properly on mobile */
          input[type="file"] {
            -webkit-appearance: none;
            appearance: none;
          }

          /* Better button styling for mobile */
          button,
          label {
            min-height: 44px;
            touch-action: manipulation;
          }
        }

        /* Hide file input styling across all devices */
        input[type="file"] {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }
      `}</style>
    </div>
  );
}
