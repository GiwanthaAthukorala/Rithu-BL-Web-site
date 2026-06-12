"use client";
import Header from "@/components/Header/Header";
import {
  CheckCircle,
  ArrowRight,
  Rocket,
  TrendingUp,
  Shield,
  Zap,
  Clock,
  DollarSign,
} from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Sign Up & Connect",
      description:
        "Create your free account and connect your social media profiles in seconds",
      icon: Rocket,
      color: "from-blue-500 to-blue-600",
    },
    {
      number: "02",
      title: "Complete Simple Tasks",
      description:
        "Like, follow, comment or watch content as per the instructions",
      icon: CheckCircle,
      color: "from-green-500 to-emerald-600",
    },
    {
      number: "03",
      title: "Submit Proof",
      description: "Upload screenshots showing your completed tasks",
      icon: Shield,
      color: "from-purple-500 to-purple-600",
    },
    {
      number: "04",
      title: "Get Paid Instantly",
      description: "Receive Rs 1 per like directly to your bank account",
      icon: DollarSign,
      color: "from-amber-500 to-orange-600",
    },
  ];

  const features = [
    {
      icon: Clock,
      title: "Real-Time Tracking",
      description: "Monitor your earnings as you complete tasks",
    },
    {
      icon: TrendingUp,
      title: "Multiple Platforms",
      description: "Earn from Facebook, Instagram, TikTok, YouTube & more",
    },
    {
      icon: Shield,
      title: "100% Secure",
      description: "Bank-level security for all your transactions",
    },
    {
      icon: Zap,
      title: "Instant Payouts",
      description: "Withdraw earnings anytime, no minimum balance",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <Header />

      {/* Hero Section */}
      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Start{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Earning
              </span>{" "}
              in Minutes
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of users who earn money by simply engaging with
              social media content. No special skills required!
            </p>
          </div>

          {/* Steps Section */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {steps.map((step, index) => (
              <div key={index} className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-100 rounded-2xl transform group-hover:scale-105 transition-all duration-300 shadow-lg group-hover:shadow-xl"></div>
                <div className="relative p-8 rounded-2xl">
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}
                  >
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute top-6 right-6 text-5xl font-bold text-gray-200/50">
                    {step.number}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Detailed Steps */}
          <div className="bg-white rounded-3xl shadow-xl p-8 mb-16">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
              How It Works in Detail
            </h2>
            <div className="space-y-12">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1">
                  <div className="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">
                    Step 1
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Register Your Account
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Sign up with your email and verify your account. Complete
                    your profile with bank details for seamless withdrawals.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      Email verification required
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      Add bank account for payments
                    </li>
                    <li className="flex items-center text-gray-700">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                      Get instant access to tasks
                    </li>
                  </ul>
                </div>
                <div className="flex-1">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8">
                    <img
                      src="/signup-demo.svg"
                      alt="Sign Up Demo"
                      className="w-full h-auto"
                      onError={(e) => {
                        e.target.src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23e0f2fe'/%3E%3Ctext x='200' y='150' text-anchor='middle' fill='%230ea5e9' font-family='Arial' font-size='20'%3ESign Up Form%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row-reverse items-center gap-8">
                <div className="flex-1">
                  <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold mb-4">
                    Step 2
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Complete Tasks
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Choose from various social media platforms and complete
                    simple tasks:
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="text-2xl font-bold text-blue-600">
                        Rs 1/=
                      </div>
                      <div className="text-sm text-gray-600">
                        Per Facebook Like
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <div className="text-2xl font-bold text-pink-600">
                        Rs 1/=
                      </div>
                      <div className="text-sm text-gray-600">
                        Per Instagram Like
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-8">
                    <img
                      src="/tasks-demo.svg"
                      alt="Tasks Demo"
                      className="w-full h-auto"
                      onError={(e) => {
                        e.target.src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23d1fae5'/%3E%3Ctext x='200' y='150' text-anchor='middle' fill='%2310b981' font-family='Arial' font-size='20'%3ETasks Dashboard%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-1">
                  <div className="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold mb-4">
                    Step 3
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Upload & Verify
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Upload clear screenshots showing your completed tasks. Our
                    system verifies submissions in real-time.
                  </p>
                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
                    <p className="text-sm text-yellow-800 font-medium">
                      💡 Pro Tip: Make sure screenshots clearly show the
                      liked/followed content for faster approval
                    </p>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-8">
                    <img
                      src="/upload-demo.svg"
                      alt="Upload Demo"
                      className="w-full h-auto"
                      onError={(e) => {
                        e.target.src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f3e8ff'/%3E%3Ctext x='200' y='150' text-anchor='middle' fill='%238b5cf6' font-family='Arial' font-size='20'%3EUpload Screenshot%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row-reverse items-center gap-8">
                <div className="flex-1">
                  <div className="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold mb-4">
                    Step 4
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Withdraw Earnings
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Withdraw your earnings directly to your bank account.
                    Minimum withdrawal: Rs 500. Processing: 3-5 business days.
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                      <div className="text-3xl font-bold text-green-600">
                        500
                      </div>
                      <div className="text-sm text-gray-600">
                        Min Withdrawal
                      </div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                      <div className="text-3xl font-bold text-blue-600">0%</div>
                      <div className="text-sm text-gray-600">No Fees</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl">
                      <div className="text-3xl font-bold text-amber-600">
                        3-5
                      </div>
                      <div className="text-sm text-gray-600">
                        Processing Days
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-8">
                    <img
                      src="/withdraw-demo.svg"
                      alt="Withdraw Demo"
                      className="w-full h-auto"
                      onError={(e) => {
                        e.target.src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23ffedd5'/%3E%3Ctext x='200' y='150' text-anchor='middle' fill='%23f97316' font-family='Arial' font-size='20'%3EWithdraw Funds%3C/text%3E%3C/svg%3E";
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
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

          {/* CTA Section */}
          <div className="text-center">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 shadow-xl">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Start Earning?
              </h2>
              <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
                Join our community of thousands earning from social media. No
                experience needed. Start earning in minutes.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/Sign-up/page"
                  className="inline-flex items-center justify-center bg-white text-blue-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-lg"
                >
                  Sign Up Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </a>
                <a
                  href="/platforms"
                  className="inline-flex items-center justify-center bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-bold hover:bg-white/10 transition-colors"
                >
                  View All Platforms
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
