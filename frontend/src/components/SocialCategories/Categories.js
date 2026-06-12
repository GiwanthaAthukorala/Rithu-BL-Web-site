"use client";
import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SupportedPlatforms = () => {
  const router = useRouter();

  const platforms = [
    {
      name: "Facebook Likes",
      description:
        "Connect your profile and pages to earn from likes on your posts.",
      rate: "Rs 1/= Per Like • Simple Proof",
      icon: "/facebook.png",
      link: "/facebook-verification/page",
      gradient: "from-blue-600 to-indigo-600",
      shadow: "hover:shadow-blue-100",
    },
    {
      name: "TikTok Hearts",
      description: "Earn money from likes on your videos and trending content.",
      rate: "Rs 1/= Per Like • Instant Verification",
      icon: "/Tiktok.png",
      link: "/Tiktok-Verification/page",
      gradient: "from-slate-950 via-pink-600 to-rose-500",
      shadow: "hover:shadow-pink-100",
    },
    {
      name: "Instagram Engagement",
      description:
        "Link your account and monetize likes on your photos and reels.",
      rate: "Rs 1/= Per Like • Automated Tracking",
      icon: "/instragrma.png",
      link: "/Instagram-Verification/page",
      gradient: "from-purple-600 via-pink-500 to-amber-500",
      shadow: "hover:shadow-purple-100",
    },
    {
      name: "YouTube Watching",
      description: "Get paid for likes on your videos and subscribers.",
      rate: "Rs 2/= Per Subscriber/Like",
      icon: "/youtube.png",
      link: "/Youtube-Verification/page",
      gradient: "from-red-600 to-rose-600",
      shadow: "hover:shadow-red-100",
    },
    {
      name: "Google Reviews",
      description:
        "Submit honest business reviews or write descriptive customer reviews.",
      rate: "Rs 40/= Per Review • Premium Task",
      icon: "/google.png",
      link: "/Google-Review/pages",
      gradient: "from-emerald-500 to-blue-600",
      shadow: "hover:shadow-emerald-100",
    },
    {
      name: "Comment System",
      description: "Post meaningful comments under selected campaign posts.",
      rate: "Rs 15/= Per Comment • Daily Payouts",
      icon: "/comment.png",
      link: "/FacebookCommentPage/page",
      gradient: "from-indigo-600 via-purple-600 to-brand-500",
      shadow: "hover:shadow-indigo-100",
    },
    {
      name: "Videos Watching",
      description: "Watch selected engaging video clips for 1 minute or more.",
      rate: "Rs 1/= Per Min • Multi-Watch",
      icon: "/video.png",
      link: "/Video/page",
      gradient: "from-cyan-500 to-brand-600",
      shadow: "hover:shadow-cyan-100",
    },
    {
      name: "FB Page Reviews",
      description:
        "Like or follow pages, write recommendations, and earn dual rewards.",
      rate: "Rs 30/= Per Review/Like Section",
      icon: "/video.png", // reusing video icon as fallback
      link: "/FbPageReview/pages",
      gradient: "from-teal-500 to-brand-600",
      shadow: "hover:shadow-teal-100",
    },
  ];

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-slate-50 via-white to-slate-50 relative overflow-hidden font-sans border-t border-slate-100">
      {/* Soft branding background glow orbs */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-brand-400/15 rounded-full blur-3xl opacity-40 animate-blob animation-delay-2000"></div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-20">
          <div className="inline-block mb-4">
            <span className="bg-gradient-to-r from-primary-600 to-brand-500 text-white text-xs font-bold px-4 py-2 rounded-full shadow-md shadow-primary-200/50 uppercase tracking-wider">
              🚀 Premium Monetization Hub
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-4 bg-gradient-to-r from-slate-900 via-primary-950 to-brand-900 bg-clip-text text-transparent tracking-tight">
            Available Platforms & Tasks
          </h2>
          <p className="text-slate-500 text-base sm:text-lg max-w-2xl mx-auto font-medium">
            Connect your accounts and multiply your income streams by performing simple, high-reward tasks across Sri Lanka's largest social gig network.
          </p>
        </div>

        {/* Platform Cards Grid */}
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-20">
          {platforms.map((platform) => (
            <Link href={platform.link} key={platform.name} className="block group">
              <div
                className={`h-full bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-slate-200/60 hover:border-primary-450/40 shadow-sm ${platform.shadow} hover:shadow-xl hover:shadow-primary-100/40 transition-all duration-350 transform hover:-translate-y-1.5 flex flex-col justify-between`}
              >
                <div>
                  {/* Icon and Title */}
                  <div className="flex items-center mb-5">
                    <div
                      className={`w-14 h-14 rounded-xl bg-gradient-to-br ${platform.gradient} p-0.5 mr-4 group-hover:scale-105 transition-transform duration-300 shadow-sm`}
                    >
                      <div className="w-full h-full bg-white rounded-xl flex items-center justify-center overflow-hidden p-2">
                        <img
                          src={platform.icon}
                          alt={`${platform.name} Icon`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 group-hover:text-primary-600 transition-colors duration-300 leading-tight">
                      {platform.name}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-slate-500 font-semibold mb-6 text-sm leading-relaxed min-h-[55px]">
                    {platform.description}
                  </p>
                </div>

                <div>
                  {/* Rate Badge */}
                  <div
                    className={`inline-block bg-gradient-to-r ${platform.gradient} text-white text-[11px] font-extrabold px-3.5 py-1.5 rounded-lg shadow-sm tracking-wide`}
                  >
                    {platform.rate}
                  </div>

                  {/* Hover Arrow Indicator */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-primary-600 font-bold opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <span className="text-xs">Go to Tasks</span>
                    <svg
                      className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <button className="group relative bg-gradient-to-r from-primary-600 to-brand-600 hover:from-primary-700 hover:to-brand-700 text-white font-bold px-10 py-4.5 rounded-2xl shadow-lg shadow-primary-200/50 hover:shadow-primary-350/60 transition-all duration-300 transform hover:-translate-y-0.5 overflow-hidden">
            <span className="relative z-10 flex items-center justify-center text-base">
              Link Your Social Accounts
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
            <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-primary-650 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
          <p className="mt-4 text-xs text-slate-400 font-medium">
            ✨ Standard verification • Instant payouts to local banks • Zero start cost
          </p>
        </div>
      </div>
    </section>
  );
};

export default SupportedPlatforms;
