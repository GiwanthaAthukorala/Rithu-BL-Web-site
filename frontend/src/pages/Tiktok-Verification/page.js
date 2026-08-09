"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  ExternalLink,
  CheckCircle,
  Star,
  TrendingUp,
  Users,
  Loader2,
  Music,
  AlertCircle,
  X,
  Info,
} from "lucide-react";
import Header from "@/components/Header/Header";
import api from "@/lib/api";
import { useAuth } from "@/Context/AuthContext";
import DuplicateWarningModal from "@/components/DuplicateWarningModal";
import SubmissionSummaryModal from "@/components/SubmissionSummaryModal";

export default function TikTokVerificationTask() {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [previousSubmissionDate, setPreviousSubmissionDate] = useState("");
  const [submissionSummary, setSubmissionSummary] = useState(null);

  // Dynamic TikTok links from the admin
  const [tiktokLinks, setTiktokLinks] = useState([]);
  const [linksLoading, setLinksLoading] = useState(true);

  // Link tracking — user must click at least 1 link before upload
  const [clickedLinks, setClickedLinks] = useState({});
  const hasClickedLink = Object.values(clickedLinks).some((c) => c >= 1);

  const fetchTiktokLinks = useCallback(async () => {
    if (!user) return;
    setLinksLoading(true);
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "https://rithu-bl-web-site.onrender.com";
      const token = localStorage.getItem("token");
      const response = await fetch(`${apiUrl}/api/links/tiktok`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTiktokLinks(data.data || []);
        }
      }
    } catch (err) {
      console.error("Failed to fetch TikTok links:", err);
    } finally {
      setLinksLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTiktokLinks();
  }, [fetchTiktokLinks]);

  const handleLinkClick = async (linkId) => {
    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "https://rithu-bl-web-site.onrender.com";
      const token = localStorage.getItem("token");
      await fetch(`${apiUrl}/api/links/${linkId}/click`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      // Track click locally
      setClickedLinks((prev) => ({ ...prev, [linkId]: (prev[linkId] || 0) + 1 }));
      // Update tiktokLinks click count visually
      setTiktokLinks((prev) =>
        prev.map((l) => l._id === linkId ? { ...l, totalClicks: (l.totalClicks || 0) + 1 } : l)
      );
    } catch (err) {
      // Non-critical — don't block the user
      console.error("Click tracking failed:", err);
      // Still count the click locally
      setClickedLinks((prev) => ({ ...prev, [linkId]: (prev[linkId] || 0) + 1 }));
    }
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

    if (!hasClickedLink) {
      setError("Please click on a TikTok link above to visit the page before submitting.");
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
      formData.append("platform", "Tiktok");

      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found. Please log in again.");

      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "https://rithu-bl-web-site.onrender.com";

      const response = await fetch(`${apiUrl}/api/tiktok/multiple`, {
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        <Header />
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600"></div>
            <div className="absolute inset-0 animate-pulse rounded-full h-16 w-16 border-4 border-blue-200 opacity-75"></div>
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
            setClickedLinks({});
            router.push("/Tiktok-Verification/page");
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Header />
      <div className="max-w-4xl mx-auto p-2 sm:p-4">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-black via-gray-900 to-black rounded-t-xl sm:rounded-t-2xl shadow-2xl">
          {/* Animated background elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-20 sm:w-32 h-20 sm:h-32 bg-pink-500 rounded-full animate-pulse"></div>
            <div className="absolute top-5 sm:top-10 right-5 sm:right-10 w-16 sm:w-24 h-16 sm:h-24 bg-blue-500 rounded-full animate-bounce delay-300"></div>
            <div className="absolute bottom-0 left-1/2 w-24 sm:w-40 h-24 sm:h-40 bg-purple-500 rounded-full animate-pulse delay-700"></div>
          </div>

          {/* Content */}
          <div className="relative z-10 p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row items-center sm:justify-between mb-4 sm:mb-6 space-y-4 sm:space-y-0">
              <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4 text-center sm:text-left">
                <div className="relative group">
                  <div className="w-16 h-16 sm:w-20 lg:w-24 sm:h-20 lg:h-24 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 rounded-xl sm:rounded-2xl p-1 transform group-hover:scale-110 transition-transform duration-300">
                    <div className="w-full h-full bg-black rounded-lg sm:rounded-xl flex items-center justify-center overflow-hidden">
                      <img
                        src="/Tiktok.png"
                        alt="TikTok Icon"
                        className="w-10 h-10 sm:w-12 lg:w-16 sm:h-12 lg:h-16 object-contain filter brightness-0 invert"
                      />
                    </div>
                  </div>
                  <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 sm:w-6 sm:h-6 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                    <span className="text-white text-xs font-bold">✓</span>
                  </div>
                </div>

                <div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-white via-pink-200 to-purple-200 bg-clip-text text-transparent mb-1 sm:mb-2">
                    TikTok Verification
                  </h1>
                  <p className="text-gray-300 text-sm sm:text-base lg:text-lg">
                    Complete tasks • Upload up to 5 screenshots • Earn rewards
                  </p>
                </div>
              </div>

              <div className="text-center sm:text-right">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl shadow-lg">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="font-bold text-lg sm:text-xl">Rs 1.00/=</span>
                  </div>
                  <p className="text-green-100 text-xs sm:text-sm">per screenshot</p>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-4 sm:mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-4 text-center border border-white/20">
                <Star className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-400 mx-auto mb-1 sm:mb-2" />
                <div className="text-white font-semibold text-xs sm:text-sm">Easy Tasks</div>
                <div className="text-gray-300 text-xs sm:text-sm">Simple &amp; Quick</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-4 text-center border border-white/20">
                <Users className="w-4 h-4 sm:w-6 sm:h-6 text-blue-400 mx-auto mb-1 sm:mb-2" />
                <div className="text-white font-semibold text-xs sm:text-sm">5 at Once</div>
                <div className="text-gray-300 text-xs sm:text-sm">Multi-Upload</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-4 text-center border border-white/20">
                <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6 text-green-400 mx-auto mb-1 sm:mb-2" />
                <div className="text-white font-semibold text-xs sm:text-sm">Instant Rewards</div>
                <div className="text-gray-300 text-xs sm:text-sm">Fast Payments</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white/90 backdrop-blur-sm p-4 sm:p-6 lg:p-8 rounded-b-xl sm:rounded-b-2xl shadow-xl border-x border-b border-gray-200">
          {/* Instructions Section */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center space-x-3 mb-4 sm:mb-6">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs sm:text-sm">📋</span>
              </div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">
                How to Complete This Task
              </h2>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-blue-200">
              <ol className="space-y-3 sm:space-y-4">
                {[
                  "Click a TikTok link below to visit the page (required before upload)",
                  "Like, follow, or engage with the TikTok content",
                  "Take clear screenshots (up to 5) showing your engagement",
                  "Upload all screenshots below to earn Rs 1/= each",
                ].map((step, i) => (
                  <li key={i} className="flex items-start space-x-2 sm:space-x-3">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold mt-0.5 flex-shrink-0">
                      {i + 1}
                    </div>
                    <span className="text-gray-700 font-medium text-sm sm:text-base">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Multiple upload info */}
            <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">!</div>
                <div>
                  <p className="text-purple-800 font-semibold text-sm">Multiple Upload Feature</p>
                  <p className="text-purple-700 text-xs sm:text-sm mt-1">
                    • Upload 1–5 screenshots at once<br />
                    • Earn Rs 1.00 for each unique screenshot<br />
                    • Duplicate screenshots are automatically filtered out
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* TikTok Links Section */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center space-x-3 mb-3 sm:mb-4">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-pink-500 to-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs sm:text-sm">🔗</span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                Step 1 — Visit TikTok Page (Required)
              </h3>
            </div>

            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-4 mb-4">
              <p className="text-yellow-800 text-sm font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                You must click a link below to visit the TikTok page before you can upload screenshots.
              </p>
            </div>

            {linksLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-7 h-7 text-pink-500 animate-spin" />
                <span className="ml-3 text-gray-500 text-sm font-medium">Loading tasks...</span>
              </div>
            ) : tiktokLinks.length === 0 ? (
              <div className="bg-gradient-to-br from-gray-50 to-pink-50 border border-pink-100 rounded-xl p-8 text-center">
                <div className="w-14 h-14 bg-gradient-to-br from-pink-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Music className="w-7 h-7 text-pink-400" />
                </div>
                <p className="text-gray-600 font-semibold">No TikTok tasks available right now</p>
                <p className="text-gray-400 text-sm mt-1">Please check back later — new tasks are added regularly.</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {tiktokLinks.map((link) => {
                  const clicked = clickedLinks[link._id] || 0;
                  return (
                    <div
                      key={link._id}
                      className={`p-4 sm:p-6 rounded-lg sm:rounded-xl border transition-all duration-300 group ${
                        clicked > 0
                          ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-300"
                          : "bg-gradient-to-r from-gray-800 to-black border-gray-700 hover:border-pink-500/40"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-semibold mb-1 text-sm sm:text-base line-clamp-2 ${clicked > 0 ? "text-green-800" : "text-white"}`}>
                            {link.title}
                          </h4>
                          <div className="flex items-center space-x-3">
                            <p className={`text-xs sm:text-sm ${clicked > 0 ? "text-green-700" : "text-gray-400"}`}>
                              Earn{" "}
                              <span className="text-green-500 font-bold">
                                Rs {link.earnings?.toFixed(2) || "1.00"}
                              </span>
                            </p>
                            {clicked > 0 && (
                              <span className="text-xs text-green-600 bg-green-100 border border-green-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle className="w-3 h-3" />
                                Visited
                              </span>
                            )}
                            {link.workLimit > 0 && (
                              <span className="text-xs text-pink-400 bg-pink-500/10 border border-pink-500/20 px-2 py-0.5 rounded-full">
                                {link.totalClicks}/{link.workLimit} slots used
                              </span>
                            )}
                          </div>
                        </div>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => handleLinkClick(link._id)}
                          className={`flex items-center justify-center px-4 sm:px-6 py-2 rounded-lg text-white transition-all duration-200 font-medium text-xs sm:text-sm flex-shrink-0 ${
                            clicked > 0
                              ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                              : "bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 group-hover:scale-105"
                          }`}
                        >
                          {clicked > 0 ? (
                            <>
                              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                              <span>Visit Again</span>
                            </>
                          ) : (
                            <>
                              <span className="hidden sm:inline">Open &amp; Follow</span>
                              <span className="sm:hidden">Open</span>
                              <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                            </>
                          )}
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {hasClickedLink && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-green-700 text-sm font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  ✓ TikTok page visited! You can now upload your screenshots below.
                </p>
              </div>
            )}
          </div>

          {/* Requirements Section */}
          <div className="mb-6 sm:mb-8">
            <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-4 sm:p-6 rounded-lg sm:rounded-xl border border-yellow-300 shadow-sm">
              <div className="flex items-center space-x-3 mb-3 sm:mb-4">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs sm:text-sm">⚠️</span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-yellow-800">Screenshot Requirements</h3>
              </div>
              <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                <ul className="space-y-2 text-yellow-700">
                  {["Must clearly show the liked/followed page", "Must show your profile or browser context"].map(
                    (r, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-xs sm:text-sm">{r}</span>
                      </li>
                    ),
                  )}
                </ul>
                <ul className="space-y-2 text-yellow-700">
                  {["No edited or cropped images", "File size under 5MB • PNG, JPG, JPEG"].map((r, i) => (
                    <li key={i} className="flex items-start space-x-2">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-xs sm:text-sm">{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Upload Section */}
          <div>
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Upload className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <h3 className="text-lg sm:text-2xl font-bold text-gray-800">
                  Step 2 — Upload Screenshots ({files.length}/5)
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

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                {previews.length > 0 ? (
                  <div className="border-2 border-dashed border-green-300 bg-green-50 rounded-xl p-4">
                    {/* File counter */}
                    <div className="mb-4 text-center">
                      <div className="inline-flex items-center bg-white px-4 py-2 rounded-full shadow-sm">
                        <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-2">
                          {files.length}
                        </div>
                        <span className="text-gray-700 font-medium">Screenshots selected</span>
                        <div className="ml-4 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                          Rs {files.length}.00
                        </div>
                      </div>
                    </div>

                    {/* Preview list */}
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
                        <label className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors cursor-pointer font-semibold text-sm">
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
                  <div className="relative border-2 border-dashed border-gray-300 rounded-lg sm:rounded-2xl p-6 sm:p-8 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-300 group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-purple-50/0 group-hover:from-blue-50/30 group-hover:to-purple-50/30 rounded-lg sm:rounded-2xl transition-all duration-300"></div>
                    <div className="relative z-10">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                      </div>
                      <h4 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Drop Your Screenshots Here</h4>
                      <p className="text-gray-600 mb-2 text-sm sm:text-base">
                        Drag and drop or click to browse (up to 5 files)
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
                        Supported formats: PNG, JPG, JPEG (max 5MB each)
                      </p>
                      <label className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl cursor-pointer hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 font-semibold shadow-lg text-sm sm:text-base">
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
                  </div>
                )}

                {error && (
                  <div className="mt-3 sm:mt-4 bg-red-50 border border-red-200 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                    <p className="text-red-600 font-medium flex items-start text-sm sm:text-base">
                      <span className="w-4 h-4 sm:w-5 sm:h-5 bg-red-500 rounded-full flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                        <span className="text-white text-xs">!</span>
                      </span>
                      {error}
                    </p>
                  </div>
                )}
              </div>

              {/* Link not clicked warning */}
              {!hasClickedLink && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <p className="text-yellow-800 text-sm font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    Please click a TikTok link above to visit the page first before submitting.
                  </p>
                </div>
              )}

              <div className="pt-2 sm:pt-4">
                <button
                  type="submit"
                  disabled={!files.length || isSubmitting || !hasClickedLink}
                  className={`w-full py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg transition-all duration-300 transform ${
                    files.length > 0 && hasClickedLink
                      ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:scale-105 hover:shadow-xl"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent"></div>
                      <span>Submitting {files.length} screenshot{files.length !== 1 ? "s" : ""}...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>
                        Submit {files.length} Screenshot{files.length !== 1 ? "s" : ""} &amp; Earn Rs{" "}
                        {files.length}.00
                      </span>
                    </div>
                  )}
                </button>
              </div>

              {showDuplicateModal && (
                <DuplicateWarningModal
                  onClose={() => {
                    setShowDuplicateModal(false);
                    clearAllFiles();
                  }}
                  previousDate={previousSubmissionDate}
                />
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
