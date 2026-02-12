"use client";
import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SupportedPlatforms = () => {
  const router = useRouter();

  const platforms = [
    {
      name: "Facebook",
      description:
        "Connect your profile and pages to earn from likes on your posts.",
      rate: "Rs 1/= like or following • In one screenshot",
      icon: "/facebook.png",
      link: "/facebook-verification/page",
      gradient: "from-blue-500 to-blue-600",
      shadow: "hover:shadow-blue-200",
    },
    {
      name: "TikTok",
      description: "Earn money from likes on your videos and trending content.",
      rate: "Rs 1/= like • TikTok In one screenshot",
      icon: "/Tiktok.png",
      link: "/Tiktok-Verification/page",
      gradient: "from-pink-500 to-purple-600",
      shadow: "hover:shadow-pink-200",
    },
    {
      name: "Instagram",
      description:
        "Link your account and monetize likes on your photos and reels.",
      rate: "Rs 1/= like • Instant payouts",
      icon: "/instragrma.png",
      link: "/Instagram-Verification/page",
      gradient: "from-purple-500 via-pink-500 to-orange-500",
      shadow: "hover:shadow-purple-200",
    },
    {
      name: "YouTube",
      description: "Get paid for likes on your videos and subscribers.",
      rate: "Rs 2/= • YouTube payouts",
      icon: "/youtube.png",
      link: "/Youtube-Verification/page",
      gradient: "from-red-500 to-red-600",
      shadow: "hover:shadow-red-200",
    },
    {
      name: "Google Review",
      description:
        "The content of a Google review itself or a caption used to prompt customers to leave review.",
      rate: "Rs 40/= like • Google Review payouts",
      icon: "/google.png",
      link: "/Google-Review/pages",
      gradient: "from-green-500 to-blue-500",
      shadow: "hover:shadow-green-200",
    },
    {
      name: "Comment Section",
      description: "Comment in Post",
      rate: "Rs 15/= Comment Section",
      icon: "/comment.png",
      link: "/FacebookCommentPage/page",
      gradient: "from-indigo-500 to-purple-600",
      shadow: "hover:shadow-indigo-200",
    },
    {
      name: "Videos Watching",
      description: "The Video play a 1 minute give the Rs 1/=",
      rate: "Rs 1/= watching • Watching payouts",
      icon: "/video.png",
      link: "/Video/page",
      gradient: "from-cyan-500 to-blue-600",
      shadow: "hover:shadow-cyan-200",
    },
    {
      name: "Facebook Page Review Section",
      description:
        "Page Review Rs 30/= after Page Like or Follow and Rs 30/= after Review",
      rate: "Rs 30/= Page Review Section",
      icon: "/video.png",
      link: "/FbPageReview/pages",
      gradient: "from-cyan-500 to-blue-600",
      shadow: "hover:shadow-cyan-200",
    },
  ];

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-lg">
              🚀 Multi-Platform Monetization
            </span>
          </div>
          <h2 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
            Task Platforms
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
            Connect all your social media accounts and maximize your earnings
            across every platform with instant payouts and real-time tracking.
          </p>
        </div>

        {/* Platform Cards Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 mb-16">
          {platforms.map((platform, index) => (
            <Link href={platform.link} key={platform.name}>
              <div
                className={`group cursor-pointer bg-white rounded-2xl p-6 border border-gray-100 hover:border-transparent ${platform.shadow} hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2`}
              >
                {/* Icon and Title */}
                <div className="flex items-center mb-5">
                  <div
                    className={`w-16 h-16 rounded-xl bg-gradient-to-br ${platform.gradient} p-0.5 mr-4 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <div className="w-full h-full bg-white rounded-xl flex items-center justify-center overflow-hidden p-2">
                      <img
                        src={platform.icon}
                        alt={`${platform.name} Icon`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text transition-all duration-300">
                    {platform.name}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-gray-700 font-medium mb-5 text-base leading-relaxed min-h-[60px]">
                  {platform.description}
                </p>

                {/* Rate Badge */}
                <div
                  className={`inline-block bg-gradient-to-r ${platform.gradient} text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-md`}
                >
                  {platform.rate}
                </div>

                {/* Hover Arrow Indicator */}
                <div className="mt-4 flex items-center text-blue-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-sm">Connect Now</span>
                  <svg
                    className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <button className="group relative bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold px-10 py-4 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden">
            <span className="relative z-10 flex items-center justify-center">
              Connect Your Accounts
              <svg
                className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
          <p className="mt-4 text-sm text-gray-500">
            ✨ Start earning in minutes • No hidden fees • Secure & verified
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
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
      `}</style>
    </section>
  );
};

export default SupportedPlatforms;
