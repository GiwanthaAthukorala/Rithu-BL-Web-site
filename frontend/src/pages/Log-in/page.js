import { useState } from "react";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import LSNavBar from "@/components/NavBar/NavBarLS";
import { useRouter } from "next/router";
import { login as apiLogin } from "@/lib/api";
import { useAuth } from "@/Context/AuthContext";
import Link from "next/link";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa6";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const router = useRouter();
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login({ email, password, rememberMe });
      router.push("/");
    } catch (error) {
      setError(error.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }

    // Handle login logic here
    console.log("Login attempt:", { email, password, rememberMe });
  };

  const handleSocialLogin = (provider) => {
    // Handle social login
    console.log(`Login with ${provider}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <LSNavBar />

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          {/* Login Form Card */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            {/* Title */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-blue-600 mb-12">
                Rithu Business Lanka
              </h1>

              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Log in to your account
              </h2>
              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md ">
                  {error}
                </div>
              )}
              <p className="text-gray-600">
                Or{" "}
                <Link href={"/Sign-up/page"}>
                  <button className="text-blue-600 hover:text-blue-700 transition-colors">
                    create a new account
                  </button>
                </Link>
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-6">
                {/* Email Field */}
                <div>
                  <div className="block text-sm font-medium text-gray-700 mb-2">
                    Email address
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your email"
                  />
                </div>

                {/* Password Field */}
                <div>
                  <div className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your password"
                    />
                    <button
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="ml-2 block text-sm text-gray-700">
                      Remember me
                    </div>
                  </div>
                  <Link
                    href="/forgot-password/page"
                    className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Forgot your password?
                  </Link>
                </div>

                {/* Login Button */}
                <button
                  onClick={handleSubmit}
                  type="submit"
                  disabled={isLoading}
                  className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${
                    isLoading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading ? "Logging in..." : "Log in"}
                </button>
              </div>
            </form>

            {/* Social Login */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-6 flex justify-center gap-3">
                <button
                  disabled={false}
                  onClick={() => {}}
                  className="bg-slate-300 hover:bg-slate-400 hover:scale-110 p-3 rounded"
                >
                  <FaFacebook className="size-8 text-blue-600" />
                </button>
                <button
                  disabled={false}
                  onClick={() => {}}
                  className="bg-slate-300 hover:bg-slate-400 hover:scale-110 p-3 rounded"
                >
                  <FcGoogle className="size-8" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
