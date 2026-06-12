"use client";
import { useState, useEffect } from "react";
import { useAdminAuth } from "@/Context/AdminAuthContext";
import { useRouter } from "next/navigation";
import adminApi from "@/lib/adminApi";

// Import icons
import {
  Users,
  DollarSign,
  CheckCircle,
  Clock,
  XCircle,
  Image as ImageIcon,
  Facebook,
  Youtube,
  MessageSquare,
  Star,
  Filter,
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
  Grid3x3,
  List,
  Check,
  X,
  CheckSquare,
  Square,
  Select,
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
  const [viewMode, setViewMode] = useState("list");
  const [selectedSubmissions, setSelectedSubmissions] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/admin/login");
      return;
    }

    if (activeTab === "dashboard") {
      fetchStatistics();
    } else {
      fetchSubmissions();
    }
  }, [adminUser, filter, activeTab, isAuthenticated, router]);

  // Clear selections when submissions change
  useEffect(() => {
    setSelectedSubmissions(new Set());
    setSelectAll(false);
  }, [submissions.submissions]);

  const fetchStatistics = async () => {
    try {
      const response = await adminApi.get("/admin/stats");
      setStatistics(response.data.data);
    } catch (error) {
      console.error("Failed to fetch statistics:", error);
    }
  };

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.platform !== "all") params.append("platform", filter.platform);
      if (filter.status !== "all") params.append("status", filter.status);
      if (filter.search) params.append("search", filter.search);
      if (filter.dateFrom) params.append("dateFrom", filter.dateFrom);
      if (filter.dateTo) params.append("dateTo", filter.dateTo);
      params.append("page", filter.page.toString());
      params.append("limit", "100");

      const response = await adminApi.get(`/admin/submissions?${params}`);
      setSubmissions(response.data.data);
    } catch (error) {
      console.error("Failed to fetch submissions:", error);
      if (error.response?.status === 500) {
        alert(
          "Server error. Please try again with different filters or contact support.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Selection handlers
  const toggleSelectSubmission = (submissionId) => {
    const newSelected = new Set(selectedSubmissions);
    if (newSelected.has(submissionId)) {
      newSelected.delete(submissionId);
    } else {
      newSelected.add(submissionId);
    }
    setSelectedSubmissions(newSelected);
    setSelectAll(newSelected.size === submissions.submissions.length);
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedSubmissions(new Set());
    } else {
      const allIds = submissions.submissions.map(
        (sub) => sub.combinedId || sub._id,
      );
      setSelectedSubmissions(new Set(allIds));
    }
    setSelectAll(!selectAll);
  };

  const clearSelection = () => {
    setSelectedSubmissions(new Set());
    setSelectAll(false);
  };

  // Bulk actions
  const bulkDeleteSubmissions = async () => {
    if (selectedSubmissions.size === 0) {
      alert("Please select at least one submission to delete.");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete ${selectedSubmissions.size} submission(s)? This action cannot be undone.`,
      )
    ) {
      return;
    }

    setBulkActionLoading(true);
    const results = { success: 0, failed: 0 };

    // Process each submission individually
    for (const combinedId of Array.from(selectedSubmissions)) {
      try {
        // Parse combinedId to get platformType and actual ID
        const parts = combinedId.split("_");
        if (parts.length >= 3) {
          const platformType = parts[0] + "_" + parts[1];
          const submissionId = parts[2];

          console.log(`Deleting: ${platformType}/${submissionId}`);

          await adminApi.delete(
            `/admin/submissions/${platformType}/${submissionId}`,
          );

          results.success++;
        } else {
          throw new Error("Invalid submission ID format");
        }
      } catch (error) {
        console.error(`Failed to delete ${combinedId}:`, error);
        results.failed++;
      }
    }

    alert(
      `Bulk delete completed: ${results.success} successful, ${results.failed} failed`,
    );

    if (results.success > 0) {
      clearSelection();
      fetchSubmissions(); // Refresh the list
    }

    setBulkActionLoading(false);
  };

  const bulkApproveSubmissions = async () => {
    if (selectedSubmissions.size === 0) {
      alert("Please select at least one submission to approve.");
      return;
    }

    if (
      !confirm(
        `Are you sure you want to approve ${selectedSubmissions.size} submission(s)?`,
      )
    ) {
      return;
    }

    setBulkActionLoading(true);
    const results = { success: 0, failed: 0 };

    for (const submissionId of Array.from(selectedSubmissions)) {
      try {
        await adminApi.put("/admin/submissions/status", {
          combinedId: submissionId,
          status: "approved",
        });
        results.success++;
      } catch (error) {
        console.error(`Failed to approve ${submissionId}:`, error);
        results.failed++;
      }
    }

    alert(
      `Bulk approve completed: ${results.success} successful, ${results.failed} failed`,
    );
    clearSelection();
    fetchSubmissions(); // Refresh the list
    setBulkActionLoading(false);
  };

  // Individual action functions (keep your existing ones)
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

      // Remove from selection if it was selected
      const newSelected = new Set(selectedSubmissions);
      newSelected.delete(combinedId);
      setSelectedSubmissions(newSelected);

      fetchSubmissions();
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

    setActionLoading(combinedId);
    try {
      const parts = combinedId.split("_");
      if (parts.length >= 3) {
        const platformType = parts[0] + "_" + parts[1];
        const submissionId = parts[2];

        await adminApi.delete(
          `/admin/submissions/${platformType}/${submissionId}`,
        );

        // Remove from selection if it was selected
        const newSelected = new Set(selectedSubmissions);
        newSelected.delete(combinedId);
        setSelectedSubmissions(newSelected);

        fetchSubmissions();
        alert("Submission deleted successfully!");
      } else {
        throw new Error("Invalid submission ID format");
      }
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

  // Get platform icon (keep your existing function)
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
      case "instagram":
        return <Instagram className="w-4 h-4 text-pink-600" />;
      case "tiktok":
        return <MessageSquare className="w-4 h-4 text-black" />;
      default:
        return <MessageSquare className="w-4 h-4 text-gray-600" />;
    }
  };

  // Get status badge (keep your existing function)
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

  // Get amount by type (keep your existing function)
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

  // Open image modal (keep your existing function)
  const openImageModal = (submission) => {
    setSelectedSubmission(submission);
    setShowImageModal(true);
  };

  // Export submissions (keep your existing function)
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

  // Updated renderSubmissionItem for grid view with selection
  const renderSubmissionItem = (submission) => {
    const submissionId = submission.combinedId || submission._id;
    const isSelected = selectedSubmissions.has(submissionId);

    return (
      <div
        key={submission._id}
        className={`bg-white rounded-lg shadow-sm border transition-all duration-200 ${isSelected ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200 hover:shadow-md"}`}
      >
        {/* Selection checkbox in top-right corner */}
        <div className="absolute top-2 right-2 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSelectSubmission(submissionId);
            }}
            className={`p-1 rounded-full ${isSelected ? "bg-blue-500 text-white" : "bg-white text-gray-400 border border-gray-300"}`}
          >
            {isSelected ? (
              <Check className="w-3 h-3" />
            ) : (
              <Square className="w-3 h-3" />
            )}
          </button>
        </div>

        {/* Screenshot */}
        <div
          className="h-48 w-full cursor-pointer overflow-hidden rounded-t-lg relative"
          onClick={() => openImageModal(submission)}
        >
          {isSelected && (
            <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
              <Check className="w-8 h-8 text-blue-600" />
            </div>
          )}
          <img
            className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
            src={submission.screenshot}
            alt="Submission screenshot"
            onError={(e) => {
              e.target.src =
                "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'%3E%3C/circle%3E%3Cpolyline points='21,15 16,10 5,21'%3E%3C/polyline%3E%3C/svg%3E";
            }}
          />
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center space-x-2">
              {getPlatformIcon(
                submission.platformType,
                submission.submissionType,
              )}
              <span className="text-sm font-medium capitalize">
                {submission.platformType} {submission.submissionType}
              </span>
            </div>
            <span className={getStatusBadge(submission.status)}>
              {submission.status}
            </span>
          </div>

          <div className="text-sm text-gray-600 mb-2">
            <div className="font-medium truncate">
              {submission.user?.firstName} {submission.user?.lastName}
            </div>
            <div className="text-xs text-gray-500 truncate">
              {submission.user?.email}
            </div>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="font-medium">{getAmountByType(submission)}</span>
            <span className="text-gray-500">
              {new Date(submission.createdAt).toLocaleDateString()}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 mt-3">
            <button
              onClick={() => openImageModal(submission)}
              className="flex-1 bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
            >
              <Eye className="w-3 h-3 inline mr-1" />
              View
            </button>

            {submission.status === "pending" && (
              <button
                onClick={() => updateSubmissionStatus(submissionId, "approved")}
                disabled={actionLoading === submissionId}
                className="flex-1 bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                ✓
              </button>
            )}

            <button
              onClick={() => deleteSubmission(submissionId)}
              disabled={actionLoading === submissionId}
              className="flex-1 bg-red-600 text-white px-2 py-1 rounded text-xs hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              🗑
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Platform Statistics Component (keep your existing)
  const PlatformStats = () => {
    const platforms = [
      { name: "facebook", label: "Facebook", color: "blue", icon: Facebook },
      { name: "instagram", label: "Instagram", color: "pink", icon: Instagram },
      { name: "tiktok", label: "TikTok", color: "black", icon: MessageSquare },
      { name: "google", label: "Google", color: "green", icon: Chrome },
      { name: "youtube", label: "YouTube", color: "red", icon: Youtube },
    ];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {platforms.map((platform) => {
          const platformSubmissions = submissions.submissions.filter(
            (sub) => sub.platformType === platform.name,
          );
          const Icon = platform.icon;

          return (
            <div
              key={platform.name}
              className={`bg-white rounded-lg shadow p-4 border-l-4 border-${platform.color}-500`}
              onClick={() =>
                setFilter({ ...filter, platform: platform.name, page: 1 })
              }
              style={{ cursor: "pointer" }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div
                    className={`p-2 bg-${platform.color}-100 rounded-lg mr-3`}
                  >
                    <Icon className={`w-5 h-5 text-${platform.color}-600`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {platform.label}
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                      {platformSubmissions.length}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">
                    {
                      platformSubmissions.filter((s) => s.status === "approved")
                        .length
                    }{" "}
                    approved
                  </div>
                  <div className="text-xs text-gray-500">
                    {
                      platformSubmissions.filter((s) => s.status === "pending")
                        .length
                    }{" "}
                    pending
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
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
                  clearSelection();
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
        {activeTab === "dashboard" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>

            {statistics && (
              <>
                {/* Platform Statistics */}
                <PlatformStats />

                {/* Overall Stats Grid */}
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
            )}
          </div>
        )}

        {activeTab === "submissions" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                All Submissions
                {selectedSubmissions.size > 0 && (
                  <span className="ml-2 text-sm font-normal text-blue-600">
                    ({selectedSubmissions.size} selected)
                  </span>
                )}
              </h2>
              <div className="flex space-x-3">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded ${viewMode === "list" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded ${viewMode === "grid" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"}`}
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={exportSubmissions}
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {/* Bulk Action Bar - Only show when items are selected */}
            {selectedSubmissions.size > 0 && (
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <CheckSquare className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-blue-800">
                      {selectedSubmissions.size} submission(s) selected
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={clearSelection}
                      className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      Clear selection
                    </button>
                    <button
                      onClick={bulkApproveSubmissions}
                      disabled={bulkActionLoading}
                      className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      {bulkActionLoading ? (
                        <span className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Approving...
                        </span>
                      ) : (
                        `Approve ${selectedSubmissions.size}`
                      )}
                    </button>
                    <button
                      onClick={bulkDeleteSubmissions}
                      disabled={bulkActionLoading}
                      className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {bulkActionLoading ? (
                        <span className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Deleting...
                        </span>
                      ) : (
                        `Delete ${selectedSubmissions.size}`
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Platform
                  </label>
                  <select
                    value={filter.platform}
                    onChange={(e) => {
                      setFilter({
                        ...filter,
                        platform: e.target.value,
                        page: 1,
                      });
                      clearSelection();
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  >
                    <option value="all">All Platforms</option>
                    <option value="facebook_page">Facebook Page</option>
                    <option value="facebook_review">Facebook Review</option>
                    <option value="facebook_comment">Facebook Comment</option>
                    <option value="instagram_page">Instagram</option>
                    <option value="tiktok_page">TikTok</option>
                    <option value="youtube_video">YouTube</option>
                    <option value="google_review">Google Review</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={filter.status}
                    onChange={(e) => {
                      setFilter({ ...filter, status: e.target.value, page: 1 });
                      clearSelection();
                    }}
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
                    onChange={(e) => {
                      setFilter({
                        ...filter,
                        dateFrom: e.target.value,
                        page: 1,
                      });
                      clearSelection();
                    }}
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
                    onChange={(e) => {
                      setFilter({ ...filter, dateTo: e.target.value, page: 1 });
                      clearSelection();
                    }}
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
                      onChange={(e) => {
                        setFilter({
                          ...filter,
                          search: e.target.value,
                          page: 1,
                        });
                        clearSelection();
                      }}
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
            ) : submissions.submissions?.length === 0 ? (
              <div className="text-center py-12">
                <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  No submissions found matching your filters.
                </p>
              </div>
            ) : viewMode === "grid" ? (
              // Grid View
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {submissions.submissions.map(renderSubmissionItem)}
              </div>
            ) : (
              // List View
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {/* Select All Header for List View */}
                  <li className="bg-gray-50 px-4 py-3">
                    <div className="flex items-center">
                      <button
                        onClick={toggleSelectAll}
                        className={`p-1 mr-3 rounded ${selectAll ? "bg-blue-500 text-white" : "bg-white text-gray-400 border border-gray-300"}`}
                      >
                        {selectAll ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                      <span className="text-sm font-medium text-gray-700">
                        {selectAll ? "Deselect all" : "Select all"} on this page
                      </span>
                      {selectedSubmissions.size > 0 && (
                        <span className="ml-2 text-sm text-blue-600">
                          ({selectedSubmissions.size} selected)
                        </span>
                      )}
                    </div>
                  </li>

                  {submissions.submissions.map((submission) => {
                    const submissionId =
                      submission.combinedId || submission._id;
                    const isSelected = selectedSubmissions.has(submissionId);

                    return (
                      <li
                        key={submission._id}
                        className={`hover:bg-gray-50 transition-colors ${isSelected ? "bg-blue-50" : ""}`}
                      >
                        <div className="px-4 py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4 flex-1">
                              {/* Selection checkbox */}
                              <button
                                onClick={() =>
                                  toggleSelectSubmission(submissionId)
                                }
                                className={`p-1 rounded ${isSelected ? "bg-blue-500 text-white" : "bg-white text-gray-400 border border-gray-300"}`}
                              >
                                {isSelected ? (
                                  <Check className="w-4 h-4" />
                                ) : (
                                  <Square className="w-4 h-4" />
                                )}
                              </button>

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

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                                  <div>
                                    <span className="font-medium">User:</span>{" "}
                                    {submission.user?.firstName}{" "}
                                    {submission.user?.lastName}
                                  </div>
                                  <div>
                                    <span className="font-medium">Email:</span>{" "}
                                    {submission.user?.email}
                                  </div>
                                  <div>
                                    <span className="font-medium">Amount:</span>{" "}
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
                                    <span className="font-medium">Phone:</span>{" "}
                                    {submission.user?.phoneNumber}
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2 ml-4">
                              {submission.status === "pending" && (
                                <>
                                  <button
                                    onClick={() =>
                                      updateSubmissionStatus(
                                        submissionId,
                                        "approved",
                                      )
                                    }
                                    disabled={actionLoading === submissionId}
                                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
                                  >
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => {
                                      const reason =
                                        prompt("Rejection reason:");
                                      if (reason !== null) {
                                        updateSubmissionStatus(
                                          submissionId,
                                          "rejected",
                                          reason,
                                        );
                                      }
                                    }}
                                    disabled={actionLoading === submissionId}
                                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
                                  >
                                    Reject
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
                                onClick={() => deleteSubmission(submissionId)}
                                disabled={actionLoading === submissionId}
                                className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 transition-colors disabled:opacity-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Pagination */}
            {submissions.pagination && submissions.submissions?.length > 0 && (
              <div className="mt-6 bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow">
                <div className="flex justify-between items-center w-full">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing page {submissions.pagination.currentPage} of{" "}
                      {submissions.pagination.totalPages} •{" "}
                      {submissions.pagination.totalSubmissions} total
                      submissions • {selectedSubmissions.size} selected
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setFilter({ ...filter, page: filter.page - 1 });
                        clearSelection();
                      }}
                      disabled={
                        !submissions.pagination.hasPrev || filter.page === 1
                      }
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => {
                        setFilter({ ...filter, page: filter.page + 1 });
                        clearSelection();
                      }}
                      disabled={!submissions.pagination.hasNext}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
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
                className="w-full h-auto rounded-lg shadow-lg mb-4"
                onError={(e) => {
                  e.target.src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='3' y='3' width='18' height='18' rx='2' ry='2'%3E%3C/rect%3E%3Ccircle cx='8.5' cy='8.5' r='1.5'%3E%3C/circle%3E%3Cpolyline points='21,15 16,10 5,21'%3E%3C/polyline%3E%3C/svg%3E";
                }}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
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
                {selectedSubmission.rejectionReason && (
                  <div className="md:col-span-2">
                    <strong>Rejection Reason:</strong>{" "}
                    <span className="text-red-600">
                      {selectedSubmission.rejectionReason}
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-4 flex space-x-2">
                {selectedSubmission.status === "pending" && (
                  <>
                    <button
                      onClick={() => {
                        updateSubmissionStatus(
                          selectedSubmission.combinedId ||
                            selectedSubmission._id,
                          "approved",
                        );
                        setShowImageModal(false);
                      }}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt("Rejection reason:");
                        if (reason !== null) {
                          updateSubmissionStatus(
                            selectedSubmission.combinedId ||
                              selectedSubmission._id,
                            "rejected",
                            reason,
                          );
                          setShowImageModal(false);
                        }
                      }}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
                    >
                      Reject
                    </button>
                  </>
                )}
                <button
                  onClick={() => {
                    deleteSubmission(
                      selectedSubmission.combinedId || selectedSubmission._id,
                    );
                    setShowImageModal(false);
                  }}
                  className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
