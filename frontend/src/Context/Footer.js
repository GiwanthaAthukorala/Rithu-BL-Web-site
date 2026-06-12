import React, { useState } from "react";
import { ChevronUp, Mail, MapPin, Phone, ExternalLink } from "lucide-react";

const Footer = () => {
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const socialMediaLinks = [
    {
      name: "Twitter",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
        </svg>
      ),
      color: "hover:bg-blue-500",
    },
    {
      name: "Facebook",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
      color: "hover:bg-blue-600",
    },
    {
      name: "Instagram",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.347-.09.375-.297 1.199-.336 1.363-.051.225-.165.271-.381.165-1.521-.708-2.472-2.93-2.472-4.718 0-3.86 2.806-7.4 8.088-7.4 4.241 0 7.541 3.018 7.541 7.058 0 4.21-2.657 7.596-6.341 7.596-1.238 0-2.409-.644-2.809-1.411 0 0-.615 2.342-.765 2.917-.277 1.075-1.030 2.421-1.534 3.244 1.158.359 2.385.551 3.661.551 6.621 0 11.988-5.367 11.988-11.987C24.005 5.367 18.638.001 12.017.001z" />
        </svg>
      ),
      color: "hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500",
    },
    {
      name: "LinkedIn",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      ),
      color: "hover:bg-blue-700",
    },
  ];

  const FooterSection = ({ title, children, sectionKey }) => (
    <div className="border-b border-gray-700 md:border-b-0 last:border-b-0">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="md:hidden w-full flex items-center justify-between py-4 text-white text-lg font-medium hover:text-blue-400 transition-colors"
      >
        <span>{title}</span>
        <ChevronUp
          className={`w-5 h-5 transition-transform duration-300 ${
            expandedSections[sectionKey] ? "rotate-180" : "rotate-0"
          }`}
        />
      </button>

      <div className="hidden md:block">
        <h4 className="text-white text-lg font-medium mb-6 relative">
          {title}
          <div className="absolute bottom-0 left-0 w-8 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 transform origin-left scale-x-100"></div>
        </h4>
      </div>

      <div
        className={`md:block overflow-hidden transition-all duration-300 ease-in-out ${
          expandedSections[sectionKey]
            ? "max-h-96 opacity-100 pb-4"
            : "max-h-0 opacity-0 md:max-h-none md:opacity-100"
        }`}
      >
        {children}
      </div>
    </div>
  );

  return (
    <footer className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-350 overflow-hidden font-sans">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 opacity-15">
        <div className="absolute top-10 left-10 w-32 h-32 bg-primary-500 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute bottom-20 right-20 w-40 h-40 bg-brand-500 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/4 w-24 h-24 bg-accent-500 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      <div className="relative z-10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
            {/* Company Section - Takes more space */}
            <div className="md:col-span-2 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start space-x-3 mb-6">
                <div className="relative">
                  <img
                    src="/RBL.png"
                    alt="RBL Logo"
                    className="w-12 h-12 object-contain"
                  />
                  <div className="absolute inset-0 bg-primary-500 rounded-full blur-md opacity-35 animate-pulse"></div>
                </div>
                <div>
                  <h3 className="text-white text-xl lg:text-2xl font-bold bg-gradient-to-r from-white via-primary-100 to-brand-100 bg-clip-text text-transparent">
                    Rithu Business Lanka
                  </h3>
                  <p className="text-sm text-primary-300 font-semibold">
                    Social Media Monetization
                  </p>
                </div>
              </div>

              <p className="text-slate-400 text-sm font-semibold leading-relaxed mb-6 max-w-md mx-auto md:mx-0">
                Transform your social media activity into a reliable source of income. Connect your accounts, watch videos, submit reviews, and withdraw earnings in minutes.
              </p>

              {/* Contact Info */}
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-center md:justify-start space-x-3 text-slate-400 hover:text-white transition-colors font-semibold">
                  <Mail className="w-4 h-4 text-primary-400" />
                  <span>rithubusinesslanka@gmail.com</span>
                </div>
                <div className="flex items-center justify-center md:justify-start space-x-3 text-slate-400 hover:text-white transition-colors font-semibold">
                  <Phone className="w-4 h-4 text-primary-400" />
                  <span>+94 74 008 9006</span>
                </div>
                <div className="flex items-center justify-center md:justify-start space-x-3 text-slate-400 hover:text-white transition-colors font-semibold">
                  <MapPin className="w-4 h-4 text-primary-400" />
                  <span>Mawanella, Sri Lanka</span>
                </div>
              </div>
            </div>

            {/* Platform Section */}
            <FooterSection title="Platform" sectionKey="platform">
              <ul className="space-y-4">
                {["How It Works", "Pricing Plans", "FAQ", "Support Center"].map(
                  (item, index) => (
                    <li key={index}>
                      <a
                        href="#"
                        className="group flex items-center space-x-2 text-slate-400 hover:text-white transition-all duration-200 text-sm font-semibold"
                      >
                        <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-primary-400" />
                        <span className="group-hover:translate-x-1 transition-transform">
                          {item}
                        </span>
                      </a>
                    </li>
                  )
                )}
              </ul>
            </FooterSection>

            {/* Legal Section */}
            <FooterSection title="Legal" sectionKey="legal">
              <ul className="space-y-4">
                {[
                  "Terms of Service",
                  "Privacy Policy",
                  "Cookie Policy",
                  "GDPR Compliance",
                ].map((item, index) => (
                  <li key={index}>
                    <a
                      href="#"
                      className="group flex items-center space-x-2 text-slate-400 hover:text-white transition-all duration-200 text-sm font-semibold"
                    >
                      <ExternalLink className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-primary-400" />
                      <span className="group-hover:translate-x-1 transition-transform">
                        {item}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </FooterSection>

            {/* Connect Section */}
            <FooterSection title="Connect" sectionKey="connect">
              <div className="space-y-4">
                {/* Newsletter Signup */}
                <div className="mb-6">
                  <p className="text-sm text-slate-400 font-semibold mb-3">
                    Stay updated with latest campaigns
                  </p>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <input
                      type="email"
                      placeholder="Enter email"
                      className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors font-semibold"
                    />
                    <button className="px-4 py-2 bg-gradient-to-r from-primary-600 to-brand-600 hover:from-primary-700 hover:to-brand-700 text-white rounded-lg text-sm font-bold transition-all duration-200 transform hover:scale-[1.03]">
                      Subscribe
                    </button>
                  </div>
                </div>

                {/* Social Links */}
                <div className="flex justify-center md:justify-start space-x-3">
                  {socialMediaLinks.map((social, index) => (
                    <a
                      key={index}
                      href="#"
                      className={`w-10 h-10 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center text-slate-400 transition-all duration-300 transform hover:scale-110 hover:rotate-6 ${social.color} hover:text-white group`}
                      title={social.name}
                    >
                      <div className="group-hover:scale-115 transition-transform">
                        {social.icon}
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </FooterSection>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-slate-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6 text-center md:text-left">
                <p className="text-slate-500 text-sm font-semibold">
                  © 2026 Rithu Business Lanka. All rights reserved.
                </p>
                <div className="flex items-center space-x-2 text-xs text-slate-500 font-semibold">
                  <span>Developed by</span>
                  <span className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-primary-400 font-bold">
                    @Giwantha_Athukorala
                  </span>
                </div>
              </div>

              {/* Language Selector */}
              <div className="flex items-center space-x-4">
                <select className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-slate-350 focus:outline-none focus:border-primary-500 font-semibold">
                  <option value="en">🇺🇸 English</option>
                  <option value="si">🇱🇰 සිංහල</option>
                  <option value="ta">🇱🇰 தமிழ்</option>
                </select>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="mt-8 flex flex-wrap justify-center items-center space-x-6 opacity-60">
              <div className="flex items-center space-x-2 text-xs text-slate-550 font-bold">
                <div className="w-2.5 h-2.5 bg-accent-500 rounded-full"></div>
                <span>SSL Secured</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-550 font-bold">
                <div className="w-2.5 h-2.5 bg-brand-500 rounded-full"></div>
                <span>GDPR Compliant</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-550 font-bold">
                <div className="w-2.5 h-2.5 bg-primary-500 rounded-full"></div>
                <span>SOC 2 Certified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
