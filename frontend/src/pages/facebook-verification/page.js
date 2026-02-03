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
  Star,
  Zap,
  Award,
  TrendingUp,
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
  const [submissionSummary, setSubmissionSummary] = useState(null);

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
    setError(null);

    if (selectedFiles.length > 5) {
      setError("You can only upload up to 5 screenshots at once");
      return;
    }

    const validFiles = [];
    const errors = [];

    selectedFiles.forEach((file, index) => {
      const validTypes = ["image/jpeg", "image/png", "image/jpg"];
      if (!validTypes.includes(file.type)) {
        errors.push(
          `File ${index + 1}: Only JPEG, JPG, and PNG images are allowed`,
        );
        return;
      }

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

    const allFiles = [...files, ...validFiles];
    if (allFiles.length > 5) {
      setError("Maximum 5 screenshots allowed. Remove some files first.");
      return;
    }

    setFiles(allFiles);

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
    setLinkClickCounts((prev) => ({
      ...prev,
      [linkId]: clickCount,
    }));

    if (clickCount === 1) {
      setSelectedLinkId(linkId);
    }

    if (isMobile() && navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!files.length || !user) {
      setError(
        files.length === 0
          ? "Please select at least one screenshot"
          : "User not authenticated",
      );
      return;
    }

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

      files.forEach((file) => {
        formData.append("screenshots", file);
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

      const response = await fetch(`${apiUrl}/api/submissions/multiple`, {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.headers.get("content-type")?.includes("application/json")) {
        const text = await response.text();
        throw new Error(text || "Invalid server response");
      }

      if (!response.ok) {
        const errorData = await response.json();

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

      if (selectedLinkId) {
        try {
          await api.post(`/links/${selectedLinkId}/submit`);
        } catch (submitError) {
          console.error("Failed to mark link as submitted:", submitError);
        }
      }

      setIsSubmitted(true);

      if (result.data) {
        setSubmissionSummary({
          successful: result.data.successful || 0,
          duplicates: result.data.duplicates || 0,
          failed: result.data.failed || 0,
          totalEarned: result.data.totalEarned || 0,
          details: result.data.details,
        });
      }

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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-8 h-8 bg-blue-600 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isSubmitted && submissionSummary) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl shadow-2xl mb-8">
          {/* Animated Background */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
            <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-200 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-4000"></div>
          </div>

          <div className="relative z-10 p-8 md:p-12">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
              {/* Left Side - Icon & Title */}
              <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                <div className="relative group">
                  <div className="absolute inset-0 bg-white rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
                  <div className="relative w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform duration-300">
                    <img
                      src="/facebook.png"
                      alt="Facebook"
                      className="w-16 h-16 object-contain"
                    />
                  </div>
                </div>

                <div>
                  <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">
                    Facebook Verification
                  </h1>
                  <p className="text-xl text-blue-100 font-medium">
                    Earn while engaging with Facebook pages
                  </p>
                </div>
              </div>

              {/* Right Side - Stats Cards */}
              <div className="grid grid-cols-2 gap-4 w-full lg:w-auto">
                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center">
                      <Star className="w-5 h-5 text-yellow-900" />
                    </div>
                    <div className="text-left">
                      <p className="text-3xl font-bold text-white">Rs 1.00</p>
                      <p className="text-sm text-blue-100">Per Screenshot</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-green-400 rounded-xl flex items-center justify-center">
                      <Zap className="w-5 h-5 text-green-900" />
                    </div>
                    <div className="text-left">
                      <p className="text-3xl font-bold text-white">Up to 5</p>
                      <p className="text-sm text-blue-100">Screenshots</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3 mt-8 justify-center lg:justify-start">
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
                <CheckCircle className="w-4 h-4 text-green-300" />
                <span className="text-sm text-white font-medium">
                  Instant Payout
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
                <Upload className="w-4 h-4 text-blue-300" />
                <span className="text-sm text-white font-medium">
                  Bulk Upload
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/30">
                <Award className="w-4 h-4 text-yellow-300" />
                <span className="text-sm text-white font-medium">
                  Easy Tasks
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Instructions & Links */}
          <div className="lg:col-span-2 space-y-6">
            {/* Instructions Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <MdRateReview className="w-6 h-6" />
                  </div>
                  How It Works
                </h2>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  {[
                    {
                      step: 1,
                      text: "Click on a Facebook page link below",
                      icon: "🔗",
                    },
                    {
                      step: 2,
                      text: "Like or follow the page on Facebook",
                      icon: "👍",
                    },
                    {
                      step: 3,
                      text: "Click the link 2 times to track your engagement",
                      icon: "🔄",
                    },
                    {
                      step: 4,
                      text: "Take up to 5 different screenshots showing your likes/follows",
                      icon: "📸",
                    },
                    {
                      step: 5,
                      text: "Upload all screenshots at once to earn Rs 1.00 each",
                      icon: "💰",
                    },
                  ].map((item) => (
                    <div
                      key={item.step}
                      className="flex items-start gap-4 group"
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg group-hover:scale-110 transition-transform">
                        {item.step}
                      </div>
                      <div className="flex-1 pt-2">
                        <p className="text-gray-700 font-medium">{item.text}</p>
                      </div>
                      <div className="text-3xl">{item.icon}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-bold text-blue-900 mb-2">
                        Multiple Upload Benefits
                      </h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Upload 1-5 screenshots at once</li>
                        <li>• Earn Rs 1.00 for each unique screenshot</li>
                        <li>• Duplicates automatically filtered</li>
                        <li>• Save time with batch processing</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Facebook Page Review Section */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-500" />
                Facebook Page Review Section
              </h3>

              <Link href="/FbPageReview/pages">
                <div className="cursor-pointer bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shadow-lg">
                      <img
                        src="/review.png"
                        alt="Review"
                        className="w-12 h-12 object-contain"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-white mb-1">
                        Page Review Task
                      </h4>
                      <p className="text-purple-100">
                        Share your thoughts and earn more
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-black text-white">
                      Rs 30.00
                    </div>
                    <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                      <span className="text-white font-semibold">
                        Per Review
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            {/* Facebook Pages Links */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-3">
                  <ExternalLink className="w-6 h-6" />
                  Facebook Pages to Follow
                </h3>
              </div>

              <div className="p-6">
                <TaskLinks platform="facebook" onLinkClick={handleLinkClick} />

                {selectedLinkId && linkClickCounts[selectedLinkId] && (
                  <div
                    className={`mt-4 p-4 rounded-xl border-2 ${
                      linkClickCounts[selectedLinkId] >= 2
                        ? "bg-green-50 border-green-300"
                        : "bg-yellow-50 border-yellow-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p
                        className={`font-bold ${
                          linkClickCounts[selectedLinkId] >= 2
                            ? "text-green-700"
                            : "text-yellow-700"
                        }`}
                      >
                        {linkClickCounts[selectedLinkId] >= 2
                          ? "✓ Ready to Submit!"
                          : "⚠️ Almost Ready"}
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-semibold">
                          {linkClickCounts[selectedLinkId]}/2 clicks
                        </div>
                        {linkClickCounts[selectedLinkId] >= 2 && (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          linkClickCounts[selectedLinkId] >= 2
                            ? "bg-green-500"
                            : "bg-yellow-500"
                        }`}
                        style={{
                          width: `${(linkClickCounts[selectedLinkId] / 2) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Screenshot Requirements */}
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl shadow-xl p-6 border-2 border-orange-200">
              <h3 className="text-xl font-bold text-orange-800 mb-4 flex items-center gap-3">
                <AlertCircle className="w-6 h-6" />
                Screenshot Requirements
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  "Must clearly show the liked/followed page",
                  "Each screenshot should be different",
                  "No edited or cropped images",
                  "File size under 5MB each",
                ].map((req, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3 bg-white/60 p-3 rounded-lg"
                  >
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700 font-medium">
                      {req}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Upload Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden sticky top-8">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Upload className="w-6 h-6" />
                    Upload
                  </h3>
                  <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                    <span className="text-white font-bold">
                      {files.length}/5
                    </span>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                {/* Upload Area */}
                {previews.length > 0 ? (
                  <div className="space-y-4">
                    {/* Earnings Display */}
                    <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-4 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm opacity-90">
                            Potential Earnings
                          </p>
                          <p className="text-3xl font-black">
                            Rs {files.length}.00
                          </p>
                        </div>
                        <TrendingUp className="w-8 h-8 opacity-80" />
                      </div>
                    </div>

                    {/* Preview Grid */}
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                      {previews.map((preview, index) => (
                        <div key={preview.id} className="relative group">
                          <div className="absolute -top-2 -right-2 z-10">
                            <button
                              type="button"
                              onClick={() => removeFile(index)}
                              className="w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-3 border-2 border-gray-200 group-hover:border-blue-400 transition-colors">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm font-bold">
                                {index + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-600 truncate">
                                  {preview.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {(preview.size / (1024 * 1024)).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <img
                              src={preview.url}
                              alt={`Screenshot ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add More / Clear Buttons */}
                    <div className="flex gap-2">
                      {files.length < 5 && (
                        <label className="flex-1 bg-blue-100 text-blue-700 px-4 py-3 rounded-xl hover:bg-blue-200 transition-colors cursor-pointer text-center font-semibold">
                          <Upload className="w-4 h-4 inline mr-2" />
                          Add More
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                            multiple
                          />
                        </label>
                      )}
                      <button
                        type="button"
                        onClick={clearAllFiles}
                        className="px-4 py-3 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors font-semibold"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50 transition-all">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Camera className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-gray-700 font-semibold mb-2">
                      {isMobile() ? "Select Screenshots" : "Upload Screenshots"}
                    </p>
                    <p className="text-sm text-gray-500 mb-6">
                      PNG, JPG, JPEG • Max 5MB each
                    </p>
                    <label className="inline-block bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl cursor-pointer hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-lg font-bold">
                      <Image className="w-5 h-5 inline mr-2" />
                      Choose Files
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

                {/* Error Message */}
                {error && (
                  <div className="mt-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                    <p className="text-sm text-red-600 font-medium flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={
                    !files.length ||
                    isSubmitting ||
                    (selectedLinkId && linkClickCounts[selectedLinkId] < 2)
                  }
                  className={`w-full mt-6 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform ${
                    files.length > 0 &&
                    (!selectedLinkId || linkClickCounts[selectedLinkId] >= 2)
                      ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl hover:scale-105"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Zap className="w-5 h-5" />
                      <span>Submit & Earn Rs {files.length}.00</span>
                    </div>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showDuplicateModal && (
        <DuplicateWarningModal
          onClose={() => {
            setShowDuplicateModal(false);
            clearAllFiles();
          }}
          previousDate={previousSubmissionDate}
        />
      )}

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        @media (max-width: 768px) {
          .task-link:active {
            transform: scale(0.98);
          }
        }

        input[type="file"] {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #555;
        }
      `}</style>
    </div>
  );
}
