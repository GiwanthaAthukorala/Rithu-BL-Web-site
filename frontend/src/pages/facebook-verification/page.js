// app/facebook-verification/page.js
"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  ExternalLink,
  CheckCircle,
  X,
  Camera,
  Image,
  Trash2,
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
  const [batchResult, setBatchResult] = useState(null);
  const fileInputRef = useRef(null);

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

    // Check total files limit
    if (files.length + selectedFiles.length > 6) {
      setError("Maximum 6 screenshots allowed");
      return;
    }

    // Validate each file
    const validFiles = [];
    const invalidFiles = [];

    selectedFiles.forEach((file) => {
      // Validate file type
      const validTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!validTypes.includes(file.type)) {
        invalidFiles.push({ file, error: "Invalid file type" });
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        invalidFiles.push({ file, error: "File too large (max 5MB)" });
        return;
      }

      validFiles.push(file);
    });

    if (invalidFiles.length > 0) {
      setError(
        `${invalidFiles.length} file(s) rejected: ${invalidFiles
          .map((f) => f.error)
          .join(", ")}`
      );
    }

    if (validFiles.length === 0) return;

    // Add valid files to state
    setFiles((prev) => [...prev, ...validFiles]);
    setError(null);

    // Create previews
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => [
          ...prev,
          {
            id: Date.now() + Math.random(),
            url: reader.result,
            name: file.name,
            size: file.size,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
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
    if (files.length === 0 || !user) return;

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
    setBatchResult(null);

    try {
      const formData = new FormData();

      // Add all files
      files.forEach((file) => {
        formData.append("screenshots", file);
      });

      formData.append("platform", "facebook");

      /*if (selectedLinkId) {
        formData.append("linkId", selectedLinkId);
      }*/

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }

      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://rithu-bl-web-side.vercel.app";
      console.log("Submitting to:", `${apiUrl}/api/submissions`);
      console.log("Number of files:", files.length);

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

      setBatchResult(result.data);

      // Mark link as submitted if we have one
      /*if (selectedLinkId) {
        try {
          await api.post(`/links/${selectedLinkId}/submit`);
          console.log("Link marked as submitted");
        } catch (submitError) {
          console.error("Failed to mark link as submitted:", submitError);
        }
      }*/

      setIsSubmitted(true);

      // Clear files after successful submission
      setFiles([]);
      setPreviews([]);

      // Navigate to profile after success
      setTimeout(() => {
        router.push("/Profile/page");
      }, 5000);
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

  if (isSubmitted && batchResult) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-2xl mx-auto p-6">
          <div className="bg-white p-8 rounded-xl shadow-sm text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-green-600">
              Batch Submission Successful!
            </h2>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-green-100 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-700">
                    {batchResult.successful.length}
                  </div>
                  <div className="text-green-600">Approved</div>
                </div>
                <div className="bg-red-100 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-700">
                    {batchResult.rejected.length}
                  </div>
                  <div className="text-red-600">Rejected</div>
                </div>
              </div>

              <div className="bg-blue-100 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-700">
                  Rs {batchResult.totalEarned.toFixed(2)}
                </div>
                <div className="text-blue-600">Total Earned</div>
              </div>
            </div>

            {/* Show rejected images reasons */}
            {batchResult.rejected.length > 0 && (
              <div className="mb-6 text-left">
                <h3 className="font-bold text-lg mb-2 text-red-600">
                  Rejected Images:
                </h3>
                <ul className="space-y-2">
                  {batchResult.rejected.map((rejected, index) => (
                    <li
                      key={index}
                      className="text-red-600 bg-red-50 p-3 rounded"
                    >
                      <strong>Image {rejected.index}:</strong> {rejected.reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="text-gray-600 mb-6">
              You've earned Rs {batchResult.totalEarned.toFixed(2)}! Your
              balance has been updated. Redirecting to profile in 5 seconds...
            </p>
            <button
              onClick={() => router.push("/Profile/page")}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Go to Profile Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <Header />
      <div className="max-w-6xl mx-auto p-4">
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
                    Facebook Batch Verification
                  </h1>
                  <div className="mt-2 sm:mt-0 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-semibold rounded-full shadow-md animate-pulse">
                    Rs {files.length * 1}.00 Total
                  </div>
                </div>

                <p className="text-blue-100 text-base sm:text-lg font-medium">
                  Upload up to 6 screenshots at once and earn Rs 1.00 per
                  approved image
                </p>

                <div className="flex flex-col sm:flex-row items-center sm:items-center justify-center sm:justify-start space-y-2 sm:space-y-0 sm:space-x-4 mt-3">
                  <div className="flex items-center space-x-2 text-blue-200">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm">Batch Upload Available</span>
                  </div>
                  <div className="flex items-center space-x-2 text-blue-200">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">Instant Payout</span>
                  </div>
                </div>
              </div>

              {/* Files counter */}
              <div className="mt-4 sm:mt-0">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                  <div className="text-3xl font-bold text-white">
                    {files.length}/6
                  </div>
                  <div className="text-blue-200 text-sm">Screenshots</div>
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
          <div className="p-6">
            {/* Files Preview Section */}
            {files.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center justify-between">
                  <span>Selected Screenshots ({files.length}/6)</span>
                  <button
                    onClick={() => {
                      setFiles([]);
                      setPreviews([]);
                    }}
                    className="text-sm bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Clear All</span>
                  </button>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {previews.map((preview, index) => (
                    <div
                      key={preview.id}
                      className="relative border rounded-lg overflow-hidden shadow-sm"
                    >
                      <img
                        src={preview.url}
                        alt={`Screenshot ${index + 1}`}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-3 bg-gray-50">
                        <div className="flex justify-between items-center">
                          <div className="text-sm font-medium text-gray-700 truncate">
                            {preview.name}
                          </div>
                          <button
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        <div className="text-xs text-gray-500">
                          {(preview.size / (1024 * 1024)).toFixed(2)} MB
                        </div>
                        <div className="mt-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded inline-block">
                          Image {index + 1}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Instructions Section */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                  <MdRateReview />
                </div>
                <span>Batch Upload Instructions</span>
              </h2>
              <div className="bg-gray-50 p-6 rounded-xl">
                <ol className="list-decimal list-inside space-y-3 text-gray-700">
                  <li className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      1
                    </span>
                    <span>
                      Click on Facebook page links below and like/follow them
                    </span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      2
                    </span>
                    <span>Take screenshots of each liked/followed page</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      3
                    </span>
                    <span>
                      Select up to 6 different screenshots (no duplicates)
                    </span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      4
                    </span>
                    <span>Each approved screenshot earns Rs 1.00</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      5
                    </span>
                    <span>Submit all at once for faster processing</span>
                  </li>
                </ol>

                {/* Earnings calculation */}
                <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-lg font-bold text-gray-800">
                        Rs {files.length * 1}.00
                      </div>
                      <div className="text-sm text-gray-600">
                        Potential earnings ({files.length} screenshots × Rs
                        1.00)
                      </div>
                    </div>
                    <div className="text-green-600 font-medium">
                      {files.length} of 6 slots filled
                    </div>
                  </div>
                  <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-400 to-emerald-500"
                      style={{ width: `${(files.length / 6) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* ... Rest of the component remains similar until the Upload Section ... */}

            {/* Upload Section */}
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
                <Upload className="w-6 h-6 text-blue-600" />
                <span>Upload Screenshots ({files.length}/6)</span>
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Select Screenshots
                  </label>

                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-300">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      {files.length === 0 ? (
                        <Upload className="w-10 h-10 text-blue-600" />
                      ) : (
                        <div className="text-2xl font-bold text-blue-600">
                          {files.length}
                        </div>
                      )}
                    </div>
                    <p className="text-gray-600 mb-2 text-lg font-medium">
                      {isMobile()
                        ? "Select screenshots from gallery"
                        : "Drag and drop screenshots here or click to browse"}
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                      Upload up to 6 screenshots. Each approved image earns Rs
                      1.00
                    </p>

                    <label className="inline-block bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl cursor-pointer hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg font-semibold">
                      <Image className="w-5 h-5 inline mr-2" />
                      {isMobile() ? "Choose from Gallery" : "Choose Files"}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        multiple
                        className="hidden"
                        disabled={files.length >= 6}
                      />
                    </label>

                    {files.length > 0 && files.length < 6 && (
                      <p className="mt-4 text-blue-600 text-sm">
                        You can add {6 - files.length} more screenshot(s)
                      </p>
                    )}

                    {files.length >= 6 && (
                      <p className="mt-4 text-red-600 text-sm font-medium">
                        Maximum 6 screenshots reached. Remove some to add more.
                      </p>
                    )}
                  </div>

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
                  disabled={
                    files.length === 0 ||
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
                      <span>Processing {files.length} screenshots...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <Upload className="w-5 h-5" />
                      <span>
                        Submit {files.length} Screenshot
                        {files.length !== 1 ? "s" : ""} & Earn Rs{" "}
                        {files.length * 1}.00
                      </span>
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
              setFiles([]);
              setPreviews([]);
            }}
            previousDate={previousSubmissionDate}
          />
        )}
      </div>

      {/* Mobile-specific styles */}
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

          input[type="file"] {
            -webkit-appearance: none;
            appearance: none;
          }

          button,
          label {
            min-height: 44px;
            touch-action: manipulation;
          }
        }

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
