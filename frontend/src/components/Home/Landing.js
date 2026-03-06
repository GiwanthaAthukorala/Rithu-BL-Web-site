export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center p-4">
      <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        {/* Left Content */}
        <div className="text-white space-y-6 lg:space-y-8 text-center lg:text-left">
          <div className="space-y-4">
            <div className="w-32 h-32 sm:w-40 sm:h-40 lg:w-52 lg:h-52 flex items-center justify-center mx-auto lg:mx-0 lg:mr-3 overflow-hidden">
              <img
                src="/RBL.png"
                alt="Rithu Business Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight px-2 lg:px-0">
              Get Paid for Your Social Media Activity
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 max-w-lg mx-auto lg:mx-0 px-2 lg:px-0">
              Earn Rs 1/= for every like on your content across multiple
              platforms.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start px-4 lg:px-0">
            <button className="bg-white text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-blue-50 transition-colors">
              Start Earning Now
            </button>
            <button className="border-2 border-white text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-white hover:text-blue-600 transition-colors">
              Learn More
            </button>
          </div>
        </div>

        {/* Right Content - Phone Mockup */}
        <div className="flex justify-center lg:justify-end mt-8 lg:mt-0">
          <div className="relative">
            {/* Phone Frame - Responsive sizing */}
            <div
              className="bg-gray-100 rounded-3xl p-2 shadow-2xl"
              style={{
                width: "280px",
                height: "560px",
                // Smaller on mobile, larger on tablets and up
              }}
            >
              {/* Status Bar */}
              <div className="bg-gray-200 rounded-t-2xl px-3 py-2 flex justify-between items-center">
                <div className="flex space-x-1.5">
                  <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>
                  <div className="w-2.5 h-2.5 bg-yellow-500 rounded-full"></div>
                  <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                </div>
              </div>

              {/* Screen Content */}
              <div
                className="bg-white rounded-b-2xl p-4 space-y-3"
                style={{ height: "500px" }}
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-base font-semibold text-gray-800">
                    Today's Earnings
                  </h2>
                  <span className="text-green-600 font-bold text-base">
                    Rs 500/=
                  </span>
                </div>

                {/* Earnings Chart Area */}
                <div className="bg-gray-50 rounded-xl p-3 h-24 mb-4">
                  <div className="w-full h-full bg-gradient-to-r from-blue-200 to-blue-300 rounded-lg opacity-50"></div>
                </div>

                {/* Platform Earnings */}
                <div className="space-y-3">
                  {/* Instagram */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-5 h-5 bg-white rounded-full"></div>
                      </div>
                      <span className="font-medium text-gray-700 text-sm">
                        Instagram
                      </span>
                    </div>
                    <span className="text-green-600 font-bold text-sm">
                      Rs 100/=
                    </span>
                  </div>

                  {/* TikTok */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                        <div className="w-5 h-5 bg-white rounded-full"></div>
                      </div>
                      <span className="font-medium text-gray-700 text-sm">
                        TikTok
                      </span>
                    </div>
                    <span className="text-green-600 font-bold text-sm">
                      Rs 345/=
                    </span>
                  </div>

                  {/* Twitter */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                        <div className="w-5 h-5 bg-white rounded-full"></div>
                      </div>
                      <span className="font-medium text-gray-700 text-sm">
                        Facebook
                      </span>
                    </div>
                    <span className="text-green-600 font-bold text-sm">
                      Rs 1000/=
                    </span>
                  </div>
                </div>

                {/* Additional mobile-friendly content */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="text-center">
                    <p className="text-xs text-gray-500 mb-2">Weekly Goal</p>
                    <div className="bg-gray-200 rounded-full h-2 mb-1">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: "68%" }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600">Rs 500 / Rs 2000/=</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile-specific responsive breakpoint adjustments */}
      <style jsx>{`
        @media (max-width: 640px) {
          .phone-mockup {
            width: 240px !important;
            height: 480px !important;
          }
        }
        @media (min-width: 768px) {
          .phone-mockup {
            width: 300px !important;
            height: 600px !important;
          }
        }
        @media (min-width: 1024px) {
          .phone-mockup {
            width: 320px !important;
            height: 640px !important;
          }
        }
      `}</style>
    </div>
  );
}
