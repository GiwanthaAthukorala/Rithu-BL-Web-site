import React, { useEffect, useState } from "react";
import {
  User,
  DollarSign,
  Menu,
  X,
  Home,
  Settings,
  LogOut,
  Bell,
  ChevronDown,
  Wallet,
  TrendingUp,
  Edit3,
  Camera,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/Context/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useSocket } from "@/Context/SocketContext";
import ProfileEditModal from "@/components/Profile/profileModel";

export default function Profile() {
  const [earnings, setEarnings] = useState({
    totalEarned: 0,
    availableBalance: 0,
    pendingWithdrawal: 0,
    withdrawnAmount: 0,
  });
  const [withdrawAmount, setWithdrawAmount] = useState("500");
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { user, isAuthLoading, setUser, logout } = useAuth();
  const socket = useSocket();
  const router = useRouter();

  const formatCurrency = (value) => (value || 0).toFixed(2);

  const fetchEarnings = async () => {
    try {
      setIsFetching(true);
      setError(null);

      const response = await api.get("/api/earnings");

      if (response.data?.success) {
        setEarnings(
          response.data.data || {
            totalEarned: 0,
            availableBalance: 0,
            pendingWithdrawal: 0,
            withdrawnAmount: 0,
          },
        );
      } else {
        throw new Error(response.data?.message || "Invalid earnings data");
      }
    } catch (err) {
      console.error("Fetch earnings error:", err);
      setError(err.response?.data?.message || "Failed to load earnings");
      setEarnings({
        totalEarned: 0,
        availableBalance: 0,
        pendingWithdrawal: 0,
        withdrawnAmount: 0,
      });

      if (err.response?.status !== 500) {
        setError(err.response?.data?.message || "Failed to load earnings");
      }
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchEarnings();
    }
  }, [user?._id]);

  useEffect(() => {
    if (!socket || !user?._id) return;

    socket.emit("register", user._id);

    const handleEarningsUpdate = (updated) => {
      setEarnings((prev) => ({
        ...prev,
        ...updated,
      }));
    };

    socket.on("earningsUpdate", handleEarningsUpdate);

    return () => {
      socket.off("earningsUpdate", handleEarningsUpdate);
    };
  }, [socket, user?._id]);

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);

    if (!amount || amount < 500) {
      setError("Minimum withdrawal amount is Rs 500");
      return;
    }

    if (amount > earnings.availableBalance) {
      setError("Amount exceeds available balance");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post("/api/earnings/withdraw", { amount });
      if (response.data.success) {
        const updatedEarnings = response.data.earnings;
        const transaction = response.data.transaction;

        setEarnings(updatedEarnings);
        setIsWithdrawModalOpen(false);
        setWithdrawAmount("500");

        // Show immediate success message
        setSuccess(
          `Withdrawal of Rs ${amount} processed successfully! Funds will be transferred to your bank account.`,
        );
        setTimeout(() => setSuccess(null), 8000);

        // If you have transaction history, you might want to update it here
      }
    } catch (error) {
      setError(error.response?.data?.message || "Withdrawal failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdateSuccess = (updatedUser) => {
    // Update the user context with new data
    setUser(updatedUser);
    setSuccess("Profile updated successfully!");
    setTimeout(() => setSuccess(null), 5000);
  };

  const getProfileImageUrl = () => {
    if (user?.profilePicture?.url) {
      return user.profilePicture.url;
    }
    // Return initials avatar as fallback
    const initials = `${user?.firstName?.charAt(0) || ""}${
      user?.lastName?.charAt(0) || ""
    }`;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      initials,
    )}&background=3B82F6&color=ffffff&size=400`;
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (isAuthLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Enhanced Header */}
      <header className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Logo/Brand */}
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Wallet className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    TaskPay
                  </h1>
                  <p className="text-xs text-gray-500 font-medium">
                    Earn & Withdraw
                  </p>
                </div>
              </div>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-8">
                <a
                  href="/"
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-all duration-200 font-medium"
                >
                  <Home size={18} />
                  <span>Dashboard</span>
                </a>
                <a
                  href="/Profile/page"
                  className="flex items-center space-x-2 text-blue-600 font-semibold bg-blue-50 px-3 py-2 rounded-lg"
                >
                  <User size={18} />
                  <span>Profile</span>
                </a>
                <a
                  href="#"
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-all duration-200 font-medium"
                >
                  <TrendingUp size={18} />
                  <span>Analytics</span>
                </a>
                <a
                  href="#"
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-all duration-200 font-medium"
                >
                  <Settings size={18} />
                  <span>Settings</span>
                </a>
              </nav>

              {/* User Menu */}
              <div className="flex items-center space-x-4">
                <button className="relative p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200">
                  <Bell size={20} />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-bold">3</span>
                  </span>
                </button>

                <div className="hidden md:flex items-center space-x-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-full px-5 py-3 border border-gray-200 hover:shadow-md transition-all duration-200">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full overflow-hidden shadow-md border-2 border-white">
                      <img
                        src={getProfileImageUrl()}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      Rs {formatCurrency(earnings.availableBalance)} available
                    </p>
                  </div>
                  <ChevronDown size={16} className="text-gray-500" />
                </div>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                >
                  {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 shadow-lg">
              <nav className="space-y-4">
                <a
                  href="/"
                  className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-blue-50"
                >
                  <Home size={20} />
                  <span className="font-medium">Dashboard</span>
                </a>
                <a
                  href="#"
                  className="flex items-center space-x-3 text-blue-600 font-semibold p-2 rounded-lg bg-blue-50"
                >
                  <User size={20} />
                  <span>Profile</span>
                </a>
                <a
                  href="/Profile/page"
                  className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-blue-50"
                >
                  <TrendingUp size={20} />
                  <span className="font-medium">Analytics</span>
                </a>
                <a
                  href="#"
                  className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors p-2 rounded-lg hover:bg-blue-50"
                >
                  <Settings size={20} />
                  <span className="font-medium">Settings</span>
                </a>
                <hr className="border-gray-200" />
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 text-red-600 hover:text-red-700 transition-colors p-2 rounded-lg hover:bg-red-50 w-full"
                >
                  <LogOut size={20} />
                  <span className="font-medium">Sign Out</span>
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Notifications */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl flex items-center">
            <AlertCircle className="mr-3" size={20} />
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 text-green-700 rounded-xl flex items-center">
            <CheckCircle className="mr-3" size={20} />
            <span>{success}</span>
            <button
              onClick={() => setSuccess(null)}
              className="ml-auto text-green-500 hover:text-green-700"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Page Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Your Profile
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Complete tasks by visiting links and uploading proof to earn
            rewards. Track your earnings and withdraw funds easily.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* User Profile Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white bg-opacity-5 rounded-full -ml-12 -mb-12"></div>

                <div className="relative z-10">
                  <div className="relative inline-block">
                    <div className="w-28 h-28 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white border-opacity-30 overflow-hidden">
                      <img
                        src={getProfileImageUrl()}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      className="absolute -bottom-2 -right-2 w-8 h-8 bg-white bg-opacity-90 hover:bg-opacity-100 rounded-full flex items-center justify-center text-blue-600 shadow-lg transition-all duration-200 transform hover:scale-110"
                    >
                      <Camera size={16} />
                    </button>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    {user?.firstName} {user?.lastName}
                  </h2>
                  <p className="text-blue-100 font-medium">{user?.email}</p>
                </div>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Personal Information
                  </h3>
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium transition-all duration-200 hover:bg-blue-50 px-3 py-2 rounded-lg"
                  >
                    <Edit3 size={16} />
                    <span>Edit</span>
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-500">
                      Phone
                    </span>
                    <span className="text-gray-900 font-medium">
                      {user?.phoneNumber}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">
                      Bank Information
                    </h4>
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-100">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Bank</span>
                          <span className="text-sm font-medium text-gray-900">
                            {user?.bankName}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Branch</span>
                          <span className="text-sm font-medium text-gray-900">
                            {user?.bankBranch}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Account</span>
                          <span className="text-sm font-mono font-medium text-gray-900">
                            {user?.bankAccountNo}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Earnings Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
              <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white bg-opacity-5 rounded-full -mr-20 -mt-20"></div>
                <div className="relative z-10">
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <DollarSign className="mr-3" size={32} />
                    Your Earnings
                  </h2>
                  <p className="text-green-100 mt-1">
                    Track your progress and manage withdrawals
                  </p>
                </div>
              </div>

              <div className="p-6">
                {isFetching ? (
                  <div className="flex items-center justify-center py-16">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                      <p className="text-gray-600 font-medium">
                        Loading earnings data...
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Stats Grid */}
                    <div className="grid md:grid-cols-2 gap-6 mb-8">
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 border border-blue-200">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-semibold text-blue-700">
                            Total Approved Tasks
                          </p>
                          <div className="w-8 h-8 bg-blue-200 rounded-lg flex items-center justify-center">
                            <TrendingUp size={16} className="text-blue-700" />
                          </div>
                        </div>
                        <p className="text-3xl font-bold text-blue-900">
                          {Math.round(earnings.totalEarned / 1.0)}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          Tasks completed
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-xl p-6 border border-purple-200">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-semibold text-purple-700">
                            Total Earned
                          </p>
                          <div className="w-8 h-8 bg-purple-200 rounded-lg flex items-center justify-center">
                            <DollarSign size={16} className="text-purple-700" />
                          </div>
                        </div>
                        <p className="text-3xl font-bold text-purple-900">
                          Rs {formatCurrency(earnings.totalEarned)}
                        </p>
                        <p className="text-xs text-purple-600 mt-1">
                          Lifetime earnings
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-6 border border-green-200">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-semibold text-green-700">
                            Available Balance
                          </p>
                          <div className="w-8 h-8 bg-green-200 rounded-lg flex items-center justify-center">
                            <Wallet size={16} className="text-green-700" />
                          </div>
                        </div>
                        <p className="text-3xl font-bold text-green-900">
                          Rs {formatCurrency(earnings.availableBalance)}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          Ready to withdraw
                        </p>
                      </div>

                      <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-xl p-6 border border-amber-200">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-semibold text-amber-700">
                            Total Withdrawn
                          </p>
                          <div className="w-8 h-8 bg-amber-200 rounded-lg flex items-center justify-center">
                            <DollarSign size={16} className="text-amber-700" />
                          </div>
                        </div>
                        <p className="text-3xl font-bold text-amber-900">
                          Rs {formatCurrency(earnings.withdrawnAmount)}
                        </p>
                        <p className="text-xs text-amber-600 mt-1">
                          Successfully withdrawn
                        </p>
                      </div>
                    </div>

                    {earnings.pendingWithdrawal > 0 && (
                      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-xl p-4 mb-6">
                        <div className="flex items-center">
                          <div className="w-4 h-4 bg-yellow-400 rounded-full mr-3 animate-pulse"></div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-yellow-800">
                              Pending Withdrawal
                            </p>
                            <p className="text-xl font-bold text-yellow-900">
                              Rs {formatCurrency(earnings.pendingWithdrawal)}
                            </p>
                            <p className="text-xs text-yellow-700 mt-1">
                              Processing within 3-5 business days
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Withdraw Button */}
                    <button
                      onClick={() => {
                        setIsWithdrawModalOpen(true);
                        setError(null);
                      }}
                      disabled={earnings.availableBalance < 500}
                      className={`w-full py-4 px-6 rounded-xl font-bold text-lg flex items-center justify-center transition-all duration-300 ${
                        earnings.availableBalance >= 500
                          ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      <DollarSign size={24} className="mr-2" />
                      {earnings.availableBalance >= 500
                        ? "Withdraw Funds"
                        : "Insufficient Balance"}
                    </button>

                    {earnings.availableBalance < 500 && (
                      <p className="text-center text-sm text-gray-500 mt-2">
                        Minimum withdrawal amount is Rs 500
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Withdrawal Rules */}
            <div className="bg-white rounded-2xl shadow-xl mt-6 p-6 border border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                  <Settings size={16} className="text-blue-600" />
                </div>
                Withdrawal Information
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
                  <div className="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-green-700 font-bold text-lg">
                      500
                    </span>
                  </div>
                  <p className="font-semibold text-green-800 mb-1">
                    Minimum Amount
                  </p>
                  <p className="text-sm text-green-600">
                    Rs 500 minimum withdrawal
                  </p>
                </div>

                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                  <div className="w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-blue-700 font-bold text-lg">3-5</span>
                  </div>
                  <p className="font-semibold text-blue-800 mb-1">
                    Processing Time
                  </p>
                  <p className="text-sm text-blue-600">
                    Business days to process
                  </p>
                </div>

                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl border border-purple-200">
                  <div className="w-16 h-16 bg-purple-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-purple-700 font-bold text-lg">
                      0%
                    </span>
                  </div>
                  <p className="font-semibold text-purple-800 mb-1">No Fees</p>
                  <p className="text-sm text-purple-600">
                    Free withdrawals always
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Enhanced Withdrawal Modal */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl transform animate-in fade-in-0 zoom-in-95 border border-gray-200">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full -mr-16 -mt-16"></div>
              <div className="relative z-10">
                <h3 className="text-xl font-bold flex items-center">
                  <Wallet className="mr-3" size={24} />
                  Withdraw Funds
                </h3>
                <p className="text-blue-100 text-sm mt-2">
                  Request a withdrawal to your bank account
                </p>
              </div>
            </div>

            <div className="p-6">
              {error && (
                <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-xl">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-red-400 rounded-full mr-3"></div>
                    {error}
                  </div>
                </div>
              )}

              <label className="block text-sm font-bold text-gray-700 mb-3">
                Amount to withdraw
              </label>
              <div className="relative mb-6">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-lg">
                  Rs
                </span>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  min="500"
                  max={earnings.availableBalance}
                  className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold transition-all duration-200"
                  placeholder={`Max: Rs${formatCurrency(
                    earnings.availableBalance,
                  )}`}
                />
              </div>

              <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 mb-6 border border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Available balance
                  </span>
                  <span className="text-xl font-bold text-gray-900">
                    Rs {formatCurrency(earnings.availableBalance)}
                  </span>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setIsWithdrawModalOpen(false);
                    setError(null);
                    setWithdrawAmount("500");
                  }}
                  className="flex-1 py-3 px-4 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleWithdraw}
                  disabled={isLoading}
                  className={`flex-1 py-3 px-4 rounded-xl font-bold text-white transition-all duration-200 ${
                    isLoading
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 shadow-lg"
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    "Request Withdrawal"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        onUpdateSuccess={handleProfileUpdateSuccess}
        apiBaseUrl="/api"
      />
    </div>
  );
}
