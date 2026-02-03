import React from "react";

export default function HelpMode() {
  const steps = [
    {
      number: 1,
      title: "Sign Up",
      description: "Create your free account in just a few clicks.",
    },
    {
      number: 2,
      title: "Connect Accounts",
      description:
        "Link your social media accounts through our secure dashboard.",
    },
    {
      number: 3,
      title: "Post As Usual",
      description:
        "Continue using your social media accounts just like before.",
    },
    {
      number: 4,
      title: "Earn Money",
      description:
        "Get paid Rs 1 /= or Rs30,Rs40,Rs15 in Comment,Google Review and Facebook Review for every like your content receives across platforms.",
    },
  ];

  const paymentFeatures = [
    "Earn Rs 1 /= for every like across all platforms",
    "Weekly payments via PayPal, Venmo, or direct deposit",
    "No minimum payout threshold",
    "Track earnings in real-time on your dashboard",
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our platform makes it easy to monetize your social media presence in
            just four simple steps.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {steps.map((step) => (
            <div
              key={step.number}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition-shadow duration-200"
            >
              {/* Step Number */}
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">
                {step.number}
              </div>

              {/* Step Title */}
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {step.title}
              </h3>

              {/* Step Description */}
              <p className="text-gray-600 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Payment Details Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Payment Details
          </h2>

          <div className="space-y-4 mb-12">
            {paymentFeatures.map((feature, index) => (
              <div key={index} className="flex items-center">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span className="text-gray-700 text-lg">{feature}</span>
              </div>
            ))}
          </div>

          {/* Price Highlight */}
          <div className="text-center mb-8">
            <div className="flex items-baseline justify-center mb-2">
              <span className="text-6xl font-bold text-blue-600">Rs 1 /=</span>
              <span className="text-xl text-gray-600 ml-2">per like</span>
            </div>
            <p className="text-gray-600 text-lg">
              Our industry-leading rate ensures you get the maximum value for
              your social media presence.
            </p>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-12 py-4 rounded-xl text-lg transition-colors duration-200 shadow-sm w-full max-w-md">
              Start Earning Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
