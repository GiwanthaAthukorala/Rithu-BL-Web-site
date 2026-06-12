"use client";
import Header from "@/components/Header/Header";
import Link from "next/link";
import {
  Facebook,
  Instagram,
  Youtube,
  MessageCircle,
  Video,
  Star,
  DollarSign,
  CheckCircle,
  Zap,
  TrendingUp,
  Shield,
  Clock,
} from "lucide-react";

export default function Platforms() {
  const platforms = [
    {
      name: "Facebook",
      description:
        "Earn money by liking Facebook pages, posts, and following accounts",
      rate: "Rs 1/= per like/follow",
      icon: Facebook,
      color: "from-blue-500 to-blue-600",
      tasks: ["Page Likes", "Post Likes", "Page Follows", "Reviews"],
      earnings: "Up to Rs 100 per day",
      link: "/facebook-verification/page",
    },
    {
      name: "Instagram",
      description: "Get paid for liking Instagram posts and following accounts",
      rate: "Rs 1/= per like/follow",
      icon: Instagram,
      color: "from-purple-500 via-pink-500 to-orange-500",
      tasks: ["Post Likes", "Account Follows", "Reel Likes"],
      earnings: "Up to Rs 80 per day",
      link: "/Instagram-Verification/page",
    },
    {
      name: "YouTube",
      description:
        "Earn by watching videos, liking, and subscribing to channels",
      rate: "Rs 2/= per video watch",
      icon: Youtube,
      color: "from-red-500 to-red-600",
      tasks: ["Video Likes", "Channel Subscriptions", "Comments"],
      earnings: "Up to Rs 150 per day",
      link: "/Youtube-Verification/page",
    },
    {
      name: "TikTok",
      description: "Monetize your TikTok engagement with likes and follows",
      rate: "Rs 1/= per like/follow",
      icon: MessageCircle,
      color: "from-pink-500 to-purple-600",
      tasks: ["Video Likes", "Account Follows", "Comments"],
      earnings: "Up to Rs 90 per day",
      link: "/Tiktok-Verification/page",
    },
    {
      name: "Google Review",
      description: "Earn by writing genuine reviews for businesses",
      rate: "Rs 40/= per review",
      icon: Star,
      color: "from-green-500 to-blue-500",
      tasks: ["Business Reviews", "Rating Updates"],
      earnings: "Up to Rs 200 per day",
      link: "/Google-Review/pages",
    },
    {
      name: "Comment Section",
      description: "Get paid for engaging comments on social media posts",
      rate: "Rs 15/= per comment",
      icon: MessageCircle,
      color: "from-indigo-500 to-purple-600",
      tasks: ["Facebook Comments", "Post Comments"],
      earnings: "Up to Rs 120 per day",
      link: "/FacebookCommentPage/page",
    },
    {
      name: "Video Watching",
      description: "Earn by watching videos and providing feedback",
      rate: "Rs 1/= per minute watched",
      icon: Video,
      color: "from-cyan-500 to-blue-600",
      tasks: ["Video Views", "Watch Time"],
      earnings: "Up to Rs 100 per day",
      link: "/Video/page",
    },
  ];

  const features = [
    {
      icon: DollarSign,
      title: "High Earnings",
      description: "Competitive rates across all platforms",
    },
    {
      icon: CheckCircle,
      title: "Instant Approval",
      description: "Quick verification and payout",
    },
    {
      icon: Zap,
      title: "Real-Time Tracking",
      description: "Monitor earnings live",
    },
    {
      icon: TrendingUp,
      title: "Unlimited Tasks",
      description: "No daily limits",
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description: "Bank-level security",
    },
    {
      icon: Clock,
      title: "24/7 Availability",
      description: "Work anytime, anywhere",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      <Header />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full text-sm font-semibold mb-6">
              🚀 Multiple Platforms Available
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Choose Your{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Earning
              </span>{" "}
              Platforms
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
              Connect to multiple social media platforms and maximize your
              earnings. Each platform offers unique tasks with competitive
              payouts.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="text-3xl font-bold text-blue-600">7+</div>
                <div className="text-sm text-gray-600">Platforms</div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="text-3xl font-bold text-green-600">Rs 1/=</div>
                <div className="text-sm text-gray-600">Min Rate</div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="text-3xl font-bold text-purple-600">500+</div>
                <div className="text-sm text-gray-600">Daily Tasks</div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-lg">
                <div className="text-3xl font-bold text-amber-600">24/7</div>
                <div className="text-sm text-gray-600">Available</div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-xl"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">
                  {feature.title}
                </h4>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Platform Cards */}
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 mb-16">
            {platforms.map((platform, index) => (
              <div
                key={index}
                className={`group bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-transparent hover:border-blue-200 transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-2`}
              >
                {/* Platform Header */}
                <div
                  className={`bg-gradient-to-br ${platform.color} p-8 relative overflow-hidden`}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-12 -mb-12"></div>

                  <div className="relative z-10 flex items-center space-x-4">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <platform.icon className="w-10 h-10 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">
                        {platform.name}
                      </h3>
                      <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full inline-block mt-2">
                        <span className="text-white font-bold">
                          {platform.rate}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Platform Content */}
                <div className="p-6">
                  <p className="text-gray-600 mb-6">{platform.description}</p>

                  {/* Tasks */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-500 mb-3">
                      AVAILABLE TASKS
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {platform.tasks.map((task, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full font-medium"
                        >
                          {task}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Earnings */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl">
                      <div>
                        <div className="text-sm text-gray-500">
                          Daily Potential
                        </div>
                        <div className="text-xl font-bold text-gray-900">
                          {platform.earnings}
                        </div>
                      </div>
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-green-600" />
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Link href={platform.link}>
                    <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-xl font-bold hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                      Start Earning
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Earnings Calculator */}
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-16">
            <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">
              Earnings Calculator
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Platform
                  </label>
                  <select className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>Facebook (Rs 1/= per like)</option>
                    <option>Instagram (Rs 1/= per like)</option>
                    <option>YouTube (Rs 2/= per view)</option>
                    <option>Google Review (Rs 40/= per review)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tasks Per Day
                  </label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="10"
                      max="100"
                      step="10"
                      defaultValue="50"
                      className="flex-1"
                    />
                    <span className="text-lg font-bold text-blue-600">50</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Days Per Week
                  </label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5, 6, 7].map((day) => (
                      <button
                        key={day}
                        className={`px-4 py-2 rounded-lg ${
                          day === 5
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 flex flex-col justify-center">
                <div className="text-center mb-6">
                  <div className="text-sm text-gray-500 mb-2">
                    Estimated Monthly Earnings
                  </div>
                  <div className="text-5xl font-bold text-blue-600">
                    Rs 6,000
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Daily Earnings:</span>
                    <span className="font-semibold">Rs 200</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Weekly Earnings:</span>
                    <span className="font-semibold">Rs 1,400</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tasks Completed:</span>
                    <span className="font-semibold">1,000</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl p-12 shadow-xl">
              <h2 className="text-3xl font-bold text-white mb-4">
                Maximize Your Earnings
              </h2>
              <p className="text-purple-100 mb-8 max-w-2xl mx-auto">
                Connect to all platforms and complete unlimited tasks. The more
                you engage, the more you earn!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/Sign-up/page"
                  className="inline-flex items-center justify-center bg-white text-purple-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-lg"
                >
                  Connect All Platforms
                </a>
                <a
                  href="/how-it-works"
                  className="inline-flex items-center justify-center bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-colors"
                >
                  Learn How It Works
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
