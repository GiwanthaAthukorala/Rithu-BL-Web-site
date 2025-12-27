import React, { useEffect, useState } from "react";
import { useAuth } from "@/Context/AuthContext";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function Header() {
  const { user, logout } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Add scroll effect
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMobileMenu();
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-200/80"
            : "bg-white/90 backdrop-blur-sm shadow-sm border-b border-gray-100"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">
            {/* Logo/Brand */}
            <div className="flex-shrink-0 relative group">
              <Link href="/" className="inline-block" onClick={closeMobileMenu}>
                <div className="flex items-center space-x-3 transition-transform duration-200 group-hover:scale-105">
                  <div className="relative">
                    <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 bg-clip-text text-transparent">
                      Rithu Business Lanka
                    </h1>
                    <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 group-hover:w-full"></div>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
                    <img
                      src="/RBL.png"
                      alt="RBL Logo"
                      className="relative w-10 h-10 lg:w-12 lg:h-12 object-contain rounded-full ring-2 ring-blue-100 group-hover:ring-blue-300 transition-all duration-300"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex space-x-1 lg:space-x-2">
              {[
                { href: "#how-it-works", label: "How It Works" },
                { href: "#platforms", label: "Platforms" },
                { href: "../../components/FAQ.js", label: "FAQ" },
                { href: "#contact", label: "Contact" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative text-gray-700 hover:text-blue-600 px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg hover:bg-blue-50 group"
                >
                  {item.label}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 group-hover:w-3/4"></div>
                </Link>
              ))}
            </nav>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {!mounted ? (
                <div className="flex space-x-3">
                  <div className="h-8 w-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-pulse"></div>
                  <div className="h-8 w-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-pulse"></div>
                </div>
              ) : user ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3 bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-2 rounded-full border border-blue-100">
                    <div className="relative">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center ring-2 ring-blue-200">
                        <span className="text-white font-medium text-sm">
                          {user.firstName?.charAt(0).toUpperCase() ||
                            user.email?.charAt(0).toUpperCase() ||
                            "U"}
                        </span>
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                    </div>
                    <span className="text-sm text-gray-700 font-medium">
                      Welcome, {user.firstName || user.name || "User"}
                    </span>
                  </div>
                  <Link
                    href="/Profile/page"
                    className="relative text-blue-600 hover:text-blue-700 px-3 py-2 text-sm font-medium transition-all duration-300 rounded-lg hover:bg-blue-50 group overflow-hidden"
                  >
                    <span className="relative z-10">Profile</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left opacity-10"></div>
                  </Link>
                  <button
                    onClick={logout}
                    className="relative text-red-600 hover:text-red-700 px-3 py-2 text-sm font-medium transition-all duration-300 rounded-lg hover:bg-red-50 group overflow-hidden"
                  >
                    <span className="relative z-10">Logout</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left opacity-10"></div>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    href="/Log-in/page"
                    className="relative text-blue-600 hover:text-blue-700 px-4 py-2 text-sm font-medium transition-all duration-300 rounded-lg hover:bg-blue-50 group overflow-hidden"
                  >
                    <span className="relative z-10">Login</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left opacity-10"></div>
                  </Link>
                  <Link
                    href="/Sign-up/page"
                    className="relative bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 overflow-hidden group"
                  >
                    <span className="relative z-10">Sign Up</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="relative text-gray-700 hover:text-blue-600 p-2 rounded-lg transition-all duration-300 hover:bg-blue-50 group"
                aria-label="Toggle mobile menu"
              >
                <div className="relative w-6 h-6">
                  <span
                    className={`absolute top-1 left-0 w-6 h-0.5 bg-current transform transition-all duration-300 ${
                      isMobileMenuOpen ? "rotate-45 translate-y-2" : ""
                    }`}
                  ></span>
                  <span
                    className={`absolute top-3 left-0 w-6 h-0.5 bg-current transition-all duration-300 ${
                      isMobileMenuOpen ? "opacity-0" : ""
                    }`}
                  ></span>
                  <span
                    className={`absolute top-5 left-0 w-6 h-0.5 bg-current transform transition-all duration-300 ${
                      isMobileMenuOpen ? "-rotate-45 -translate-y-2" : ""
                    }`}
                  ></span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out overflow-hidden ${
            isMobileMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="bg-white/95 backdrop-blur-lg border-b border-gray-200/80 shadow-lg">
            <div className="px-4 py-4 space-y-2">
              {/* Mobile Navigation Links */}
              {[
                { href: "#how-it-works", label: "How It Works" },
                { href: "#platforms", label: "Platforms" },
                { href: "../../components/FAQ.js", label: "FAQ" },
                { href: "#contact", label: "Contact" },
              ].map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 rounded-lg transition-all duration-300 transform hover:translate-x-1"
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animation: isMobileMenuOpen
                      ? "slideInFromLeft 0.3s ease-out forwards"
                      : "none",
                  }}
                >
                  {item.label}
                </Link>
              ))}

              {/* Mobile Auth Section */}
              <div className="pt-4 pb-3 border-t border-gray-200/60">
                {!mounted ? (
                  <div className="px-4 space-y-3">
                    <div className="h-12 w-full bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse"></div>
                    <div className="h-8 w-full bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse"></div>
                  </div>
                ) : user ? (
                  <div className="space-y-4">
                    {/* User Info */}
                    <div className="flex items-center px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 mx-4">
                      <div className="relative mr-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center ring-2 ring-blue-200">
                          <span className="text-white font-medium text-lg">
                            {user.firstName?.charAt(0).toUpperCase() ||
                              user.email?.charAt(0).toUpperCase() ||
                              "U"}
                          </span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                      </div>
                      <div>
                        <p className="text-base font-semibold text-gray-900">
                          {user.firstName || user.name || "User"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {user.email || "No email available"}
                        </p>
                      </div>
                    </div>

                    {/* Mobile Auth Buttons */}
                    <div className="flex flex-col space-y-3 px-4">
                      <Link
                        href="/Profile/page"
                        onClick={closeMobileMenu}
                        className="w-full text-center bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 hover:from-blue-100 hover:to-indigo-100 px-4 py-3 rounded-lg text-base font-medium transition-all duration-300 border border-blue-200 hover:border-blue-300"
                      >
                        View Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full bg-gradient-to-r from-red-50 to-pink-50 text-red-600 hover:from-red-100 hover:to-pink-100 px-4 py-3 rounded-lg text-base font-medium transition-all duration-300 border border-red-200 hover:border-red-300"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-3 px-4">
                    <Link
                      href="/Log-in/page"
                      onClick={closeMobileMenu}
                      className="w-full text-center text-blue-600 hover:text-blue-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 px-4 py-3 rounded-lg text-base font-medium border-2 border-blue-600 hover:border-blue-700 transition-all duration-300"
                    >
                      Login
                    </Link>
                    <Link
                      href="/Sign-up/page"
                      onClick={closeMobileMenu}
                      className="w-full text-center bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-3 rounded-lg text-base font-medium transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Add padding to body content to account for fixed header */}
      <div className="h-16 lg:h-18"></div>

      <style jsx>{`
        @keyframes slideInFromLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}
