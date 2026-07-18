"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import adminApi from "@/lib/adminApi";
import {
  Facebook,
  Plus,
  ArrowLeft,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  ExternalLink,
  AlertCircle,
  RefreshCw,
  Loader2,
} from "lucide-react";

export default function ManageFacebookLinks() {
  const router = useRouter();
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [earnings, setEarnings] = useState("1.00");
  const [workLimit, setWorkLimit] = useState("0");
  const [active, setActive] = useState(true);

  useEffect(() => {
    fetchFacebookLinks();
  }, []);

  const fetchFacebookLinks = async () => {
    setLoading(true);
    setError("");
    try {
      // Get all links
      const response = await adminApi.get("/links");
      if (response.data.success) {
        // Filter for facebook platform only
        const fbLinks = response.data.data.filter(
          (link) => link.platform === "facebook"
        );
        setLinks(fbLinks);
      } else {
        setError(response.data.message || "Failed to load links");
      }
    } catch (err) {
      console.error("Fetch links error:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to load links"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingLink(null);
    setUrl("");
    setTitle("");
    setEarnings("1.00");
    setWorkLimit("0");
    setActive(true);
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const handleOpenEdit = (link) => {
    setEditingLink(link);
    setUrl(link.url);
    setTitle(link.title);
    setEarnings(link.earnings.toString());
    setWorkLimit((link.workLimit || 0).toString());
    setActive(link.active);
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!url || !title) {
      setError("URL and Title are required.");
      return;
    }

    const limitVal = parseInt(workLimit, 10);
    if (isNaN(limitVal) || limitVal < 0 || limitVal > 2000) {
      setError("Work limit must be a number between 0 and 2000.");
      return;
    }

    const earningsVal = parseFloat(earnings);
    if (isNaN(earningsVal) || earningsVal < 0) {
      setError("Earnings must be a valid positive number.");
      return;
    }

    const payload = {
      url,
      title,
      platform: "facebook",
      earnings: earningsVal,
      workLimit: limitVal,
      active,
    };

    setLoading(true);
    try {
      if (editingLink) {
        // Update link
        const response = await adminApi.put(`/links/${editingLink._id}`, payload);
        if (response.data.success) {
          setSuccess("Facebook link updated successfully!");
          setShowForm(false);
          fetchFacebookLinks();
        } else {
          setError(response.data.message || "Failed to update link");
        }
      } else {
        // Create link
        const response = await adminApi.post("/links", payload);
        if (response.data.success) {
          setSuccess("New Facebook link added successfully!");
          setShowForm(false);
          fetchFacebookLinks();
        } else {
          setError(response.data.message || "Failed to create link");
        }
      }
    } catch (err) {
      console.error("Save link error:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to save link"
      );
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this link? This action cannot be undone.")) {
      return;
    }

    setActionLoading(id);
    setError("");
    setSuccess("");
    try {
      const response = await adminApi.delete(`/links/${id}`);
      if (response.data.success) {
        setSuccess("Link deleted successfully!");
        fetchFacebookLinks();
      } else {
        setError(response.data.message || "Failed to delete link");
      }
    } catch (err) {
      console.error("Delete link error:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to delete link"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleActive = async (link) => {
    setActionLoading(link._id);
    setError("");
    setSuccess("");
    try {
      const response = await adminApi.put(`/links/${link._id}`, {
        ...link,
        active: !link.active,
      });
      if (response.data.success) {
        setSuccess(`Link status changed to ${!link.active ? "Active" : "Inactive"}`);
        fetchFacebookLinks();
      } else {
        setError(response.data.message || "Failed to update link status");
      }
    } catch (err) {
      console.error("Toggle active error:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to update status"
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetClicks = async (id) => {
    if (!confirm("Are you sure you want to reset user click progress and total clicks for this link?")) {
      return;
    }

    setActionLoading(id);
    setError("");
    setSuccess("");
    try {
      // First reset total clicks on the link model itself
      const response1 = await adminApi.put(`/links/${id}`, {
        totalClicks: 0,
      });
      
      // Second, reset the user clicks
      const response2 = await adminApi.post(`/links/${id}/reset-all`);
      
      if (response1.data.success && response2.data.success) {
        setSuccess("Link click stats and all user click counts successfully reset!");
        fetchFacebookLinks();
      } else {
        setError("Failed to fully reset clicks.");
      }
    } catch (err) {
      console.error("Reset clicks error:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to reset clicks"
      );
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 pb-5 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push("/admin/dashboard")}
              className="p-2 bg-white rounded-lg border border-gray-200 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors shadow-sm"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Facebook className="w-6 h-6 text-blue-600 mr-2" />
                Facebook Links Management
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Create, update, and monitor click limits on Facebook page links
              </p>
            </div>
          </div>
          <button
            onClick={handleOpenAdd}
            className="mt-4 sm:mt-0 flex items-center justify-center bg-blue-600 text-white px-5 py-2.5 rounded-xl font-medium shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]"
          >
            <Plus className="w-5 h-5 mr-1" />
            Add New Link
          </button>
        </div>

        {/* Success/Error Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2 text-red-600 font-medium">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start space-x-2 text-green-700 font-medium">
            <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Create/Edit Form (Collapsible/Modal) */}
        {showForm && (
          <div className="mb-8 bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden transition-all duration-300">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">
                {editingLink ? "Edit Facebook Link" : "Add Facebook Link"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Title / Instruction
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. පෙජ් එක ලයික් කරන්න (Like page)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Facebook URL
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://facebook.com/..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center justify-between">
                    <span>Work Limit (Clicks)</span>
                    <span className="text-xs text-gray-400 font-normal">
                      Range: 0 - 2000 (0 = No limit)
                    </span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="2000"
                    value={workLimit}
                    onChange={(e) => setWorkLimit(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Earnings (Rs)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={earnings}
                    onChange={(e) => setEarnings(e.target.value)}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-5 h-5 border border-gray-300 rounded-md accent-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                />
                <label htmlFor="active" className="text-sm font-semibold text-gray-700 select-none">
                  Make link active immediately
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 shadow-md hover:shadow-lg transition-colors flex items-center"
                >
                  {editingLink ? "Update Link" : "Create Link"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Links Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-200 rounded-2xl">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
            <p className="text-gray-500 mt-3 font-medium">Loading Facebook links...</p>
          </div>
        ) : links.length === 0 ? (
          <div className="text-center py-20 bg-white border border-gray-200 rounded-2xl shadow-sm">
            <Facebook className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg font-semibold">No Facebook links found</p>
            <p className="text-gray-400 mt-1">Get started by clicking the "Add New Link" button above</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {links.map((link) => {
              const hasLimit = link.workLimit > 0;
              const limitReached = hasLimit && link.totalClicks >= link.workLimit;
              const percent = hasLimit ? Math.min(100, Math.round((link.totalClicks / link.workLimit) * 100)) : 0;

              return (
                <div
                  key={link._id}
                  className={`bg-white border rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-all duration-200 relative ${
                    !link.active
                      ? "border-gray-200 bg-gray-50 opacity-80"
                      : limitReached
                      ? "border-amber-200 ring-2 ring-amber-100"
                      : "border-gray-200 hover:shadow-md"
                  }`}
                >
                  <div>
                    {/* Header Info */}
                    <div className="flex justify-between items-start mb-3">
                      <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 capitalize">
                        <Facebook className="w-3 h-3 mr-1" />
                        {link.platform}
                      </span>
                      <div className="flex space-x-1.5">
                        {limitReached && (
                          <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
                            Limit Reached
                          </span>
                        )}
                        <span
                          className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${
                            link.active && !limitReached
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-200 text-gray-800"
                          }`}
                        >
                          {link.active && !limitReached ? "Active" : "Inactive / Removed"}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-gray-900 line-clamp-2 min-h-[3.5rem] mb-2">
                      {link.title}
                    </h3>

                    {/* URL */}
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 font-semibold hover:underline flex items-center mb-4 break-all bg-blue-50 p-2 rounded-lg"
                    >
                      <ExternalLink className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                      <span className="truncate">{link.url}</span>
                    </a>

                    {/* Earnings and clicks information */}
                    <div className="grid grid-cols-2 gap-4 mb-5 pt-3 border-t border-gray-100">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase">Earnings</p>
                        <p className="text-lg font-extrabold text-green-600 mt-0.5">
                          Rs {link.earnings.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase">Limit</p>
                        <p className="text-lg font-bold text-gray-900 mt-0.5">
                          {hasLimit ? `${link.workLimit} Clicks` : "Unlimited"}
                        </p>
                      </div>
                    </div>

                    {/* Click Limit Progress Bar */}
                    {hasLimit && (
                      <div className="mb-5 bg-gray-100 p-3.5 rounded-xl border border-gray-200">
                        <div className="flex justify-between items-center text-xs font-semibold text-gray-700 mb-1.5">
                          <span>Progress Tracker</span>
                          <span>
                            {link.totalClicks} / {link.workLimit} clicks ({percent}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                          <div
                            className={`h-2.5 rounded-full transition-all duration-500 ${
                              limitReached ? "bg-amber-500" : "bg-blue-600"
                            }`}
                            style={{ width: `${percent}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    
                    {!hasLimit && (
                      <div className="mb-5 bg-gray-50 p-3 text-center text-xs font-medium text-gray-500 border border-gray-100 rounded-xl">
                        Total tracked clicks: {link.totalClicks || 0} (No limit set)
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                    <button
                      disabled={actionLoading === link._id}
                      onClick={() => handleToggleActive(link)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${
                        link.active
                          ? "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
                          : "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                      }`}
                    >
                      {link.active ? "Deactivate" : "Activate"}
                    </button>

                    <div className="flex items-center space-x-2">
                      <button
                        title="Reset click counts for this link"
                        disabled={actionLoading === link._id}
                        onClick={() => handleResetClicks(link._id)}
                        className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-blue-50 hover:text-blue-600 transition-colors border border-gray-200"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>

                      <button
                        title="Edit link details"
                        disabled={actionLoading === link._id}
                        onClick={() => handleOpenEdit(link)}
                        className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-colors border border-gray-200"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        title="Delete link"
                        disabled={actionLoading === link._id}
                        onClick={() => handleDelete(link._id)}
                        className="p-2 bg-gray-100 text-red-600 rounded-lg hover:bg-red-50 hover:text-red-700 transition-colors border border-gray-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
