"use client";
import { useState } from "react";
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
} from "lucide-react";
import Header from "@/components/Header/Header";
import api from "@/lib/api";
import { useAuth } from "@/Context/AuthContext";
import DuplicateWarningModal from "@/components/DuplicateWarningModal";

export default function InstagramVerificationTask() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [previousSubmissionDate, setPreviousSubmissionDate] = useState("");

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

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileValidation(droppedFile);
    }
  };

  const handleFileValidation = (selectedFile) => {
    const validTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!validTypes.includes(selectedFile.type)) {
      setError("Only JPEG, JPG, and PNG images are allowed");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    setFile(selectedFile);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    handleFileValidation(selectedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !user) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("screenshot", file);
      formData.append("platform", "Instrgram");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("No authentication token found. Please log in again.");
      }

      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        "https://rithu-bl-web-side.vercel.app";

      const response = await fetch(`${apiUrl}/api/instagram`, {
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

        if (errorData.message.includes("too similar")) {
          const dateMatch = errorData.message.match(/\d{1,2}\/\d{1,2}\/\d{4}/);
          setPreviousSubmissionDate(dateMatch ? dateMatch[0] : "previously");
          setShowDuplicateModal(true);
          return;
        }

        throw new Error(errorData.message || "Submission failed");
      }

      const result = await response.json();
      setIsSubmitted(true);
      setTimeout(() => {
        router.push("/Profile/page");
      }, 3000);
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
            <p className="text-purple-100 text-lg font-medium">
              Loading your rewards...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-green-600 to-teal-500 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute w-96 h-96 bg-white/20 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
          <div className="absolute w-96 h-96 bg-white/20 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse delay-1000"></div>
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-yellow-300/30 rounded-full blur-2xl animate-bounce"></div>
          <div className="absolute bottom-1/3 right-1/3 w-24 h-24 bg-pink-300/30 rounded-full blur-2xl animate-bounce delay-500"></div>
        </div>

        <div className="relative z-10 max-w-lg mx-auto p-6 flex items-center min-h-screen">
          <div className="bg-white/95 backdrop-blur-xl p-12 rounded-3xl shadow-2xl text-center w-full border border-white/20 transform animate-scale-in">
            <div className="relative mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-2xl animate-bounce-slow">
                <CheckCircle className="w-16 h-16 text-white" />
              </div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-green-400/30 rounded-full blur-2xl animate-pulse"></div>
              <Sparkles className="absolute top-4 right-1/3 w-6 h-6 text-yellow-400 animate-pulse" />
              <Sparkles className="absolute bottom-4 left-1/3 w-5 h-5 text-pink-400 animate-pulse delay-300" />
            </div>

            <h2 className="text-4xl font-black mb-4 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-500 bg-clip-text text-transparent">
              Amazing! 🎉
            </h2>
            <p className="text-gray-700 mb-3 text-xl font-semibold">
              You've earned{" "}
              <span className="font-black text-green-600 text-2xl">
                Rs 1.00
              </span>
            </p>
            <p className="text-gray-500 text-sm mb-10">
              Your balance has been updated successfully ✨
            </p>

            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl mb-8 border-2 border-green-200 shadow-lg">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Award className="w-6 h-6 text-green-600" />
                <span className="font-bold text-green-800">Keep Going!</span>
              </div>
              <p className="text-sm text-green-700">
                Complete more tasks to increase your earnings
              </p>
            </div>

            <button
              onClick={() => router.push("/Instagram-Verification/page")}
              className="w-full bg-gradient-to-r from-emerald-600 via-green-600 to-teal-500 text-white px-8 py-4 rounded-2xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 font-bold text-lg shadow-lg"
            >
              View Your Earnings
            </button>
          </div>
        </div>
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
                  <span className="font-bold">Rs 1.00 per task</span>
                </div>
                <div className="flex items-center gap-2 bg-gradient-to-r from-green-400 to-emerald-400 text-white rounded-full px-5 py-2.5 shadow-lg">
                  <Zap className="w-5 h-5" />
                  <span className="font-bold">Instant payout</span>
                </div>
                <div className="flex items-center gap-2 bg-gradient-to-r from-blue-400 to-indigo-400 text-white rounded-full px-5 py-2.5 shadow-lg">
                  <TrendingUp className="w-5 h-5" />
                  <span className="font-bold">Unlimited tasks</span>
                </div>
              </div>
            </div>
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
                  <h2 className="text-3xl font-black text-gray-800">
                    Simple Steps to Earn
                  </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-5 mb-10">
                  {[
                    {
                      num: "1",
                      text: "Visit Instagram post",
                      icon: ExternalLink,
                      color: "from-blue-500 to-indigo-500",
                      desc: "Click the link below to open the post",
                    },
                    {
                      num: "2",
                      text: "Like the post",
                      icon: Heart,
                      color: "from-pink-500 to-rose-500",
                      desc: "Tap the heart icon to like the post",
                    },
                    {
                      num: "3",
                      text: "Take screenshot",
                      icon: ImageIcon,
                      color: "from-purple-500 to-violet-500",
                      desc: "Capture your screen showing the liked post",
                    },
                    {
                      num: "4",
                      text: "Upload & earn",
                      icon: Upload,
                      color: "from-green-500 to-emerald-500",
                      desc: "Submit screenshot and get rewarded",
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

                {/* Task Links */}
                <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8 rounded-3xl border-2 border-blue-200 shadow-lg">
                  <h3 className="font-black text-gray-800 mb-6 text-xl flex items-center gap-2">
                    <span className="text-3xl">📱</span>
                    Complete These Tasks
                  </h3>{" "}
                  {/* <div className="space-y-4">
                    <a
                      href="https://www.instagram.com/p/DQrbOG9iHjK/?igsh=ZWU1aG4wdWE0YzV0"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 bg-white p-5 rounded-2xl hover:shadow-xl transition-all duration-300 group border-2 border-transparent hover:border-pink-300 transform hover:-translate-y-1"
                    >
                      <div className="w-14 h-14 bg-gradient-to-br from-pink-500 via-rose-500 to-orange-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                        <Heart className="w-7 h-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <span className="block text-gray-800 font-bold text-lg group-hover:text-pink-600 transition-colors">
                          පොස්ට් ලයික් (Like) කරන්න
                        </span>
                        <span className="block text-gray-500 text-sm mt-1">
                          Post 1 - Click to open
                        </span>
                      </div>
                      <ExternalLink className="w-6 h-6 text-pink-400 group-hover:text-pink-600 transition-colors" />
                    </a>
                  </div>{" "}
                   */}
                  <div className="mt-6 bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 p-6 rounded-2xl shadow-xl">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-black text-white mb-2 text-lg flex items-center gap-2">
                          <Instagram className="w-6 h-6" />
                          Follow Our Main Account
                        </h4>
                        <p className="text-white/90 text-sm">
                          ඉන්ස්ට්‍රග්‍රෑම් එකවුන්ට් එක ෆලෝ කරන්න • 𝐺𝑖ℎ𝑎𝑛𝑖
                          𝐷𝑖𝑙𝑟𝑢𝑘𝑠ℎ𝑖🦋
                        </p>
                      </div>
                      <a
                        href="https://www.instagram.com/gihanyy__?utm_source=qr"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center bg-white text-pink-600 px-6 py-3 rounded-xl hover:bg-pink-50 transition-all duration-200 font-bold shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        Follow Now
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </a>
                    </div>
                  </div>{" "}
                  {/*  */}
                </div>
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
                    "Must clearly show the liked post",
                    "Show your profile or browser context",
                    "No edited or cropped images",
                    "File size under 5MB",
                    "JPEG, PNG formats only",
                    "Clear and readable content",
                  ].map((req, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-amber-200"
                    >
                      <div className="w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">
                        {req}
                      </span>
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
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                    <Upload className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-3xl font-black text-gray-800">
                    Upload Screenshot
                  </h3>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="mb-8">
                    {preview ? (
                      <div className="border-4 border-dashed border-green-400 rounded-3xl p-8 bg-gradient-to-br from-green-50 to-emerald-50 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-green-400/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                        <div className="relative">
                          <img
                            src={preview}
                            alt="Screenshot preview"
                            className="max-h-96 mx-auto rounded-2xl shadow-2xl border-4 border-white"
                          />
                          <div className="absolute top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-xl">
                            <CheckCircle className="w-5 h-5" />
                            Ready to Submit
                          </div>
                        </div>
                        <div className="mt-6 bg-white p-4 rounded-2xl shadow-md">
                          <p className="text-green-700 font-bold text-center flex items-center justify-center gap-2">
                            <FileImage className="w-5 h-5" />
                            {file.name}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setFile(null);
                            setPreview(null);
                          }}
                          className="mt-4 mx-auto block text-sm text-red-600 hover:text-red-800 font-bold hover:underline"
                        >
                          Remove and choose different file
                        </button>
                      </div>
                    ) : (
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`border-4 border-dashed rounded-3xl p-16 text-center bg-gradient-to-br from-gray-50 to-slate-50 transition-all duration-300 ${
                          isDragging
                            ? "border-purple-500 bg-purple-50 scale-105 shadow-2xl"
                            : "border-gray-300 hover:border-purple-400 hover:shadow-xl"
                        }`}
                      >
                        <div className="relative inline-block mb-6">
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl blur-xl opacity-50 animate-pulse"></div>
                          <div className="relative w-24 h-24 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 rounded-3xl flex items-center justify-center shadow-2xl">
                            <Upload className="w-12 h-12 text-white" />
                          </div>
                        </div>
                        <p className="text-gray-800 mb-3 font-black text-2xl">
                          Drop your screenshot here
                        </p>
                        <p className="text-gray-600 mb-4 text-lg font-medium">
                          or click the button below to browse
                        </p>
                        <p className="text-sm text-gray-400 mb-8">
                          Supported: PNG, JPG, JPEG • Max 5MB
                        </p>
                        <label className="inline-block bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white px-10 py-4 rounded-2xl cursor-pointer hover:shadow-2xl transform hover:scale-105 transition-all duration-300 font-bold text-lg shadow-lg">
                          Choose File
                          <input
                            type="file"
                            accept=".png,.jpg,.jpeg"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}

                    {error && (
                      <div className="mt-6 p-5 bg-red-50 border-l-4 border-red-500 rounded-2xl shadow-lg">
                        <p className="text-sm text-red-700 font-bold">
                          {error}
                        </p>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={!file || isSubmitting}
                    className={`w-full py-5 rounded-2xl font-black text-xl transition-all duration-300 shadow-xl ${
                      file
                        ? "bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 text-white hover:shadow-2xl transform hover:scale-105"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-3">
                        <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                        Submitting...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-3">
                        <Upload className="w-6 h-6" />
                        Submit Screenshot & Earn Rs 1.00
                        <Sparkles className="w-6 h-6" />
                      </span>
                    )}
                  </button>
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

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
        @keyframes float-delayed {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(20px);
          }
        }
        @keyframes scale-in {
          0% {
            transform: scale(0.9);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        .animate-scale-in {
          animation: scale-in 0.5s ease-out;
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        .delay-300 {
          animation-delay: 300ms;
        }
        .delay-700 {
          animation-delay: 700ms;
        }
      `}</style>
    </div>
  );
}
