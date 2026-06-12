import { useState, useEffect } from "react";

export default function LandingPage() {
  const [balance, setBalance] = useState(512);
  const [progress, setProgress] = useState(68);

  useEffect(() => {
    const interval = setInterval(() => {
      setBalance((prev) => {
        if (prev >= 1485) return 512;
        return prev + 3;
      });
      setProgress((prev) => {
        if (prev >= 98) return 45;
        return prev + 0.2;
      });
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden font-sans">
      {/* Decorative premium background blobs */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-20 right-20 w-[450px] h-[450px] bg-brand-500/15 rounded-full blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Cyber/Tech Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>

      <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10 py-12 lg:py-20">
        {/* Left Content */}
        <div className="space-y-6 lg:space-y-8 text-center lg:text-left">
          <div className="space-y-4">
            {/* Pulsing Intro Badge */}
            <div className="inline-flex items-center space-x-2 bg-primary-500/10 border border-primary-500/30 px-4 py-1.5 rounded-full text-xs font-semibold text-primary-300 tracking-wide uppercase mx-auto lg:mx-0 shadow-sm animate-pulse-glow">
              <span className="w-2 h-2 rounded-full bg-accent-400"></span>
              <span>Monetize Your Influence</span>
            </div>

            <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-5">
              <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center overflow-hidden rounded-2xl bg-white/5 border border-white/10 p-2 shadow-xl backdrop-blur-sm group hover:scale-105 transition-transform duration-300">
                <img
                  src="/RBL.png"
                  alt="Rithu Business Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-center lg:text-left">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  Rithu Business Lanka
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 font-medium">
                  Leading Engagement Network in Sri Lanka
                </p>
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight bg-gradient-to-br from-white via-slate-100 to-slate-400 bg-clip-text text-transparent px-2 lg:px-0">
              Get Paid for Your <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-primary-400 via-brand-400 to-accent-400 bg-clip-text text-transparent drop-shadow-md">
                Social Activity
              </span>
            </h1>
            <p className="text-base sm:text-lg text-slate-400 max-w-lg mx-auto lg:mx-0 px-2 lg:px-0 font-medium leading-relaxed">
              Earn <span className="text-accent-400 font-bold">Rs 1/=</span> for every watch, click, like, or review across major platforms. Connect, engage, and withdraw instant earnings to your account.
            </p>
          </div>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start px-4 lg:px-0">
            <button className="bg-gradient-to-r from-primary-600 to-brand-600 hover:from-primary-700 hover:to-brand-700 text-white px-8 py-4 rounded-xl font-bold text-base sm:text-lg shadow-lg shadow-primary-500/20 hover:shadow-primary-500/35 transition-all duration-300 transform hover:-translate-y-0.5">
              Start Earning Now
            </button>
            <button className="border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white px-8 py-4 rounded-xl font-bold text-base sm:text-lg shadow-inner transition-all duration-300">
              Learn More
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/5 max-w-md mx-auto lg:mx-0">
            <div>
              <p className="text-xl sm:text-2xl font-bold text-white">10K+</p>
              <p className="text-xs text-slate-500">Active Earners</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-white">Rs 5M+</p>
              <p className="text-xs text-slate-500">Paid Out</p>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-white">100%</p>
              <p className="text-xs text-slate-500">Secure Tasks</p>
            </div>
          </div>
        </div>

        {/* Right Content - Phone Mockup */}
        <div className="flex justify-center lg:justify-end mt-12 lg:mt-0 relative group">
          {/* Ambient Glow behind phone */}
          <div className="absolute inset-0 w-80 h-[580px] bg-gradient-to-br from-primary-600 to-brand-500 rounded-[40px] blur-3xl opacity-30 group-hover:opacity-40 transition-opacity duration-500 mx-auto"></div>

          {/* Phone Mockup Frame */}
          <div className="relative bg-slate-900 border-[8px] border-slate-800 rounded-[48px] p-3.5 shadow-2xl w-[310px] h-[610px] flex flex-col justify-between overflow-hidden">
            {/* Screen Content Wrapper */}
            <div className="bg-slate-950 rounded-[38px] w-full h-full p-4 flex flex-col justify-between overflow-hidden relative">
              {/* Phone Speaker/Dynamic Island */}
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-28 h-6 bg-slate-900 rounded-full z-20 flex items-center justify-center">
                <div className="w-2.5 h-2.5 bg-slate-850 rounded-full border border-slate-700/50 absolute left-3"></div>
                <div className="w-12 h-1 bg-slate-800 rounded-full"></div>
              </div>

              {/* Status bar spacer */}
              <div className="h-6 flex justify-between items-center text-[10px] text-slate-500 px-3 pt-1 font-semibold">
                <span>9:41</span>
                <div className="flex items-center space-x-1">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 15c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/></svg>
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                </div>
              </div>

              {/* Header */}
              <div className="flex justify-between items-center mt-3 mb-2 px-1">
                <div className="space-y-0.5">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Live Earnings</p>
                  <h3 className="text-sm font-bold text-white">My Wallet</h3>
                </div>
                <span className="text-accent-400 font-extrabold text-lg tracking-tight bg-accent-950/40 border border-accent-900/30 px-3 py-1 rounded-full shadow-inner animate-pulse">
                  Rs {balance}/=
                </span>
              </div>

              {/* Mini Earnings Dashboard Widget */}
              <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-3 space-y-2.5">
                <div className="flex justify-between items-center text-[11px] text-slate-400">
                  <span className="font-semibold">Today's Progress</span>
                  <span className="text-white font-bold">{Math.round(progress)}%</span>
                </div>
                {/* Progress bar */}
                <div className="bg-slate-950 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-primary-500 via-brand-500 to-accent-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[9px] text-slate-500">
                  <span>Target: Rs 2,000/=</span>
                  <span>Rs {balance} collected</span>
                </div>
              </div>

              {/* Platform Task Feeds */}
              <div className="space-y-2.5 flex-1 mt-4 overflow-y-auto">
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mb-1 px-1">Completed Tasks</p>
                
                {/* Facebook */}
                <div className="flex items-center justify-between p-2.5 bg-slate-900/50 hover:bg-slate-900 border border-slate-850 rounded-xl transition-all duration-200">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 bg-blue-600/10 border border-blue-500/20 rounded-lg flex items-center justify-center">
                      <img src="/facebook.png" alt="FB" className="w-5 h-5 object-contain" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[11px] font-bold text-white leading-none">Facebook Share</p>
                      <p className="text-[9px] text-slate-500 leading-none">1 min ago</p>
                    </div>
                  </div>
                  <span className="text-accent-400 font-extrabold text-[11px] bg-accent-950/30 border border-accent-900/20 px-2 py-0.5 rounded-md">
                    +Rs 15/=
                  </span>
                </div>

                {/* TikTok */}
                <div className="flex items-center justify-between p-2.5 bg-slate-900/50 hover:bg-slate-900 border border-slate-850 rounded-xl transition-all duration-200">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 bg-pink-600/10 border border-pink-500/20 rounded-lg flex items-center justify-center">
                      <img src="/Tiktok.png" alt="TikTok" className="w-5 h-5 object-contain" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[11px] font-bold text-white leading-none">TikTok Follow</p>
                      <p className="text-[9px] text-slate-500 leading-none">5 mins ago</p>
                    </div>
                  </div>
                  <span className="text-accent-400 font-extrabold text-[11px] bg-accent-950/30 border border-accent-900/20 px-2 py-0.5 rounded-md">
                    +Rs 1/=
                  </span>
                </div>

                {/* YouTube */}
                <div className="flex items-center justify-between p-2.5 bg-slate-900/50 hover:bg-slate-900 border border-slate-850 rounded-xl transition-all duration-200">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 bg-red-600/10 border border-red-500/20 rounded-lg flex items-center justify-center">
                      <img src="/youtube.png" alt="YT" className="w-5 h-5 object-contain" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[11px] font-bold text-white leading-none">YouTube Watch</p>
                      <p className="text-[9px] text-slate-500 leading-none">12 mins ago</p>
                    </div>
                  </div>
                  <span className="text-accent-400 font-extrabold text-[11px] bg-accent-950/30 border border-accent-900/20 px-2 py-0.5 rounded-md">
                    +Rs 2/=
                  </span>
                </div>
              </div>

              {/* Quick Action Navigation bar inside mockup */}
              <div className="border-t border-slate-900 pt-3 mt-2 flex justify-around text-slate-500 text-[10px] px-1 font-semibold pb-1">
                <span className="text-primary-400 flex flex-col items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-400 mb-0.5"></span>
                  Home
                </span>
                <span className="hover:text-slate-300 cursor-pointer">Tasks</span>
                <span className="hover:text-slate-300 cursor-pointer">Wallet</span>
                <span className="hover:text-slate-300 cursor-pointer">Profile</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
