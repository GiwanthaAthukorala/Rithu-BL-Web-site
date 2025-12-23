"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  ExternalLink,
  CheckCircle,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
import Header from "@/components/Header/Header";
import api from "@/lib/api";
import { useAuth } from "@/Context/AuthContext";
import DuplicateWarningModal from "@/components/DuplicateWarningModal";

export default function TikTokVerificationTask() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [previousSubmissionDate, setPreviousSubmissionDate] = useState("");

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !user) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("screenshot", file);
      formData.append("platform", "Tiktok");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }

      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://rithu-bl-web-side.vercel.app";
      console.log("Submitting to:", `${apiUrl}/api/tiktok`);
      console.log("Token exists:", !!token);
      const response = await fetch(`${apiUrl}/api/tiktok`, {
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

        // Handle duplicate image case specifically
        if (errorData.message.includes("too similar")) {
          const dateMatch = errorData.message.match(/\d{1,2}\/\d{1,2}\/\d{4}/);
          setPreviousSubmissionDate(dateMatch ? dateMatch[0] : "previously");
          setShowDuplicateModal(true);
          return;
        }

        throw new Error(errorData.message || "Submission failed");
      }

      const result = await response.json();
      console.log("Success response : ", result);

      setIsSubmitted(true);
      setTimeout(() => {
        router.push("/Profile/page");
      }, 1000);
      router.push("/Profile/page");
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

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
        <Header />
        <div className="max-w-md mx-auto p-4 sm:p-6 min-h-screen flex items-center">
          <div className="bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-xl border border-green-200 text-center w-full">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-700 fill-current" />
              </div>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Submission Successful!
            </h2>
            <p className="text-gray-600 mb-4 sm:mb-6 text-base sm:text-lg">
              🎉 You've earned{" "}
              <span className="font-bold text-green-600">Rs 1/=</span>
              <br />
              Your balance has been updated.
            </p>
            <button
              onClick={() => router.push("/Tiktok-Verification/page")}
              className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg font-semibold text-sm sm:text-base"
            >
              View Your Earnings
            </button>
          </div>
        </div>
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
                    Complete tasks • Earn rewards
                  </p>
                </div>
              </div>

              <div className="text-center sm:text-right">
                <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl shadow-lg">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="font-bold text-lg sm:text-xl">
                      Rs 1.00/=
                    </span>
                  </div>
                  <p className="text-green-100 text-xs sm:text-sm">
                    per verification
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-4 sm:mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-4 text-center border border-white/20">
                <Star className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-400 mx-auto mb-1 sm:mb-2" />
                <div className="text-white font-semibold text-xs sm:text-sm">
                  Easy Tasks
                </div>
                <div className="text-gray-300 text-xs sm:text-sm">
                  Simple & Quick
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-4 text-center border border-white/20">
                <Users className="w-4 h-4 sm:w-6 sm:h-6 text-blue-400 mx-auto mb-1 sm:mb-2" />
                <div className="text-white font-semibold text-xs sm:text-sm">
                  Join Community
                </div>
                <div className="text-gray-300 text-xs sm:text-sm">
                  Connect & Earn
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2 sm:p-4 text-center border border-white/20">
                <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6 text-green-400 mx-auto mb-1 sm:mb-2" />
                <div className="text-white font-semibold text-xs sm:text-sm">
                  Instant Rewards
                </div>
                <div className="text-gray-300 text-xs sm:text-sm">
                  Fast Payments
                </div>
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
                <span className="text-white font-bold text-xs sm:text-sm">
                  📋
                </span>
              </div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800">
                How to Complete This Task
              </h2>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-blue-200">
              <ol className="space-y-3 sm:space-y-4">
                <li className="flex items-start space-x-2 sm:space-x-3">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold mt-0.5 flex-shrink-0">
                    1
                  </div>
                  <span className="text-gray-700 font-medium text-sm sm:text-base">
                    Visit our TikTok page using the links below
                  </span>
                </li>
                <li className="flex items-start space-x-2 sm:space-x-3">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold mt-0.5 flex-shrink-0">
                    2
                  </div>
                  <span className="text-gray-700 font-medium text-sm sm:text-base">
                    Like, follow, or engage with our content
                  </span>
                </li>
                <li className="flex items-start space-x-2 sm:space-x-3">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold mt-0.5 flex-shrink-0">
                    3
                  </div>
                  <span className="text-gray-700 font-medium text-sm sm:text-base">
                    Take a clear screenshot showing your engagement
                  </span>
                </li>
                <li className="flex items-start space-x-2 sm:space-x-3">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold mt-0.5 flex-shrink-0">
                    4
                  </div>
                  <span className="text-gray-700 font-medium text-sm sm:text-base">
                    Upload the screenshot below to earn Rs 1/=
                  </span>
                </li>
              </ol>
            </div>
          </div>

          {/* TikTok Links Section */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center space-x-3 mb-3 sm:mb-4">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-pink-500 to-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs sm:text-sm">
                  🔗
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                TikTok Links
              </h3>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {/** <div className="bg-gradient-to-r from-gray-800 to-black p-4 sm:p-6 rounded-lg sm:rounded-xl border border-gray-300 hover:shadow-lg transition-all duration-300 group">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white mb-1 text-sm sm:text-base">
                      Follow Our Main Account -ටික් ටොක් එකව්න්ට් එක ෆලෝ කරන්න
                    </h4>
                    <p className="text-gray-300 text-xs sm:text-sm">
                      azendra_resort Azendra Resort
                    </p>
                  </div>
                  <a
                    href="https://vt.tiktok.com/ZSPpg2nLr/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center bg-gradient-to-r from-pink-500 to-red-500 text-white px-4 sm:px-6 py-2 rounded-lg hover:from-pink-600 hover:to-red-600 transition-all duration-200 font-medium group-hover:scale-105 text-xs sm:text-sm"
                  >
                    <span className="hidden sm:inline">
                      Follow Now - ටික් ටොක් එකව්න්ට් එක ෆලෝ කරන්න
                    </span>
                    <span className="sm:hidden">Follow Now</span>
                    <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                  </a>
                </div>{" "}
            
              </div>   */}
              {/** <div className="bg-gradient-to-r from-gray-800 to-black p-4 sm:p-6 rounded-lg sm:rounded-xl border border-gray-300 hover:shadow-lg transition-all duration-300 group">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white mb-1 text-sm sm:text-base">
                      Follow Our Main Account -ටික් ටොක් එකව්න්ට් එක ෆලෝ කරන්න
                    </h4>
                    <p className="text-gray-300 text-xs sm:text-sm">
                      azendra_resort Azendra Resort - Join our community
                    </p>
                  </div>
                  <a
                    href="https://www.tiktok.com/@azendra_resort?is_from_webapp=1&sender_device=pc"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center bg-gradient-to-r from-pink-500 to-red-500 text-white px-4 sm:px-6 py-2 rounded-lg hover:from-pink-600 hover:to-red-600 transition-all duration-200 font-medium group-hover:scale-105 text-xs sm:text-sm"
                  >
                    <span className="hidden sm:inline">
                      Follow Now - ටික් ටොක් එකව්න්ට් එක ෆලෝ කරන්න
                    </span>
                    <span className="sm:hidden">Follow Now</span>
                    <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                  </a>
                </div>
              </div>
           */}
              {/* Video Links */}
              <div className="grid gap-3 sm:gap-4">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-purple-200 hover:shadow-md transition-all duration-300 group">
                  <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">
                    Like Video #1 - ටික් ටොක් විඩියෝ එකට ලයික් කරන්න
                  </h4>
                  <a
                    href="https://vt.tiktok.com/ZSPGR6edE/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium group-hover:underline text-xs sm:text-sm"
                  >
                    <span className="hidden sm:inline">
                      Watch & Like - ටික් ටොක් විඩියෝ එකට ලයික් කරන්න
                    </span>
                    <span className="sm:hidden">Watch & Like</span>
                    <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                  </a>
                </div>
              </div>
              {/* <div className="grid gap-3 sm:gap-4">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-purple-200 hover:shadow-md transition-all duration-300 group">
                  <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">
                    Like Video #1 - ටික් ටොක් විඩියෝ එකට ලයික් කරන්න
                  </h4>
                  <a
                    href="https://vt.tiktok.com/ZSf5jDo1Q/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium group-hover:underline text-xs sm:text-sm"
                  >
                    <span className="hidden sm:inline">
                      Watch & Like - ටික් ටොක් විඩියෝ එකට ලයික් කරන්න
                    </span>
                    <span className="sm:hidden">Watch & Like</span>
                    <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                  </a>
                </div>
              </div>{" "}
           <div className="grid gap-3 sm:gap-4">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-purple-200 hover:shadow-md transition-all duration-300 group">
                  <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">
                    Like Video #1 - ටික් ටොක් විඩියෝ එකට ලයික් කරන්න
                  </h4>
                  <a
                    href="https://vt.tiktok.com/ZSfd2GsuQ/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium group-hover:underline text-xs sm:text-sm"
                  >
                    <span className="hidden sm:inline">
                      Watch & Like - ටික් ටොක් විඩියෝ එකට ලයික් කරන්න
                    </span>
                    <span className="sm:hidden">Watch & Like</span>
                    <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                  </a>
                </div>
              </div>{" "}   
              <div className="grid gap-3 sm:gap-4">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-3 sm:p-4 rounded-lg sm:rounded-xl border border-purple-200 hover:shadow-md transition-all duration-300 group">
                  <h4 className="font-semibold text-gray-800 mb-2 text-sm sm:text-base">
                    Like Video #1 - ටික් ටොක් විඩියෝ එකට ලයික් කරන්න
                  </h4>
                  <a
                    href="https://vt.tiktok.com/ZSfo3Brdo/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium group-hover:underline text-xs sm:text-sm"
                  >
                    <span className="hidden sm:inline">
                      Watch & Like - ටික් ටොක් විඩියෝ එකට ලයික් කරන්න
                    </span>
                    <span className="sm:hidden">Watch & Like</span>
                    <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4 ml-1" />
                  </a>
                </div>
              </div>{" "}
            </div>*/}
            </div>

            {/* Requirements Section */}
            <div className="mb-6 sm:mb-8">
              <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-4 sm:p-6 rounded-lg sm:rounded-xl border border-yellow-300 shadow-sm">
                <div className="flex items-center space-x-3 mb-3 sm:mb-4">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-xs sm:text-sm">
                      ⚠️
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-yellow-800">
                    Screenshot Requirements
                  </h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                  <ul className="space-y-2 text-yellow-700">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-xs sm:text-sm">
                        Must clearly show the liked/followed page
                      </span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-xs sm:text-sm">
                        Must show your profile or browser context
                      </span>
                    </li>
                  </ul>
                  <ul className="space-y-2 text-yellow-700">
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-xs sm:text-sm">
                        No edited or cropped images
                      </span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-xs sm:text-sm">
                        File size under 5MB
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Upload Section */}
            <div>
              <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Upload className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <h3 className="text-lg sm:text-2xl font-bold text-gray-800">
                  Upload Your Screenshot
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                    Screenshot File
                  </label>

                  {preview ? (
                    <div className="relative bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg sm:rounded-2xl p-4 sm:p-6 text-center group hover:from-green-100 hover:to-emerald-100 transition-all duration-300">
                      <div className="relative inline-block">
                        <img
                          src={preview}
                          alt="Screenshot preview"
                          className="max-h-60 sm:max-h-80 w-full sm:w-auto mx-auto mb-3 sm:mb-4 rounded-lg sm:rounded-xl shadow-lg border-2 sm:border-4 border-white object-contain"
                        />
                        <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
                        </div>
                      </div>
                      <p className="text-green-700 font-semibold text-base sm:text-lg break-all">
                        {file.name}
                      </p>
                      <p className="text-green-600 text-sm mb-3 sm:mb-4">
                        Ready to submit!
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setFile(null);
                          setPreview(null);
                        }}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200 font-medium text-sm"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <div className="relative border-2 border-dashed border-gray-300 rounded-lg sm:rounded-2xl p-6 sm:p-8 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-300 group">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 to-purple-50/0 group-hover:from-blue-50/30 group-hover:to-purple-50/30 rounded-lg sm:rounded-2xl transition-all duration-300"></div>
                      <div className="relative z-10">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                          <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                        </div>
                        <h4 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">
                          Drop Your Screenshot Here
                        </h4>
                        <p className="text-gray-600 mb-2 text-sm sm:text-base">
                          Drag and drop your screenshot or click to browse
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-6">
                          Supported formats: PNG, JPG, JPEG (max 5MB)
                        </p>
                        <label className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg sm:rounded-xl cursor-pointer hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 font-semibold shadow-lg text-sm sm:text-base">
                          Choose File
                          <input
                            type="file"
                            accept=".png,.jpg,.jpeg"
                            onChange={handleFileChange}
                            className="hidden"
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

                <div className="pt-2 sm:pt-4">
                  <button
                    type="submit"
                    disabled={!file || isSubmitting}
                    className={`w-full py-3 sm:py-4 rounded-lg sm:rounded-xl font-bold text-base sm:text-lg transition-all duration-300 transform ${
                      file
                        ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg hover:scale-105 hover:shadow-xl"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent"></div>
                        <span>Submitting...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="hidden sm:inline">
                          Submit Screenshot & Earn Rs 1/=
                        </span>
                        <span className="sm:hidden">Submit & Earn Rs 1/=</span>
                      </div>
                    )}
                  </button>
                </div>

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
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
