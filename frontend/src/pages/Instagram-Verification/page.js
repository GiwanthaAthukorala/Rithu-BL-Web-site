"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  ExternalLink,
  CheckCircle,
  Instagram,
  Heart,
  Info,
  Star,
  FileImage,
  ImageIcon,
  Zap,
  TrendingUp,
  Award,
  Sparkles,
  AlertCircle,
  Plus,
  User,
  X,
} from "lucide-react";
import Header from "@/components/Header/Header";
import api from "@/lib/api";
import { useAuth } from "@/Context/AuthContext";
import DuplicateWarningModal from "@/components/DuplicateWarningModal";
import SubmissionSummaryModal from "@/components/SubmissionSummaryModal";
import TaskLinks from "@/components/TaskLinks/TaskLinks";
import Link from "next/link";

export default function InstagramVerificationTask() {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [previousSubmissionDate, setPreviousSubmissionDate] = useState("");
  const [submissionSummary, setSubmissionSummary] = useState(null);
  const [instagramAccounts, setInstagramAccounts] = useState([]);
  const [selectedInstagramAccount, setSelectedInstagramAccount] = useState(null);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  // Link tracking — user must click at least 1 link before upload is allowed
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

  const fetchInstagramAccounts = async () => {
    try {
      setLoadingAccounts(true);
      const response = await api.get("/api/instagram-accounts");

      if (response.data.success) {
        const activeAccounts = response.data.data.filter((acc) => acc.isActive);
        setInstagramAccounts(activeAccounts);

        // Auto-select first active account if none selected
        if (activeAccounts.length > 0 && !selectedInstagramAccount) {
          setSelectedInstagramAccount(activeAccounts[0]);
        }
      }
    } catch (err) {
      console.error("Error fetching Instagram accounts:", err);
      setError("Failed to load your Instagram accounts");
    } finally {
      setLoadingAccounts(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchInstagramAccounts();
    }
  }, [user]);

  // Whether the user has clicked at least one link
  const hasClickedLink = Object.values(linkClickCounts).some((c) => c >= 1);

  const handleLinkClick = (linkId, clickCount) => {
    setLinkClickCounts((prev) => ({ ...prev, [linkId]: clickCount }));
    if (clickCount === 1) setSelectedLinkId(linkId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    processNewFiles(droppedFiles);
  };

  const processNewFiles = (selectedFiles) => {
    setError(null);

    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    const validFiles = [];
    const errors = [];

    selectedFiles.forEach((file, index) => {
      if (!validTypes.includes(file.type)) {
        errors.push(`File ${index + 1}: Only JPEG, JPG, PNG allowed`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        errors.push(`File ${index + 1}: Must be under 5MB`);
        return;
      }
      validFiles.push(file);
    });

    if (errors.length > 0) {
      setError(errors.join(". "));
      return;
    }

    const combined = [...files, ...validFiles];
    if (combined.length > 5) {
      setError("Maximum 5 screenshots allowed. Remove some files first.");
      return;
    }

    setFiles(combined);

    const previewPromises = validFiles.map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () =>
            resolve({
              id: Date.now() + Math.random(),
              name: file.name,
              url: reader.result,
              size: file.size,
              file,
            });
          reader.readAsDataURL(file);
        }),
    );

    Promise.all(previewPromises).then((newPreviews) => {
      setPreviews((prev) => [...prev, ...newPreviews]);
    });
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (!selectedFiles.length) return;
    processNewFiles(selectedFiles);
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedInstagramAccount) {
      setError("Please select an Instagram account to use for this task");
      return;
    }

    if (!hasClickedLink) {
      setError("Please click on a task link above to visit the Instagram page before submitting.");
      return;
    }

    if (!files.length || !user) {
      setError(files.length === 0 ? "Please select at least one screenshot" : "User not authenticated");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("screenshots", file));
      formData.append("platform", "instagram");
      formData.append("instagramAccountId", selectedInstagramAccount._id);
      if (selectedLinkId) formData.append("linkId", selectedLinkId);

      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found. Please log in again.");

      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "https://rithu-bl-web-site.onrender.com";

      const response = await fetch(`${apiUrl}/api/instagram/multiple`, {
        method: "POST",
        body: formData,
        credentials: "include",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.headers.get("content-type")?.includes("application/json")) {
        const text = await response.text();
        throw new Error(text || "Invalid server response");
      }

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.errorType === "NO_INSTAGRAM_ACCOUNT") {
          setError(errorData.message);
          return;
        }
        if (errorData.message?.includes("too similar")) {
          const dateMatch = errorData.message.match(/\d{1,2}\/\d{1,2}\/\d{4}/);
          setPreviousSubmissionDate(dateMatch ? dateMatch[0] : "previously");
          setShowDuplicateModal(true);
          return;
        }
        throw new Error(errorData.message || "Submission failed");
      }

      const result = await response.json();

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
    } catch (err) {
      console.error("Submission error:", err);
      if (!err.message?.includes("too similar")) {
        setError(err.message || "Submission failed. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="relative mb-6">
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-purple-200 border-t-transparent"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Instagram className="w-8 h-8 text-purple-300" />
              </div>
            </div>
            <p className="text-purple-100 text-lg font-medium">Loading your rewards...</p>
          </div>
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
            clearAllFiles();
            setIsSubmitted(false);
            setSelectedLinkId(null);
            setLinkClickCounts({});
            router.push("/Instagram-Verification/page");
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute w-96 h-96 bg-purple-500/20 rounded-full blur-3xl top-20 left-10 animate-float"></div>
        <div className="absolute w-80 h-80 bg-pink-500/20 rounded-full blur-3xl bottom-20 right-10 animate-float-delayed"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-yellow-300/20 rounded-full blur-xl animate-ping"></div>
        <div className="absolute bottom-1/4 right-1/4 w-12 h-12 bg-blue-300/20 rounded-full blur-xl animate-ping delay-700"></div>
      </div>

      <Header />

      <div className="relative z-10 max-w-6xl mx-auto p-4 py-8">
        {/* Hero Header */}
        <div className="bg-white/95 backdrop-blur-xl text-gray-800 p-10 rounded-3xl shadow-2xl mb-8 relative overflow-hidden border border-white/20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full -mr-48 -mt-48 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-orange-400/20 to-yellow-400/20 rounded-full -ml-40 -mb-40 blur-3xl"></div>

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center gap-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-3xl blur-lg opacity-50 group-hover:opacity-70 transition-opacity"></div>
              <div className="relative w-28 h-28 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-3xl flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-transform duration-300">
                <Instagram className="w-16 h-16 text-white" />
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-5xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent">
                  Instagram Rewards
                </h1>
                <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
              </div>
              <p className="text-gray-600 text-lg mb-4 font-medium">
                Complete simple tasks and watch your earnings grow! 🚀
              </p>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full px-5 py-2.5 shadow-lg">
                  <Star className="w-5 h-5 fill-white" />
                  <span className="font-bold">Rs 1.00 per screenshot</span>
                </div>
                <div className="flex items-center gap-2 bg-gradient-to-r from-green-400 to-emerald-400 text-white rounded-full px-5 py-2.5 shadow-lg">
                  <Zap className="w-5 h-5" />
                  <span className="font-bold">Instant payout</span>
                </div>
                <div className="flex items-center gap-2 bg-gradient-to-r from-blue-400 to-indigo-400 text-white rounded-full px-5 py-2.5 shadow-lg">
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-bold">Up to 5 at once</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instagram Account Selection */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl mb-8 border border-white/20 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-800">Your Instagram Account</h2>
                  <p className="text-sm text-gray-500">Select which account you're using for this task</p>
                </div>
              </div>
              <Link
                href="/Profile/page?tab=instagram-accounts"
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-sm hover:shadow-lg transition-all"
              >
                <Plus size={16} className="inline mr-1" />
                Manage Accounts
              </Link>
            </div>
          </div>

          <div className="p-6">
            {loadingAccounts ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-500 border-t-transparent"></div>
              </div>
            ) : instagramAccounts.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
                <p className="text-gray-600 mb-4">No active Instagram accounts found.</p>
                <Link
                  href="/Profile/page?tab=instagram-accounts"
                  className="inline-flex items-center px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  <Plus size={16} className="mr-2" />
                  Add Your First Account
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {instagramAccounts.map((account) => (
                  <div
                    key={account._id}
                    onClick={() => setSelectedInstagramAccount(account)}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      selectedInstagramAccount?._id === account._id
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 hover:border-purple-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          selectedInstagramAccount?._id === account._id
                            ? "bg-purple-600 text-white"
                            : "bg-purple-200 text-purple-700"
                        }`}
                      >
                        <Instagram size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900">{account.accountName}</p>
                        <p className="text-xs text-gray-500 truncate">{account.profileUrl}</p>
                      </div>
                    </div>
                    {selectedInstagramAccount?._id === account._id && (
                      <CheckCircle className="text-purple-600 flex-shrink-0" size={20} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedInstagramAccount && instagramAccounts.length > 0 && (
            <div className="mx-6 mb-6 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-700 text-sm flex items-center">
                <CheckCircle size={16} className="mr-2 flex-shrink-0" />
                Using account:{" "}
                <strong className="mx-1 truncate">{selectedInstagramAccount.accountName}</strong>
                for this task
              </p>
            </div>
          )}
        </div>

        {/* Task Links — must click before upload */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl mb-8 border border-white/20 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-orange-500 rounded-xl flex items-center justify-center">
                <ExternalLink className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Step 1 — Visit Instagram Page</h2>
                <p className="text-sm text-gray-500">
                  Click on a link below to visit the Instagram page and like/follow it.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-4 border border-blue-200">
              <p className="text-blue-800 text-sm font-medium flex items-center gap-2">
                <Info className="w-4 h-4 flex-shrink-0" />
                You must click a link below to open the Instagram page before you can upload your screenshot.
              </p>
            </div>

            <TaskLinks platform="instagram" onLinkClick={handleLinkClick} />

            {hasClickedLink && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-700 text-sm flex items-center gap-2">
                  <CheckCircle size={16} />
                  ✓ Link visited! You can now upload your screenshots.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Steps & Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Steps Section */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
              <div className="p-8 lg:p-10 border-b border-gray-100">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Info className="w-7 h-7 text-white" />
                  </div>
                  <h2 className="text-3xl font-black text-gray-800">Simple Steps to Earn</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-5 mb-10">
                  {[
                    {
                      num: "1",
                      text: "Visit Instagram page",
                      icon: ExternalLink,
                      color: "from-blue-500 to-indigo-500",
                      desc: "Click a link above to open the page",
                    },
                    {
                      num: "2",
                      text: "Like / Follow",
                      icon: Heart,
                      color: "from-pink-500 to-rose-500",
                      desc: "Like or follow the Instagram page",
                    },
                    {
                      num: "3",
                      text: "Take screenshots (up to 5)",
                      icon: ImageIcon,
                      color: "from-purple-500 to-violet-500",
                      desc: "Capture your screen showing engagement",
                    },
                    {
                      num: "4",
                      text: "Upload & earn",
                      icon: Upload,
                      color: "from-green-500 to-emerald-500",
                      desc: "Submit up to 5 screenshots and get rewarded",
                    },
                  ].map((step, idx) => (
                    <div
                      key={idx}
                      className="group relative bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border-2 border-gray-200 hover:border-purple-400 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="relative">
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className={`w-10 h-10 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center text-white font-black shadow-lg`}
                          >
                            {step.num}
                          </div>
                          <step.icon className="w-6 h-6 text-purple-600 group-hover:scale-110 transition-transform" />
                        </div>
                        <p className="text-sm font-bold text-gray-700 group-hover:text-purple-700 mb-2">
                          {step.text}
                        </p>
                        <p className="text-xs text-gray-500">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Multiple Upload Info */}
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-5 rounded-2xl border border-purple-200 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">!</div>
                    <div>
                      <p className="text-purple-800 font-semibold">Multiple Upload Feature</p>
                      <p className="text-purple-700 text-sm mt-1">
                        • Upload 1–5 screenshots at once<br />
                        • Earn Rs 1.00 for each unique screenshot<br />
                        • Duplicate screenshots are automatically filtered out<br />
                        • Save time by processing multiple submissions together
                      </p>
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
                        <span>Link will open in a new tab or redirect you to Instagram</span>
                      </p>
                      <p className="flex items-start space-x-2">
                        <span className="text-purple-600 font-bold">•</span>
                        <span>Use your browser's back button to return here after liking</span>
                      </p>
                      <p className="flex items-start space-x-2">
                        <span className="text-purple-600 font-bold">•</span>
                        <span>Take screenshots using Power + Volume Down</span>
                      </p>
                      <p className="flex items-start space-x-2">
                        <span className="text-purple-600 font-bold">•</span>
                        <span>Select multiple screenshots from your gallery at once</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Requirements */}
              <div className="p-8 lg:p-10 bg-gradient-to-br from-amber-50 to-yellow-50">
                <h3 className="font-black text-gray-800 mb-6 flex items-center gap-3 text-2xl">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-400 rounded-xl flex items-center justify-center shadow-lg">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  Screenshot Requirements
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    "Must clearly show the liked/followed page",
                    "Show your profile or browser context",
                    "No edited or cropped images",
                    "File size under 5MB each",
                    "JPEG, PNG formats only",
                    "Each screenshot must be different",
                  ].map((req, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-amber-200"
                    >
                      <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">{req}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Upload Section */}
          <div className="lg:col-span-1">
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 sticky top-8">
              <div className="p-8 lg:p-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <Upload className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-800">
                      Screenshots ({files.length}/5)
                    </h3>
                  </div>
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

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-2xl shadow-lg">
                    <p className="text-sm text-red-700 font-bold flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      {error}
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-6">
                    {previews.length > 0 ? (
                      <div className="border-2 border-dashed border-green-400 rounded-2xl p-4 bg-green-50">
                        {/* File counter */}
                        <div className="mb-4 text-center">
                          <div className="inline-flex items-center bg-white px-4 py-2 rounded-full shadow-sm">
                            <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-2">
                              {files.length}
                            </div>
                            <span className="text-gray-700 font-medium">Screenshots selected</span>
                            <div className="ml-4 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                              Rs {files.length}.00
                            </div>
                          </div>
                        </div>

                        {/* Preview grid */}
                        <div className="space-y-2 mb-4">
                          {previews.map((preview, index) => (
                            <div
                              key={preview.id}
                              className="relative bg-white rounded-xl p-3 shadow-sm border border-gray-200 flex items-center gap-3"
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
                              <div className="w-6 h-6 bg-gray-200 text-gray-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                                {index + 1}
                              </div>
                              <img
                                src={preview.url}
                                alt={`Screenshot ${index + 1}`}
                                className="w-16 h-16 object-contain rounded-lg border border-gray-200"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-gray-700 truncate font-medium">{preview.name}</p>
                                <p className="text-xs text-gray-500">
                                  {(preview.size / (1024 * 1024)).toFixed(2)} MB
                                </p>
                              </div>
                              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                            </div>
                          ))}
                        </div>

                        {/* Add more files */}
                        {files.length < 5 && (
                          <div className="text-center">
                            <label className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors cursor-pointer font-semibold text-sm">
                              <Upload className="w-4 h-4 mr-2" />
                              Add More ({5 - files.length} remaining)
                              <input
                                type="file"
                                accept=".png,.jpg,.jpeg"
                                onChange={handleFileChange}
                                className="hidden"
                                multiple
                              />
                            </label>
                          </div>
                        )}

                        {/* Earnings estimate */}
                        <div className="mt-4 p-3 bg-white border border-green-200 rounded-xl">
                          <div className="flex items-center justify-between">
                            <p className="text-green-800 font-medium text-sm">Potential Earnings:</p>
                            <p className="text-green-700 font-black text-lg">Rs {files.length}.00</p>
                          </div>
                          <p className="text-green-600 text-xs mt-1">
                            {files.length} screenshot{files.length !== 1 ? "s" : ""} × Rs 1.00
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`border-4 border-dashed rounded-3xl p-12 text-center bg-gradient-to-br from-gray-50 to-slate-50 transition-all duration-300 ${
                          isDragging
                            ? "border-purple-500 bg-purple-50 scale-105 shadow-2xl"
                            : "border-gray-300 hover:border-purple-400 hover:shadow-xl"
                        }`}
                      >
                        <div className="relative inline-block mb-6">
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl blur-xl opacity-50 animate-pulse"></div>
                          <div className="relative w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-3xl flex items-center justify-center shadow-2xl mx-auto">
                            <Upload className="w-10 h-10 text-white" />
                          </div>
                        </div>
                        <p className="text-gray-800 mb-2 font-black text-xl">Drop screenshots here</p>
                        <p className="text-gray-500 mb-2 text-sm">or click to browse</p>
                        <p className="text-xs text-gray-400 mb-6">PNG, JPG, JPEG • Max 5MB each • Up to 5 files</p>
                        <label className="inline-block bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white px-8 py-3 rounded-2xl cursor-pointer hover:shadow-2xl transform hover:scale-105 transition-all duration-300 font-bold shadow-lg">
                          Choose Files
                          <input
                            type="file"
                            accept=".png,.jpg,.jpeg"
                            onChange={handleFileChange}
                            className="hidden"
                            multiple
                          />
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Link not clicked warning */}
                  {!hasClickedLink && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                      <p className="text-yellow-800 text-sm font-medium flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        Please click a task link above to visit the Instagram page first.
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={
                      !files.length ||
                      isSubmitting ||
                      instagramAccounts.length === 0 ||
                      !selectedInstagramAccount ||
                      !hasClickedLink
                    }
                    className={`w-full py-4 rounded-2xl font-black text-lg transition-all duration-300 shadow-xl ${
                      files.length > 0 &&
                      instagramAccounts.length > 0 &&
                      selectedInstagramAccount &&
                      hasClickedLink
                        ? "bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white hover:shadow-2xl transform hover:scale-105"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Submitting {files.length} screenshot{files.length !== 1 ? "s" : ""}...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-3">
                        <Upload className="w-5 h-5" />
                        Submit {files.length || ""} Screenshot{files.length !== 1 ? "s" : ""} &amp; Earn Rs{" "}
                        {files.length}.00
                        <Sparkles className="w-5 h-5" />
                      </span>
                    )}
                  </button>

                  {(instagramAccounts.length === 0 || !selectedInstagramAccount) && (
                    <p className="text-center text-sm text-red-500 mt-4">
                      Please add and select an Instagram account above
                    </p>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300"
        >
          <TrendingUp className="w-6 h-6" />
        </button>
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

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(20px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-delayed { animation: float-delayed 8s ease-in-out infinite; }
        .delay-700 { animation-delay: 700ms; }
      `}</style>
    </div>
  );
}
