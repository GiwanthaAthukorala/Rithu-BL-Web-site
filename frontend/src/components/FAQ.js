import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0); // First item open by default

  const faqData = [
    {
      question: "How do I get paid for my engagement activities?",
      answer:
        "Once you link your social media accounts and perform tasks, you upload simple proof (e.g., screenshots of your watch, review, or likes). Our admins verify submissions within 24 hours, and your earnings are added directly to your main wallet balance. You can withdraw to any local bank account once you reach Rs 500/=.",
    },
    {
      question: "Is it safe to connect my social media profiles?",
      answer:
        "Yes, we do not require passwords or access tokens. You simply provide your account username or profile URL so we can verify screenshots against your public activity, keeping your accounts fully secure.",
    },
    {
      question: "Are there any minimum follower requirements?",
      answer:
        "No, there are no follower requirements. Whether you have 5 followers or 50,000, you can participate in all available tasks and earn the same standard rates.",
    },
    {
      question: "How long does verification take?",
      answer:
        "Verification is typically completed within 12 to 24 hours. Once our verification system confirms the proof of completion, the earnings will instantly update in your profile ledger.",
    },
    {
      question: "Can I watch videos multiple times to earn rewards?",
      answer:
        "Yes! You can watch each available video up to 20 times, earning rewards for each complete 1-minute watch session. The progress is tracked on the video view page.",
    },
    {
      question: "What withdrawal methods are supported?",
      answer:
        "We support direct bank transfers to all major local banks in Sri Lanka (e.g., Bank of Ceylon, Commercial Bank, Sampath Bank, Hatton National Bank, etc.) with zero processing fees.",
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <div className="bg-gradient-to-b from-white via-slate-50 to-white py-24 px-4 sm:px-6 lg:px-8 border-t border-slate-100 font-sans relative overflow-hidden">
      {/* Background glow meshes */}
      <div className="absolute top-1/3 right-0 w-80 h-80 bg-primary-400/5 rounded-full blur-3xl opacity-35"></div>
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-brand-400/5 rounded-full blur-3xl opacity-30"></div>

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-primary-600 font-extrabold uppercase tracking-widest text-xs">Help & Support</span>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mt-2 mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-slate-500 font-semibold text-base">
            Find answers to common questions about the tasks, verifications, and payouts.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqData.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`bg-white/80 backdrop-blur-md rounded-2xl border transition-all duration-350 overflow-hidden ${
                  isOpen
                    ? "border-primary-400/50 shadow-md shadow-primary-50/50"
                    : "border-slate-200/60 shadow-sm hover:border-primary-300/30"
                }`}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-slate-50/40 focus:outline-none transition-colors duration-200"
                >
                  <span className="text-base sm:text-lg font-bold text-slate-800 pr-4">
                    {item.question}
                  </span>
                  <div className={`flex-shrink-0 ml-2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                    isOpen ? "bg-primary-50 text-primary-600" : "bg-slate-50 text-slate-400"
                  }`}>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </button>

                {/* Smooth Expandable Content */}
                <div
                  className={`transition-all duration-350 ease-in-out ${
                    isOpen ? "max-h-72 border-t border-slate-100 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="px-6 py-5 bg-slate-50/30">
                    <p className="text-slate-500 font-semibold leading-relaxed text-sm">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Support Section */}
        <div className="text-center mt-16 space-y-4">
          <p className="text-slate-500 font-semibold text-sm">Still have questions or run into technical issues?</p>
          <button className="inline-flex items-center justify-center bg-primary-50/70 hover:bg-primary-100/70 text-primary-600 hover:text-primary-750 font-bold px-6 py-3 border border-primary-100/50 rounded-xl transition-all duration-250 text-sm">
            Contact 24/7 Support
          </button>
        </div>
      </div>
    </div>
  );
}
