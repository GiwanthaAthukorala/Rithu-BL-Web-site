import React from "react";

export default function HelpMode() {
  const steps = [
    {
      number: 1,
      title: "Sign Up",
      description: "Create your free RBL earner account in less than 30 seconds.",
    },
    {
      number: 2,
      title: "Connect Accounts",
      description:
        "Safely link your social media profiles in your private user dashboard.",
    },
    {
      number: 3,
      title: "Perform Tasks",
      description:
        "Browse campaigns, watch clips, like posts, and write brief reviews.",
    },
    {
      number: 4,
      title: "Earn Money",
      description:
        "Get instant verification. Earn Rs 1 to Rs 40 per task directly to your wallet.",
    },
  ];

  const paymentFeatures = [
    "Earn stable rates across all main social channels",
    "Direct bank transfers to any local Sri Lankan bank account",
    "Extremely low minimum withdrawal threshold of just Rs 500/=",
    "Real-time live ledger tracking directly on your dashboard",
  ];

  return (
    <div className="bg-gradient-to-b from-white via-slate-50 to-white py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-100 relative overflow-hidden font-sans">
      {/* Decorative light meshes */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-brand-400/5 rounded-full blur-3xl opacity-40"></div>
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-primary-400/5 rounded-full blur-3xl opacity-30"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="text-center mb-16">
          <span className="text-primary-600 font-extrabold uppercase tracking-widest text-xs">Simplified Monetization</span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mt-2 mb-4">
            How It Works
          </h2>
          <p className="text-slate-550 font-semibold text-base sm:text-lg max-w-3xl mx-auto leading-relaxed">
            Our platform connects you with local brands. Turn your standard daily engagement actions into real income in four easy steps.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {steps.map((step) => (
            <div
              key={step.number}
              className="bg-white rounded-2xl border border-slate-200/50 p-6 text-center hover:shadow-xl hover:shadow-primary-100/30 transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Step Number */}
              <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-brand-500 rounded-full flex items-center justify-center text-white font-black text-lg mx-auto mb-6 shadow-md shadow-primary-200">
                {step.number}
              </div>

              {/* Step Title */}
              <h3 className="text-xl font-bold text-slate-800 mb-3">
                {step.title}
              </h3>

              {/* Step Description */}
              <p className="text-slate-500 font-semibold leading-relaxed text-sm">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Payment Details Section */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl border border-slate-200/60 p-8 sm:p-12 shadow-xl shadow-slate-100 flex flex-col lg:flex-row items-center gap-12">
          
          {/* Left: Features */}
          <div className="flex-1 space-y-8 w-full">
            <div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">
                Payout Policies
              </h3>
              <p className="text-slate-400 font-medium text-sm">We provide reliable, transparent processing with zero delays.</p>
            </div>

            <div className="space-y-4">
              {paymentFeatures.map((feature, index) => (
                <div key={index} className="flex items-start">
                  <div className="w-6 h-6 bg-accent-100 border border-accent-200 rounded-full flex items-center justify-center mr-4 flex-shrink-0 mt-0.5">
                    <svg
                      className="w-3.5 h-3.5 text-accent-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <span className="text-slate-700 text-base font-semibold leading-tight">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Divider on desktop */}
          <div className="hidden lg:block w-[1px] h-48 bg-slate-200"></div>

          {/* Right: Price Highlight */}
          <div className="w-full lg:w-96 text-center space-y-6">
            <div className="space-y-2">
              <span className="text-slate-400 uppercase font-black tracking-widest text-[10px]">Standard rate</span>
              <div className="flex items-baseline justify-center">
                <span className="text-5xl sm:text-6xl font-black bg-gradient-to-r from-primary-600 to-brand-500 bg-clip-text text-transparent tracking-tight">
                  Rs 1/=
                </span>
                <span className="text-sm font-bold text-slate-500 ml-2">per action</span>
              </div>
              <p className="text-slate-550 font-semibold text-sm max-w-xs mx-auto leading-relaxed">
                Standard baseline rate for standard interactions, scaling up to <span className="text-primary-600 font-extrabold">Rs 40/=</span> for premium reviews.
              </p>
            </div>

            {/* CTA Button */}
            <div className="pt-2">
              <button className="bg-gradient-to-r from-primary-600 to-brand-500 hover:from-primary-700 hover:to-brand-600 text-white font-bold px-8 py-4 rounded-xl text-base shadow-lg shadow-primary-200/50 hover:shadow-primary-350/50 transition-all duration-300 w-full transform hover:-translate-y-0.5">
                Register & Start Earning
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
