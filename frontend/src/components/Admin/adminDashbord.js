"use client";
import { useState, useEffect } from "react";
import { useAdminAuth } from "@/Context/AdminAuthContext";
import { useRouter } from "next/navigation";
import adminApi from "@/lib/adminApi";

import {
  Users,
  CheckCircle,
  Clock,
  XCircle,
  Image,
  Facebook,
  Youtube,
  MessageSquare,
  Star,
  Search,
  Download,
  Eye,
  Trash2,
  AlertCircle,
  BarChart3,
  FileImage,
  ThumbsUp,
  MessageCircle,
  StarIcon,
  Instagram,
  Chrome,
  RefreshCw,
} from "lucide-react";

export default function AdminDashboard() {
  const { adminUser, adminLogout, isAuthenticated } = useAdminAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [submissions, setSubmissions] = useState({
    submissions: [],
    pagination: {},
    statusCounts: {},
  });
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    platform: "all",
    status: "all",
    page: 1,
    search: "",
    dateFrom: "",
    dateTo: "",
  });
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/admin/login");
      return;
    }

    const loadData = async () => {
      if (activeTab === "dashboard") {
        await fetchStatistics();
      } else {
        await fetchSubmissions();
      }
    };

    loadData();
  }, [activeTab, filter, isAuthenticated, router, retryCount]);

  const fetchStatistics = async () => {
    try {
      setError(null);
      const response = await adminApi.get("/admin/stats");
      setStatistics(response.data.data);
    } catch (error) {
      console.error("Failed to fetch statistics:", error);
      setError("Failed to load dashboard statistics");
    }
  };

  const fetchSubmissions = async () => {
    setLoading(true);
    setError(null);
    try {
      // Clean filter object - remove empty values
      const cleanFilter = {};
      Object.keys(filter).forEach((key) => {
        if (filter[key] && filter[key] !== "") {
          cleanFilter[key] = filter[key];
        }
      });

      const response = await adminApi.get("/admin/submissions", {
        params: cleanFilter,
      });

      if (response.data.success) {
        setSubmissions(response.data.data);
      } else {
        setError(response.data.message || "Failed to load submissions");
      }
    } catch (error) {
      console.error("Failed to fetch submissions:", error);

      // Show more specific error message
      if (error.response?.data?.message) {
        setError(`Server Error: ${error.response.data.message}`);
      } else if (error.message.includes("timeout")) {
        setError("Request timed out. Please try again.");
      } else if (error.response?.status === 500) {
        setError("Server error. Please check the server logs.");
      } else {
        setError("Failed to load submissions. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const updateSubmissionStatus = async (
    combinedId,
    status,
    rejectionReason = "",
  ) => {
    setActionLoading(combinedId);
    try {
      await adminApi.put("/admin/submissions/status", {
        combinedId,
        status,
        rejectionReason,
      });

      // Refresh data
      if (activeTab === "dashboard") {
        await fetchStatistics();
      } else {
        await fetchSubmissions();
      }

      alert(`Submission ${status} successfully!`);
    } catch (error) {
      console.error("Failed to update submission:", error);
      alert(
        "Failed to update submission: " +
          (error.response?.data?.message || error.message),
      );
    } finally {
      setActionLoading(null);
    }
  };

  const deleteSubmission = async (combinedId) => {
    if (!confirm("Are you sure you want to delete this submission?")) return;

    // Parse the combinedId to get platformType and submissionId
    const parts = combinedId.split("_");
    if (parts.length < 3) {
      alert("Invalid submission ID format");
      return;
    }

    const platformType = parts[0] + "_" + parts[1];
    const submissionId = parts.slice(2).join("_");

    setActionLoading(combinedId);
    try {
      await adminApi.delete(
        `/admin/submissions/${platformType}/${submissionId}`,
      );

      // Refresh data
      if (activeTab === "dashboard") {
        await fetchStatistics();
      } else {
        await fetchSubmissions();
      }

      alert("Submission deleted successfully!");
    } catch (error) {
      console.error("Failed to delete submission:", error);
      alert(
        "Failed to delete submission: " +
          (error.response?.data?.message || error.message),
      );
    } finally {
      setActionLoading(null);
    }
  };

  const getPlatformIcon = (platformType, submissionType) => {
    switch (platformType) {
      case "facebook":
        if (submissionType === "review")
          return <Star className="w-4 h-4 text-yellow-600" />;
        if (submissionType === "comment")
          return <MessageCircle className="w-4 h-4 text-blue-600" />;
        return <Facebook className="w-4 h-4 text-blue-600" />;
      case "youtube":
        return <Youtube className="w-4 h-4 text-red-600" />;
      case "google":
        return <Chrome className="w-4 h-4 text-green-600" />;
      case "Instrgram":
        return <Instagram className="w-4 h-4 text-purple-600" />;
      case "Tiktok":
        return <MessageSquare className="w-4 h-4 text-black" />;
      default:
        return <MessageSquare className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "approved":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "pending":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "rejected":
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getAmountByType = (submission) => {
    if (submission.amount) {
      return `Rs ${submission.amount.toFixed(2)}`;
    }

    switch (submission.submissionType) {
      case "page":
        return "Rs 1.00";
      case "review":
        return submission.platformType === "google" ? "Rs 40.00" : "Rs 30.00";
      case "comment":
        return "Rs 15.00";
      case "video":
        return "Rs 2.00";
      default:
        return "Rs 1.00";
    }
  };

  const openImageModal = (submission) => {
    setSelectedSubmission(submission);
    setShowImageModal(true);
  };

  const exportSubmissions = () => {
    const headers = [
      "User",
      "Platform",
      "Type",
      "Status",
      "Amount",
      "Date",
      "User Email",
      "User Phone",
    ];

    const data =
      submissions.submissions?.map((sub) => [
        `${sub.user?.firstName || ""} ${sub.user?.lastName || ""}`.trim(),
        sub.platformType,
        sub.submissionType,
        sub.status,
        getAmountByType(sub),
        new Date(sub.createdAt).toLocaleDateString(),
        sub.user?.email || "",
        sub.user?.phoneNumber || "",
      ]) || [];

    const csvContent = [headers, ...data]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `submissions-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
  };

  if (!isAuthenticated()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h2>
          <p className="text-gray-600">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {adminUser?.firstName} ({adminUser?.role})
              </span>
              <button
                onClick={adminLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md text-sm hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: "dashboard", label: "Dashboard", icon: BarChart3 },
              { id: "submissions", label: "Submissions", icon: FileImage },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setFilter((prev) => ({ ...prev, page: 1 }));
                  setError(null);
                }}
                className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between">
              <div className="flex items-center mb-2 sm:mb-0">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <span className="text-red-700">{error}</span>
              </div>
              <button
                onClick={handleRetry}
                className="flex items-center text-sm bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200 transition-colors"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Retry
              </button>
            </div>
          </div>
        )}

        {activeTab === "dashboard" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>

            {statistics ? (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">
                          Total Submissions
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {statistics.totalSubmissions}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <CheckCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">
                          Approved
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {statistics.approvedSubmissions}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-yellow-100 rounded-lg">
                        <Clock className="w-6 h-6 text-yellow-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">
                          Pending
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {statistics.pendingSubmissions}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                      <div className="p-3 bg-red-100 rounded-lg">
                        <XCircle className="w-6 h-6 text-red-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">
                          Rejected
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {statistics.rejectedSubmissions}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Statistics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Earnings Summary
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">
                          Total Earned by Users
                        </span>
                        <span className="font-semibold">
                          Rs{" "}
                          {statistics.earnings?.totalEarned?.toFixed(2) ||
                            "0.00"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pending Approval</span>
                        <span className="font-semibold">
                          Rs{" "}
                          {statistics.earnings?.pendingAmount?.toFixed(2) ||
                            "0.00"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Recent Activity (30 days)
                    </h3>
                    <div className="flex items-center justify-center h-20">
                      <p className="text-3xl font-bold text-blue-600">
                        {statistics.recentSubmissions}
                      </p>
                      <span className="ml-2 text-gray-600">
                        new submissions
                      </span>
                    </div>
                  </div>
                </div>

                {/* Top Users */}
                {statistics.topUsers && statistics.topUsers.length > 0 && (
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">
                      Top Users
                    </h3>
                    <div className="space-y-3">
                      {statistics.topUsers.slice(0, 5).map((user, index) => (
                        <div
                          key={user._id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded"
                        >
                          <div className="flex items-center space-x-3">
                            <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </span>
                            <div>
                              <p className="font-medium">
                                {user.firstName} {user.lastName}
                              </p>
                              <p className="text-sm text-gray-600">
                                {user.email}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              {user.totalSubmissions} submissions
                            </p>
                            <p className="text-sm text-green-600">
                              {user.approvedSubmissions} approved
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading statistics...</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "submissions" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                All Submissions
              </h2>
              <div className="flex space-x-3">
                <button
                  onClick={exportSubmissions}
                  disabled={loading || submissions.submissions?.length === 0}
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-4 h-4" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Platform
                  </label>
                  <select
                    value={filter.platform}
                    onChange={(e) =>
                      setFilter({
                        ...filter,
                        platform: e.target.value,
                        page: 1,
                      })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="all">All Platforms</option>
                    <option value="facebook">Facebook</option>
                    <option value="Instrgram">Instagram</option>
                    <option value="Tiktok">Tiktok</option>
                    <option value="youtube">YouTube</option>
                    <option value="google">Google</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={filter.status}
                    onChange={(e) =>
                      setFilter({ ...filter, status: e.target.value, page: 1 })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date From
                  </label>
                  <input
                    type="date"
                    value={filter.dateFrom}
                    onChange={(e) =>
                      setFilter({
                        ...filter,
                        dateFrom: e.target.value,
                        page: 1,
                      })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date To
                  </label>
                  <input
                    type="date"
                    value={filter.dateTo}
                    onChange={(e) =>
                      setFilter({ ...filter, dateTo: e.target.value, page: 1 })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search Users
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by name or email..."
                      value={filter.search}
                      onChange={(e) =>
                        setFilter({
                          ...filter,
                          search: e.target.value,
                          page: 1,
                        })
                      }
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Status Summary */}
            {submissions.statusCounts && (
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-yellow-400">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">
                      Pending
                    </span>
                    <span className="text-2xl font-bold text-yellow-600">
                      {submissions.statusCounts.pending}
                    </span>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-400">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">
                      Approved
                    </span>
                    <span className="text-2xl font-bold text-green-600">
                      {submissions.statusCounts.approved}
                    </span>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-red-400">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">
                      Rejected
                    </span>
                    <span className="text-2xl font-bold text-red-600">
                      {submissions.statusCounts.rejected}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <p className="text-gray-600">{error}</p>
                <button
                  onClick={handleRetry}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                {submissions.submissions?.length === 0 ? (
                  <div className="text-center py-12">
                    <Image className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      No submissions found matching your filters.
                    </p>
                  </div>
                ) : (
                  <>
                    <ul className="divide-y divide-gray-200">
                      {submissions.submissions?.map((submission) => (
                        <li
                          key={submission._id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <div className="px-4 py-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 flex-1">
                                {/* Screenshot Thumbnail */}
                                <div
                                  className="flex-shrink-0 h-16 w-16 cursor-pointer"
                                  onClick={() => openImageModal(submission)}
                                >
                                  <img
                                    className="h-16 w-16 object-cover rounded border shadow-sm"
                                    src={submission.screenshot}
                                    alt="Submission screenshot"
                                    onError={(e) => {
                                      e.target.src =
                                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'%3E%3C/circle%3E%3Cpolyline points='21,15 16,10 5,21'%3E%3C/polyline%3E%3C/svg%3E";
                                    }}
                                  />
                                </div>

                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center space-x-3 mb-2">
                                    <div className="flex items-center space-x-2 mb-2">
                                      {getPlatformIcon(
                                        submission.platformType,
                                        submission.submissionType,
                                      )}
                                      <span className="text-sm font-medium text-gray-900 capitalize">
                                        {submission.platformType}{" "}
                                        {submission.submissionType}
                                      </span>
                                      <span
                                        className={getStatusBadge(
                                          submission.status,
                                        )}
                                      >
                                        {submission.status}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                                    <div>
                                      <span className="font-medium">User:</span>{" "}
                                      {submission.user?.firstName}{" "}
                                      {submission.user?.lastName}
                                    </div>
                                    <div>
                                      <span className="font-medium">
                                        Email:
                                      </span>{" "}
                                      {submission.user?.email}
                                    </div>
                                    <div>
                                      <span className="font-medium">
                                        Amount:
                                      </span>{" "}
                                      {getAmountByType(submission)}
                                    </div>
                                    <div>
                                      <span className="font-medium">
                                        Submitted:
                                      </span>{" "}
                                      {new Date(
                                        submission.createdAt,
                                      ).toLocaleDateString()}
                                    </div>
                                    <div>
                                      <span className="font-medium">
                                        Phone:
                                      </span>{" "}
                                      {submission.user?.phoneNumber}
                                    </div>
                                  </div>

                                  {submission.rejectionReason && (
                                    <div className="mt-2">
                                      <span className="text-sm font-medium text-red-600">
                                        Rejection Reason:
                                      </span>
                                      <span className="text-sm text-red-600 ml-2">
                                        {submission.rejectionReason}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center space-x-2 ml-4">
                                {/* Action Buttons */}
                                {submission.status === "pending" && (
                                  <>
                                    <button
                                      onClick={() =>
                                        updateSubmissionStatus(
                                          submission.combinedId ||
                                            submission._id,
                                          "approved",
                                        )
                                      }
                                      disabled={
                                        actionLoading ===
                                        (submission.combinedId ||
                                          submission._id)
                                      }
                                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
                                    >
                                      {actionLoading ===
                                      (submission.combinedId || submission._id)
                                        ? "..."
                                        : "Approve"}
                                    </button>
                                    <button
                                      onClick={() => {
                                        const reason =
                                          prompt("Rejection reason:");
                                        if (reason !== null) {
                                          updateSubmissionStatus(
                                            submission.combinedId ||
                                              submission._id,
                                            "rejected",
                                            reason,
                                          );
                                        }
                                      }}
                                      disabled={
                                        actionLoading ===
                                        (submission.combinedId ||
                                          submission._id)
                                      }
                                      className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
                                    >
                                      {actionLoading ===
                                      (submission.combinedId || submission._id)
                                        ? "..."
                                        : "Reject"}
                                    </button>
                                  </>
                                )}

                                <button
                                  onClick={() => openImageModal(submission)}
                                  className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>

                                <button
                                  onClick={() =>
                                    deleteSubmission(
                                      submission.combinedId || submission._id,
                                    )
                                  }
                                  disabled={
                                    actionLoading ===
                                    (submission.combinedId || submission._id)
                                  }
                                  className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors disabled:opacity-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>

                    {/* Pagination */}
                    {submissions.pagination && (
                      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                        <div className="flex justify-between items-center w-full">
                          <div>
                            <p className="text-sm text-gray-700">
                              Showing page {submissions.pagination.currentPage}{" "}
                              of {submissions.pagination.totalPages} •{" "}
                              {submissions.pagination.totalSubmissions} total
                              submissions
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() =>
                                setFilter({ ...filter, page: filter.page - 1 })
                              }
                              disabled={!submissions.pagination.hasPrev}
                              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                              Previous
                            </button>
                            <button
                              onClick={() =>
                                setFilter({ ...filter, page: filter.page + 1 })
                              }
                              disabled={!submissions.pagination.hasNext}
                              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Image Modal */}
      {showImageModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-medium">
                {selectedSubmission.platformType}{" "}
                {selectedSubmission.submissionType} -{" "}
                {selectedSubmission.user?.firstName}{" "}
                {selectedSubmission.user?.lastName}
              </h3>
              <button
                onClick={() => setShowImageModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
              <img
                src={selectedSubmission.screenshot}
                alt="Full size submission"
                className="w-full h-auto rounded-lg shadow-lg"
                onError={(e) => {
                  e.target.src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'%3E%3C/circle%3E%3Cpolyline points='21,15 16,10 5,21'%3E%3C/polyline%3E%3C/svg%3E";
                }}
              />
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>User:</strong> {selectedSubmission.user?.firstName}{" "}
                  {selectedSubmission.user?.lastName}
                </div>
                <div>
                  <strong>Email:</strong> {selectedSubmission.user?.email}
                </div>
                <div>
                  <strong>Phone:</strong> {selectedSubmission.user?.phoneNumber}
                </div>
                <div>
                  <strong>Submitted:</strong>{" "}
                  {new Date(selectedSubmission.createdAt).toLocaleString()}
                </div>
                <div>
                  <strong>Status:</strong>{" "}
                  <span className={getStatusBadge(selectedSubmission.status)}>
                    {selectedSubmission.status}
                  </span>
                </div>
                <div>
                  <strong>Amount:</strong> {getAmountByType(selectedSubmission)}
                </div>
                <div>
                  <strong>Platform:</strong> {selectedSubmission.platformType}
                </div>
                <div>
                  <strong>Type:</strong> {selectedSubmission.submissionType}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
