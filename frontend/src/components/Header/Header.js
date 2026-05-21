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
    <div className="bg-gradient-to-br from-slate-50 via-primary-50/30 to-brand-50/20">
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/80 backdrop-blur-md shadow-lg border-b border-primary-100/50"
            : "bg-white/50 backdrop-blur-sm shadow-sm border-b border-slate-100"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">
            {/* Logo/Brand */}
            <div className="flex-shrink-0 relative group">
              <Link href="/" className="inline-block" onClick={closeMobileMenu}>
                <div className="flex items-center space-x-3 transition-transform duration-300 group-hover:scale-[1.02]">
                  <div className="relative">
                    <h1 className="text-2xl lg:text-3xl font-extrabold bg-gradient-to-r from-primary-600 via-primary-700 to-brand-500 bg-clip-text text-transparent">
                      Rithu Business Lanka
                    </h1>
                    <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary-600 to-brand-500 transition-all duration-300 group-hover:w-full"></div>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-brand-400 rounded-full blur-md opacity-30 group-hover:opacity-60 transition-opacity duration-300 animate-pulse"></div>
                    <img
                      src="/RBL.png"
                      alt="RBL Logo"
                      className="relative w-10 h-10 lg:w-12 lg:h-12 object-contain rounded-full ring-2 ring-primary-100/80 group-hover:ring-primary-300/80 transition-all duration-300"
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
                { href: "/how-it-works/page", label: "How It Works" },
                { href: "/platforms/page", label: "Platforms" },
                { href: "/faq/page", label: "FAQ" },
                { href: "/contact/page", label: "Contact" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative text-slate-600 hover:text-primary-600 px-4 py-2 text-sm font-semibold transition-all duration-300 rounded-lg hover:bg-primary-50/60 group"
                >
                  {item.label}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-primary-600 to-brand-500 transition-all duration-300 group-hover:w-3/4"></div>
                </Link>
              ))}
            </nav>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {!mounted ? (
                <div className="flex space-x-3">
                  <div className="h-8 w-16 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full animate-pulse"></div>
                  <div className="h-8 w-20 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full animate-pulse"></div>
                </div>
              ) : user ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3 bg-gradient-to-r from-primary-50/50 to-brand-50/50 px-3.5 py-1.5 rounded-full border border-primary-100/60 shadow-sm">
                    <div className="relative">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center ring-2 ring-primary-100">
                        <span className="text-white font-bold text-sm">
                          {user.firstName?.charAt(0).toUpperCase() ||
                            user.email?.charAt(0).toUpperCase() ||
                            "U"}
                        </span>
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-accent-500 border-2 border-white rounded-full"></div>
                    </div>
                    <span className="text-sm text-slate-700 font-semibold">
                      Welcome, {user.firstName || user.name || "User"}
                    </span>
                  </div>
                  <Link
                    href="/Profile/page"
                    className="relative text-primary-600 hover:text-primary-700 px-3.5 py-2 text-sm font-semibold transition-all duration-300 rounded-lg hover:bg-primary-50 group overflow-hidden"
                  >
                    <span className="relative z-10">Profile</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-brand-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left opacity-10"></div>
                  </Link>
                  <button
                    onClick={logout}
                    className="relative text-red-600 hover:text-red-700 px-3.5 py-2 text-sm font-semibold transition-all duration-300 rounded-lg hover:bg-red-50 group overflow-hidden"
                  >
                    <span className="relative z-10">Logout</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left opacity-10"></div>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Link
                    href="/Log-in/page"
                    className="relative text-primary-600 hover:text-primary-700 px-4 py-2 text-sm font-semibold transition-all duration-300 rounded-lg hover:bg-primary-50 group overflow-hidden"
                  >
                    <span className="relative z-10">Login</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-brand-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left opacity-10"></div>
                  </Link>
                  <Link
                    href="/Sign-up/page"
                    className="relative bg-gradient-to-r from-primary-600 to-brand-600 hover:from-primary-700 hover:to-brand-700 text-white px-6 py-2 rounded-xl text-sm font-bold transition-all duration-300 shadow-md shadow-primary-200 hover:shadow-lg transform hover:-translate-y-0.5 overflow-hidden group"
                  >
                    <span className="relative z-10">Sign Up</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-accent-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleMobileMenu}
                className="relative text-slate-700 hover:text-primary-600 p-2 rounded-lg transition-all duration-300 hover:bg-primary-50 group"
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
          <div className="bg-white/95 backdrop-blur-lg border-b border-primary-100/50 shadow-lg">
            <div className="px-4 py-4 space-y-2">
              {/* Mobile Navigation Links */}
              {[
                { href: "/how-it-works/page", label: "How It Works" },
                { href: "/platforms/page", label: "Platforms" },
                { href: "/faq/page", label: "FAQ" },
                { href: "/contact/page", label: "Contact" },
              ].map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className="block px-4 py-3 text-base font-semibold text-slate-700 hover:text-primary-600 hover:bg-gradient-to-r hover:from-primary-50/50 hover:to-brand-50/50 rounded-lg transition-all duration-300 transform hover:translate-x-1"
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
              <div className="pt-4 pb-3 border-t border-slate-100">
                {!mounted ? (
                  <div className="px-4 space-y-3">
                    <div className="h-12 w-full bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg animate-pulse"></div>
                    <div className="h-8 w-full bg-gradient-to-r from-slate-200 to-slate-300 rounded-lg animate-pulse"></div>
                  </div>
                ) : user ? (
                  <div className="space-y-4">
                    {/* User Info */}
                    <div className="flex items-center px-4 py-3 bg-gradient-to-r from-primary-50/40 to-brand-50/40 rounded-xl border border-primary-100/50 mx-4">
                      <div className="relative mr-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center ring-2 ring-primary-100">
                          <span className="text-white font-bold text-lg">
                            {user.firstName?.charAt(0).toUpperCase() ||
                              user.email?.charAt(0).toUpperCase() ||
                              "U"}
                          </span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-accent-500 border-2 border-white rounded-full"></div>
                      </div>
                      <div>
                        <p className="text-base font-bold text-slate-900">
                          {user.firstName || user.name || "User"}
                        </p>
                        <p className="text-sm text-slate-600">
                          {user.email || "No email available"}
                        </p>
                      </div>
                    </div>

                    {/* Mobile Auth Buttons */}
                    <div className="flex flex-col space-y-3 px-4">
                      <Link
                        href="/Profile/page"
                        onClick={closeMobileMenu}
                        className="w-full text-center bg-gradient-to-r from-primary-50 to-brand-50 text-primary-600 hover:from-primary-100 hover:to-brand-100 px-4 py-3 rounded-xl text-base font-semibold transition-all duration-300 border border-primary-200 hover:border-primary-300"
                      >
                        View Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full bg-gradient-to-r from-red-50 to-pink-50 text-red-600 hover:from-red-100 hover:to-pink-100 px-4 py-3 rounded-xl text-base font-semibold transition-all duration-300 border border-red-200 hover:border-red-300"
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
                      className="w-full text-center text-primary-600 hover:text-primary-700 hover:bg-gradient-to-r hover:from-primary-50 hover:to-brand-50 px-4 py-3 rounded-xl text-base font-semibold border-2 border-primary-600 hover:border-primary-700 transition-all duration-300"
                    >
                      Login
                    </Link>
                    <Link
                      href="/Sign-up/page"
                      onClick={closeMobileMenu}
                      className="w-full text-center bg-gradient-to-r from-primary-600 to-brand-600 hover:from-primary-700 hover:to-brand-700 text-white px-4 py-3 rounded-xl text-base font-bold transition-all duration-300 shadow-md shadow-primary-200"
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
