"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import adminApi from "@/lib/adminApi";
import {
  Plus,
  ArrowLeft,
  Edit2,
  Trash2,
  CheckCircle,
  ExternalLink,
  AlertCircle,
  RefreshCw,
  Loader2,
  Music,
  Link as LinkIcon,
  TrendingUp,
  Activity,
  Zap,
} from "lucide-react";

export default function ManageTiktokLinks() {
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
    fetchTiktokLinks();
  }, []);

  const fetchTiktokLinks = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await adminApi.get("/links");
      if (response.data.success) {
        const tiktokLinks = response.data.data.filter(
          (link) => link.platform === "tiktok",
        );
        setLinks(tiktokLinks);
      } else {
        setError(response.data.message || "Failed to load links");
      }
    } catch (err) {
      console.error("Fetch links error:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to load links",
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
      platform: "tiktok",
      earnings: earningsVal,
      workLimit: limitVal,
      active,
    };

    setLoading(true);
    try {
      if (editingLink) {
        const response = await adminApi.put(
          `/links/${editingLink._id}`,
          payload,
        );
        if (response.data.success) {
          setSuccess("TikTok link updated successfully!");
          setShowForm(false);
          fetchTiktokLinks();
        } else {
          setError(response.data.message || "Failed to update link");
        }
      } else {
        const response = await adminApi.post("/links", payload);
        if (response.data.success) {
          setSuccess("New TikTok link added successfully!");
          setShowForm(false);
          fetchTiktokLinks();
        } else {
          setError(response.data.message || "Failed to create link");
        }
      }
    } catch (err) {
      console.error("Save link error:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to save link",
      );
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      !confirm(
        "Are you sure you want to delete this link? This action cannot be undone.",
      )
    ) {
      return;
    }

    setActionLoading(id);
    setError("");
    setSuccess("");
    try {
      const response = await adminApi.delete(`/links/${id}`);
      if (response.data.success) {
        setSuccess("Link deleted successfully!");
        fetchTiktokLinks();
      } else {
        setError(response.data.message || "Failed to delete link");
      }
    } catch (err) {
      console.error("Delete link error:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to delete link",
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
        setSuccess(
          `Link status changed to ${!link.active ? "Active" : "Inactive"}`,
        );
        fetchTiktokLinks();
      } else {
        setError(response.data.message || "Failed to update link status");
      }
    } catch (err) {
      console.error("Toggle active error:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to update status",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleResetClicks = async (id) => {
    if (
      !confirm(
        "Are you sure you want to reset the click count for this link? This will also reactivate the link if it was deactivated due to the work limit.",
      )
    ) {
      return;
    }

    setActionLoading(id);
    setError("");
    setSuccess("");
    try {
      const response1 = await adminApi.put(`/links/${id}`, {
        totalClicks: 0,
        active: true,
      });
      const response2 = await adminApi.post(`/links/${id}/reset-all`);

      if (response1.data.success && response2.data.success) {
        setSuccess(
          "Link click stats and all user click counts successfully reset!",
        );
        fetchTiktokLinks();
      } else {
        setError("Failed to fully reset clicks.");
      }
    } catch (err) {
      console.error("Reset clicks error:", err);
      setError(
        err.response?.data?.message || err.message || "Failed to reset clicks",
      );
    } finally {
      setActionLoading(null);
    }
  };

  // ─── Summary stats ────────────────────────────────────────────────────────
  const totalLinks = links.length;
  const activeLinks = links.filter((l) => l.active).length;
  const limitReachedLinks = links.filter(
    (l) => l.workLimit > 0 && l.totalClicks >= l.workLimit,
  ).length;
  const totalClicks = links.reduce((acc, l) => acc + (l.totalClicks || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* ── Top Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 pb-5 border-b border-white/10">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push("/admin/dashboard")}
              className="p-2 bg-white/10 rounded-xl border border-white/20 text-gray-300 hover:text-white hover:bg-white/20 transition-all"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-red-500 rounded-lg flex items-center justify-center mr-3">
                  <Music className="w-4 h-4 text-white" />
                </div>
                TikTok Links Management
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                Create, update, and monitor click limits on TikTok links
              </p>
            </div>
          </div>
          <button
            onClick={handleOpenAdd}
            className="mt-4 sm:mt-0 flex items-center justify-center bg-gradient-to-r from-pink-500 to-red-500 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg hover:from-pink-600 hover:to-red-600 transition-all duration-200 transform hover:scale-[1.02]"
          >
            <Plus className="w-5 h-5 mr-1.5" />
            Add New Link
          </button>
        </div>

        {/* ── Summary Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Total Links",
              value: totalLinks,
              icon: LinkIcon,
              color: "from-blue-500 to-indigo-600",
            },
            {
              label: "Active",
              value: activeLinks,
              icon: Activity,
              color: "from-green-500 to-emerald-600",
            },
            {
              label: "Limit Reached",
              value: limitReachedLinks,
              icon: Zap,
              color: "from-amber-500 to-orange-600",
            },
            {
              label: "Total Clicks",
              value: totalClicks,
              icon: TrendingUp,
              color: "from-pink-500 to-red-500",
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center space-x-3"
              >
                <div
                  className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center flex-shrink-0`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Success / Error Alerts ── */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start space-x-2 text-red-400 font-medium">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-start space-x-2 text-green-400 font-medium">
            <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* ── Add / Edit Form ── */}
        {showForm && (
          <div className="mb-8 bg-white/5 border border-white/10 rounded-2xl shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-pink-500/10 to-red-500/10">
              <h2 className="text-lg font-bold text-white flex items-center">
                <Music className="w-5 h-5 mr-2 text-pink-400" />
                {editingLink ? "Edit TikTok Link" : "Add New TikTok Link"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-white transition-colors font-bold text-lg leading-none"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Title / Instruction
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Follow our TikTok account"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>

                {/* URL */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    TikTok URL
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://www.tiktok.com/@username"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>

                {/* Work Limit */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-1  items-center justify-between">
                    <span>Work Limit (Clicks)</span>
                    <span className="text-xs text-gray-500 font-normal">
                      0 = No limit | Max 2000
                    </span>
                  </label>
                  {/* Number input + range slider */}
                  <input
                    type="number"
                    min="0"
                    max="2000"
                    value={workLimit}
                    onChange={(e) => setWorkLimit(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 mb-2"
                  />
                  <input
                    type="range"
                    min="0"
                    max="2000"
                    step="50"
                    value={workLimit}
                    onChange={(e) => setWorkLimit(e.target.value)}
                    className="w-full accent-pink-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0 (No limit)</span>
                    <span className="font-semibold text-pink-400">
                      {workLimit} clicks
                    </span>
                    <span>2000</span>
                  </div>
                </div>

                {/* Earnings */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Earnings per submission (Rs)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={earnings}
                    onChange={(e) => setEarnings(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
                  />
                </div>
              </div>

              {/* Active toggle */}
              <div className="flex items-center space-x-3 pt-2">
                <input
                  type="checkbox"
                  id="tiktok-active"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-5 h-5 rounded-md accent-pink-500"
                />
                <label
                  htmlFor="tiktok-active"
                  className="text-sm font-semibold text-gray-300 select-none"
                >
                  Make link active immediately (visible to users)
                </label>
              </div>

              {/* Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 bg-white/10 text-gray-300 rounded-xl font-semibold hover:bg-white/20 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-xl font-semibold hover:from-pink-600 hover:to-red-600 shadow-lg transition-all flex items-center"
                >
                  {editingLink ? "Update Link" : "Create Link"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── Links Grid ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white/5 border border-white/10 rounded-2xl">
            <Loader2 className="w-10 h-10 text-pink-400 animate-spin" />
            <p className="text-gray-400 mt-3 font-medium">
              Loading TikTok links...
            </p>
          </div>
        ) : links.length === 0 ? (
          <div className="text-center py-20 bg-white/5 border border-white/10 rounded-2xl">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-500/20 to-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Music className="w-10 h-10 text-pink-400" />
            </div>
            <p className="text-white text-lg font-semibold">
              No TikTok links yet
            </p>
            <p className="text-gray-400 mt-1 text-sm">
              Click &quot;Add New Link&quot; to create your first TikTok task
              link
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {links.map((link) => {
              const hasLimit = link.workLimit > 0;
              const limitReached =
                hasLimit && link.totalClicks >= link.workLimit;
              const percent = hasLimit
                ? Math.min(
                    100,
                    Math.round((link.totalClicks / link.workLimit) * 100),
                  )
                : 0;
              const isActioning = actionLoading === link._id;

              return (
                <div
                  key={link._id}
                  className={`relative bg-gradient-to-br from-gray-800 to-gray-900 border rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 ${
                    !link.active
                      ? "border-white/10 opacity-70"
                      : limitReached
                        ? "border-amber-500/40 ring-2 ring-amber-500/20"
                        : "border-white/15 hover:border-pink-500/40 hover:shadow-xl hover:shadow-pink-500/10"
                  }`}
                >
                  {/* Top badges */}
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-pink-500/20 text-pink-300">
                        <Music className="w-3 h-3 mr-1" />
                        TikTok
                      </span>
                      <div className="flex space-x-1.5">
                        {limitReached && (
                          <span className="inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300">
                            Limit Reached
                          </span>
                        )}
                        <span
                          className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full ${
                            link.active && !limitReached
                              ? "bg-green-500/20 text-green-300"
                              : "bg-gray-500/20 text-gray-400"
                          }`}
                        >
                          {link.active && !limitReached ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-white line-clamp-2 min-h-[3rem] mb-3">
                      {link.title}
                    </h3>

                    {/* URL */}
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-pink-400 font-semibold hover:underline flex items-center mb-4 break-all bg-pink-500/10 border border-pink-500/20 p-2 rounded-lg"
                    >
                      <ExternalLink className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                      <span className="truncate">{link.url}</span>
                    </a>

                    {/* Earnings + Limit stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4 pt-3 border-t border-white/10">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Earnings
                        </p>
                        <p className="text-xl font-extrabold text-green-400 mt-0.5">
                          Rs {link.earnings.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Work Limit
                        </p>
                        <p className="text-xl font-bold text-white mt-0.5">
                          {hasLimit ? `${link.workLimit}` : "∞"}
                          <span className="text-xs font-normal text-gray-400 ml-1">
                            {hasLimit ? "clicks" : "No limit"}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    {hasLimit ? (
                      <div className="mb-4 bg-white/5 p-3.5 rounded-xl border border-white/10">
                        <div className="flex justify-between items-center text-xs font-semibold mb-2">
                          <span className="text-gray-400">Click Progress</span>
                          <span
                            className={
                              limitReached ? "text-amber-400" : "text-pink-400"
                            }
                          >
                            {link.totalClicks} / {link.workLimit} ({percent}%)
                          </span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                          <div
                            className={`h-2.5 rounded-full transition-all duration-500 ${
                              limitReached
                                ? "bg-gradient-to-r from-amber-400 to-orange-500"
                                : "bg-gradient-to-r from-pink-500 to-red-500"
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        {limitReached && (
                          <p className="text-xs text-amber-400 mt-2 font-medium">
                            ⚠️ Work limit reached — link auto-deactivated
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="mb-4 bg-white/5 p-3 text-center text-xs font-medium text-gray-500 border border-white/10 rounded-xl">
                        Total clicks tracked: {link.totalClicks || 0} (No
                        auto-removal limit)
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-auto">
                    <button
                      disabled={isActioning}
                      onClick={() => handleToggleActive(link)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                        link.active
                          ? "bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
                          : "bg-green-500/10 border-green-500/30 text-green-300 hover:bg-green-500/20"
                      } disabled:opacity-50`}
                    >
                      {isActioning ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : link.active ? (
                        "Deactivate"
                      ) : (
                        "Activate"
                      )}
                    </button>

                    <div className="flex items-center space-x-2">
                      {/* Reset clicks */}
                      <button
                        title="Reset click counts"
                        disabled={isActioning}
                        onClick={() => handleResetClicks(link._id)}
                        className="p-2 bg-white/10 text-gray-400 rounded-lg hover:bg-blue-500/20 hover:text-blue-300 transition-all border border-white/10 disabled:opacity-50"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>

                      {/* Edit */}
                      <button
                        title="Edit link"
                        disabled={isActioning}
                        onClick={() => handleOpenEdit(link)}
                        className="p-2 bg-white/10 text-gray-400 rounded-lg hover:bg-indigo-500/20 hover:text-indigo-300 transition-all border border-white/10 disabled:opacity-50"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      {/* Delete */}
                      <button
                        title="Delete link"
                        disabled={isActioning}
                        onClick={() => handleDelete(link._id)}
                        className="p-2 bg-white/10 text-red-400 rounded-lg hover:bg-red-500/20 hover:text-red-300 transition-all border border-white/10 disabled:opacity-50"
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
