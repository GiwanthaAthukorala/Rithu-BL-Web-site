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
} from "lucide-react";
import Header from "@/components/Header/Header";
import api from "@/lib/api";
import { useAuth } from "@/Context/AuthContext";
import DuplicateWarningModal from "@/components/DuplicateWarningModal";
import TaskLinks from "@/components/TaskLinks/TaskLinks";
import Link from "next/link";
import { MdRateReview } from "react-icons/md";

export default function FbVerificationTask() {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [previousSubmissionDate, setPreviousSubmissionDate] = useState("");
  const [selectedLinkId, setSelectedLinkId] = useState(null);
  const [linkClickCounts, setLinkClickCounts] = useState({});

  // Maximum number of files allowed
  const MAX_FILES = 10;

  // Mobile detection
  const isMobile = () => {
    return (
      typeof window !== "undefined" &&
      (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) ||
        window.innerWidth <= 768)
    );
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);

    if (!selectedFiles.length) return;

    // Validate each file
    const validFiles = [];
    const errors = [];

    selectedFiles.forEach((file) => {
      // Validate file type
      const validTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!validTypes.includes(file.type)) {
        errors.push(`${file.name}: Only JPEG, JPG, and PNG images are allowed`);
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        errors.push(`${file.name}: Image size must be less than 5MB`);
        return;
      }

      validFiles.push(file);
    });

    // Check total file count
    const totalFiles = files.length + validFiles.length;
    if (totalFiles > MAX_FILES) {
      setError(
        `Maximum ${MAX_FILES} files allowed. You have ${files.length} files and trying to add ${validFiles.length} more.`
      );
      return;
    }

    if (errors.length > 0) {
      setError(errors.join(", "));
      return;
    }

    setError(null);

    // Create previews for valid files
    const newFiles = [...files, ...validFiles];
    setFiles(newFiles);

    // Generate previews for new files
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => [
          ...prev,
          {
            url: reader.result,
            name: file.name,
            size: file.size,
            id: Date.now() + Math.random(), // Unique ID for each preview
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (indexToRemove) => {
    const newFiles = files.filter((_, index) => index !== indexToRemove);
    const newPreviews = previews.filter((_, index) => index !== indexToRemove);
    setFiles(newFiles);
    setPreviews(newPreviews);
  };

  const removeAllFiles = () => {
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
    if (!files.length || !user) {
      setError("Please select at least one screenshot to upload");
      return;
    }

    // Validate link clicks if a link is selected
    /*if (selectedLinkId && linkClickCounts[selectedLinkId] < 2) {
      setError(
        `You need to click the link at least 2 times before submitting (current: ${
          linkClickCounts[selectedLinkId] || 0
        })`
      );
      return;
    }*/

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();

      // Append all files
      files.forEach((file, index) => {
        formData.append("screenshots", file); // Note: plural name for multiple files
      });

      formData.append("platform", "facebook");
      formData.append("fileCount", files.length);

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }

      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://rithu-bl-web-side.vercel.app";
      console.log(
        `Submitting ${files.length} files to:`,
        `${apiUrl}/api/submissions`
      );
      console.log("Token exists:", !!token);

      const response = await fetch(`${apiUrl}/api/submissions`, {
        method: "POST",
        body: formData,
        credentials: "include",
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

      setIsSubmitted(true);

      // Calculate earnings (assuming Rs 1.00 per file)
      const totalEarnings = files.length * 1.0;

      // Navigate to profile after success
      setTimeout(() => {
        router.push("/Profile/page");
      }, 2000);
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
              You've earned Rs {files.length}.00! Your balance has been updated.
            </p>
            <button
              onClick={() => router.push("/facebook-verification/page")}
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
                    Rs {files.length || 0}.00
                  </div>
                </div>

                <p className="text-blue-100 text-base sm:text-lg font-medium">
                  Earn money by engaging with Facebook pages
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
                    <span>Click the link 2 times to track your engagement</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      4
                    </span>
                    <span>
                      Take screenshots showing your like/follow (multiple
                      screenshots allowed)
                    </span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      5
                    </span>
                    <span>
                      Upload all screenshots to earn Rs {files.length || 0}.00
                      (Rs 1.00 per screenshot)
                    </span>
                  </li>
                </ol>
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold"></div>

              <span>Facebook pages Review Section</span>
            </h2>
            {/** Facebook pages Review and Comment Section */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto mb-12">
              <Link href="/FbPageReview/pages">
                <div className="cursor-pointer bg-white shadow-md rounded-lg p-6 border-0 hover:shadow-lg transition">
                  <div className="flex items-center mb-4">
                    <div className="w-16 h-16 flex items-center justify-center mr-3 overflow-hidden">
                      <img
                        src="/review.png"
                        alt="youtube Icon"
                        className="w-16 h-16 object-contain"
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Facebook Page Review Section
                    </h3>
                  </div>
                  <p className="text-[#000000] font-bold mb-4 text-[18px]">
                    Page Review
                  </p>
                  <div className="text-sm text-[#000000] font-medium">
                    Rs 30/= • Page Review
                  </div>
                </div>
              </Link>
            </div>

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
                      {linkClickCounts[selectedLinkId]}/10 clicks
                    </p>
                    {linkClickCounts[selectedLinkId] >= 10 && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  {linkClickCounts[selectedLinkId] >= 10 ? (
                    <p className="text-green-700 text-sm mt-1">
                      Ready to submit! Upload your screenshots below.
                    </p>
                  ) : (
                    <p className="text-blue-600 text-sm mt-1">
                      Click {10 - linkClickCounts[selectedLinkId]} more times to
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
                    Must show your profile or browser context
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
              <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
                <p className="text-yellow-800 text-sm font-medium">
                  📸 <strong>Multiple Uploads:</strong> You can upload up to{" "}
                  {MAX_FILES} screenshots at once. Each screenshot earns Rs
                  1.00. Total earnings: Rs {files.length || 0}.00
                </p>
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
                      Take multiple screenshots using your device's screenshot
                      function (usually Power + Volume Down)
                    </span>
                  </p>
                  <p className="flex items-start space-x-2">
                    <span className="text-purple-600 font-bold">•</span>
                    <span>
                      Select multiple screenshots from your gallery by holding
                      and selecting
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* Upload Section */}
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
                <Upload className="w-6 h-6 text-blue-600" />
                <span>
                  Upload Screenshots ({files.length}/{MAX_FILES})
                </span>
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Screenshot Files
                  </label>

                  {previews.length > 0 ? (
                    <div className="border-2 border-dashed border-green-300 bg-green-50 rounded-xl p-6">
                      {/* Preview Grid */}
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-green-800 mb-3">
                          Selected Screenshots ({previews.length}):
                        </h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {previews.map((preview, index) => (
                            <div key={preview.id} className="relative group">
                              <div className="relative rounded-lg overflow-hidden border border-gray-300 bg-white">
                                <img
                                  src={preview.url}
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-24 object-cover"
                                />
                                <div className="absolute top-1 right-1">
                                  <button
                                    type="button"
                                    onClick={() => removeFile(index)}
                                    className="bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                              <div className="mt-1 text-xs text-gray-600 truncate">
                                {preview.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                {(preview.size / (1024 * 1024)).toFixed(2)} MB
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* File Info */}
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex justify-between items-center mb-2">
                          <p className="text-green-700 font-semibold">
                            {files.length} file{files.length > 1 ? "s" : ""}{" "}
                            selected
                          </p>
                          <button
                            type="button"
                            onClick={removeAllFiles}
                            className="px-3 py-1 bg-red-100 text-red-600 text-sm rounded hover:bg-red-200 transition-colors"
                          >
                            Remove all
                          </button>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          Total size:{" "}
                          {(
                            files.reduce((acc, file) => acc + file.size, 0) /
                            (1024 * 1024)
                          ).toFixed(2)}{" "}
                          MB
                        </p>
                        <div className="text-sm text-blue-600 font-medium">
                          Total earnings: Rs {files.length}.00
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Main file upload area */}
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-300">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Upload className="w-8 h-8 text-blue-600" />
                        </div>
                        <p className="text-gray-600 mb-2 text-lg font-medium">
                          {isMobile()
                            ? "Select screenshots from gallery"
                            : "Drag and drop your screenshots here or click to browse"}
                        </p>
                        <p className="text-sm text-gray-500 mb-6">
                          Supported formats: PNG, JPG, JPEG (max 5MB each, up to{" "}
                          {MAX_FILES} files)
                        </p>

                        {/* File selection buttons */}
                        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                          {/* Gallery/File picker - Main option */}
                          <label className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl cursor-pointer hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold">
                            <Image className="w-5 h-5 inline mr-2" />
                            {isMobile()
                              ? "Choose from Gallery"
                              : "Choose Files"}
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="hidden"
                              multiple
                            />
                          </label>

                          {/* Camera option for mobile (optional) */}
                          {isMobile() && (
                            <label className="inline-block bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-3 rounded-xl cursor-pointer hover:from-purple-700 hover:to-purple-800 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold">
                              <Camera className="w-5 h-5 inline mr-2" />
                              Take Photos
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                                multiple
                                capture="environment"
                              />
                            </label>
                          )}
                        </div>

                        {/* Mobile help text */}
                        {isMobile() && (
                          <div className="mt-4 p-3 bg-gray-100 rounded-lg">
                            <p className="text-xs text-gray-600">
                              <strong>Tip:</strong> To select multiple files,
                              tap and hold on the first image, then tap on
                              additional images to select them.
                            </p>
                          </div>
                        )}
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

                {/* Submission validation messages */}
                {selectedLinkId &&
                  linkClickCounts[selectedLinkId] &&
                  linkClickCounts[selectedLinkId] < 10 && (
                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-yellow-800 font-medium">
                        ⚠️ Please complete{" "}
                        {10 - linkClickCounts[selectedLinkId]} more clicks on
                        your selected link before submitting.
                      </p>
                    </div>
                  )}

                {files.length > 0 && (
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-blue-700 font-medium">
                          Ready to submit {files.length} screenshot
                          {files.length > 1 ? "s" : ""}
                        </p>
                        <p className="text-blue-600 text-sm mt-1">
                          You will earn:{" "}
                          <span className="font-bold">
                            Rs {files.length}.00
                          </span>
                        </p>
                      </div>
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={
                    !files.length ||
                    isSubmitting ||
                    (selectedLinkId && linkClickCounts[selectedLinkId] < 10)
                  }
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] ${
                    files.length > 0 &&
                    (!selectedLinkId || linkClickCounts[selectedLinkId] >= 10)
                      ? "bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      <span>
                        Submitting {files.length} screenshot
                        {files.length > 1 ? "s" : ""}...
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Upload className="w-5 h-5" />
                      <span>
                        Submit {files.length} Screenshot
                        {files.length > 1 ? "s" : ""} & Earn Rs {files.length}
                        .00
                      </span>
                    </div>
                  )}
                </button>

                {/* Mobile-specific submission note */}
                {isMobile() && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-700 text-sm">
                      📱 <strong>Mobile Tip:</strong> After submitting, you'll
                      be redirected to your profile page to see your updated
                      earnings.
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
              setFiles([]);
              setPreviews([]);
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
