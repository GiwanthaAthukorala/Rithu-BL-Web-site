"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  Search,
  Mail,
  UserCheck,
  TrendingUp,
  Gift,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useRouter } from "next/router";
import adminApi from "@/lib/adminApi";

// ─── helpers ────────────────────────────────────────────────────────────────
const fmt = (v) => (v || 0).toFixed(2);

const StatusBadge = ({ status }) => {
  const map = {
    accepted: {
      bg: "#d1fae5",
      color: "#065f46",
      icon: <CheckCircle size={11} />,
      label: "Accepted",
    },
    pending: {
      bg: "#fef3c7",
      color: "#92400e",
      icon: <Clock size={11} />,
      label: "Pending",
    },
    rejected: {
      bg: "#fee2e2",
      color: "#991b1b",
      icon: <XCircle size={11} />,
      label: "Rejected",
    },
  };
  const s = map[status] || map.pending;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "3px 10px",
        borderRadius: 20,
        background: s.bg,
        color: s.color,
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {s.icon} {s.label}
    </span>
  );
};

// ─── Email Lookup Panel ───────────────────────────────────────────────────────
function UserLookupPanel() {
  const [email, setEmail] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState(null);
  const [lookupError, setLookupError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsSearching(true);
    setLookupError(null);
    setResult(null);
    setExpandedId(null);
    try {
      const res = await adminApi.get(
        `/referrals/admin/user-lookup?email=${encodeURIComponent(email.trim())}`,
      );
      if (res.data?.success) {
        setResult(res.data.data);
      } else {
        setLookupError(res.data?.message || "Lookup failed.");
      }
    } catch (err) {
      setLookupError(
        err.response?.data?.message ||
          "No user found with that email, or server error.",
      );
    } finally {
      setIsSearching(false);
    }
  };

  const S = {
    panel: {
      background: "#fff",
      borderRadius: 20,
      border: "1.5px solid #e2e8f0",
      overflow: "hidden",
      marginBottom: 28,
      boxShadow: "0 4px 20px rgba(79,70,229,0.08)",
    },
    panelHeader: {
      background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
      padding: "20px 28px",
      display: "flex",
      alignItems: "center",
      gap: 14,
    },
    panelHeaderIcon: {
      width: 44,
      height: 44,
      background: "rgba(255,255,255,0.15)",
      borderRadius: 12,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    panelTitle: {
      fontSize: 17,
      fontWeight: 800,
      color: "#fff",
      margin: 0,
    },
    panelSub: {
      fontSize: 13,
      color: "rgba(255,255,255,0.75)",
      margin: "3px 0 0",
    },
    panelBody: { padding: "24px 28px" },
    searchRow: {
      display: "flex",
      gap: 10,
      marginBottom: 20,
    },
    searchInputWrap: {
      flex: 1,
      display: "flex",
      alignItems: "center",
      gap: 10,
      background: "#f8fafc",
      border: "1.5px solid #e2e8f0",
      borderRadius: 12,
      padding: "10px 16px",
      transition: "border-color 0.2s",
    },
    searchInput: {
      border: "none",
      outline: "none",
      fontSize: 14,
      color: "#1e293b",
      background: "transparent",
      width: "100%",
      fontFamily: "'Inter', sans-serif",
    },
    searchBtn: {
      padding: "10px 24px",
      background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
      color: "#fff",
      border: "none",
      borderRadius: 12,
      fontSize: 14,
      fontWeight: 700,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: 8,
      whiteSpace: "nowrap",
      boxShadow: "0 4px 14px rgba(79,70,229,0.3)",
      transition: "opacity 0.2s",
    },
    errorBox: {
      background: "#fef2f2",
      border: "1px solid #fecaca",
      color: "#dc2626",
      borderRadius: 10,
      padding: "12px 16px",
      fontSize: 13,
      display: "flex",
      alignItems: "center",
      gap: 8,
    },
    // User info card
    userCard: {
      background: "linear-gradient(135deg, #f8fafc, #f1f5ff)",
      border: "1.5px solid #e0e7ff",
      borderRadius: 14,
      padding: "16px 20px",
      display: "flex",
      alignItems: "center",
      gap: 16,
      marginBottom: 20,
    },
    avatar: {
      width: 52,
      height: 52,
      borderRadius: "50%",
      objectFit: "cover",
      border: "2px solid #e0e7ff",
      flexShrink: 0,
    },
    userInfo: { flex: 1 },
    userName: {
      fontSize: 16,
      fontWeight: 700,
      color: "#1e293b",
      margin: "0 0 3px",
    },
    userEmail: { fontSize: 13, color: "#64748b", margin: "0 0 4px" },
    userMeta: { fontSize: 11, color: "#94a3b8" },
    // Stats row
    statsRow: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
      gap: 12,
      marginBottom: 20,
    },
    statCard: (accent) => ({
      background: "#fff",
      border: `1.5px solid ${accent}30`,
      borderRadius: 12,
      padding: "14px 16px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    }),
    statLabel: {
      fontSize: 11,
      color: "#64748b",
      fontWeight: 600,
      marginBottom: 5,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    },
    statValue: (color) => ({
      fontSize: 22,
      fontWeight: 800,
      color,
      lineHeight: 1,
    }),
    statSub: { fontSize: 11, color: "#94a3b8", marginTop: 3 },
    // Earnings highlight
    earningsHighlight: {
      background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
      borderRadius: 14,
      padding: "18px 22px",
      display: "flex",
      alignItems: "center",
      gap: 16,
      marginBottom: 20,
      boxShadow: "0 4px 16px rgba(16,185,129,0.25)",
    },
    earningsIconBox: {
      width: 48,
      height: 48,
      background: "rgba(255,255,255,0.2)",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    earningsTitle: {
      fontSize: 12,
      color: "rgba(255,255,255,0.8)",
      fontWeight: 600,
      margin: "0 0 3px",
    },
    earningsAmount: {
      fontSize: 26,
      fontWeight: 800,
      color: "#fff",
      margin: 0,
      letterSpacing: "-0.5px",
    },
    earningsSub: { fontSize: 11, color: "rgba(255,255,255,0.7)", margin: "4px 0 0" },
    // Referral list table
    tableWrap: {
      background: "#fff",
      borderRadius: 14,
      border: "1px solid #e2e8f0",
      overflow: "hidden",
    },
    tableHead: {
      display: "grid",
      gridTemplateColumns: "2.5fr 1fr 1.2fr 1fr 36px",
      padding: "10px 16px",
      background: "#f8fafc",
      borderBottom: "1px solid #e2e8f0",
      fontSize: 11,
      fontWeight: 700,
      color: "#94a3b8",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    },
    tableRow: (odd) => ({
      display: "grid",
      gridTemplateColumns: "2.5fr 1fr 1.2fr 1fr 36px",
      padding: "12px 16px",
      borderBottom: "1px solid #f1f5f9",
      alignItems: "center",
      fontSize: 13,
      background: odd ? "#fafbfe" : "#fff",
    }),
    refereeName: { fontWeight: 600, color: "#1e293b", fontSize: 14 },
    refereeEmail: { color: "#94a3b8", fontSize: 11, marginTop: 2 },
    commissionGreen: { fontWeight: 700, color: "#059669", fontSize: 14 },
    expandBtn: {
      background: "none",
      border: "none",
      cursor: "pointer",
      color: "#94a3b8",
      padding: 4,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    historyBox: {
      gridColumn: "1 / -1",
      background: "#f8fafc",
      borderRadius: 8,
      padding: "10px 14px",
      marginTop: 2,
    },
    historyRow: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: 12,
      color: "#475569",
      padding: "4px 0",
      borderBottom: "1px solid #e2e8f0",
    },
    emptyReferrals: {
      textAlign: "center",
      padding: "32px 20px",
      color: "#94a3b8",
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: 700,
      color: "#1e293b",
      marginBottom: 12,
      display: "flex",
      alignItems: "center",
      gap: 6,
    },
  };

  const getAvatarUrl = (user) => {
    if (user?.profilePicture?.url) return user.profilePicture.url;
    const initials = `${user?.firstName?.charAt(0) || ""}${user?.lastName?.charAt(0) || ""}`;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=4f46e5&color=ffffff&size=80`;
  };

  return (
    <div style={S.panel}>
      {/* Panel Header */}
      <div style={S.panelHeader}>
        <div style={S.panelHeaderIcon}>
          <Mail size={22} color="#fff" />
        </div>
        <div>
          <p style={S.panelTitle}>User Referral Center Lookup</p>
          <p style={S.panelSub}>
            Enter any registered user's email to view their full Referral Center and total referral earnings.
          </p>
        </div>
      </div>

      <div style={S.panelBody}>
        {/* Search Form */}
        <form onSubmit={handleSearch} style={S.searchRow}>
          <div style={S.searchInputWrap}>
            <Search size={16} color="#94a3b8" />
            <input
              style={S.searchInput}
              type="email"
              placeholder="Enter user's email address (e.g. user@example.com)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSearching}
            />
          </div>
          <button
            type="submit"
            style={{ ...S.searchBtn, opacity: isSearching ? 0.7 : 1 }}
            disabled={isSearching || !email.trim()}
          >
            {isSearching ? (
              <Loader2 size={16} style={{ animation: "spin 0.8s linear infinite" }} />
            ) : (
              <Search size={16} />
            )}
            {isSearching ? "Searching…" : "Lookup"}
          </button>
        </form>

        {/* Error */}
        {lookupError && (
          <div style={S.errorBox}>
            <AlertCircle size={15} />
            {lookupError}
          </div>
        )}

        {/* Results */}
        {result && (
          <div>
            {/* User Info Card */}
            <div style={S.userCard}>
              <img
                src={getAvatarUrl(result.user)}
                alt="avatar"
                style={S.avatar}
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    result.user?.firstName || "?",
                  )}&background=4f46e5&color=ffffff&size=80`;
                }}
              />
              <div style={S.userInfo}>
                <p style={S.userName}>
                  {result.user.firstName} {result.user.lastName}
                  {(result.user.role === "admin" || result.user.role === "superadmin") && (
                    <span
                      style={{
                        marginLeft: 8,
                        fontSize: 10,
                        background: "#ede9fe",
                        color: "#7c3aed",
                        padding: "2px 7px",
                        borderRadius: 4,
                        fontWeight: 700,
                        verticalAlign: "middle",
                      }}
                    >
                      ADMIN
                    </span>
                  )}
                </p>
                <p style={S.userEmail}>{result.user.email}</p>
                <p style={S.userMeta}>
                  Member since {new Date(result.user.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit", month: "short", year: "numeric",
                  })}
                  {" · "}
                  {result.user.isActive ? (
                    <span style={{ color: "#059669", fontWeight: 600 }}>Active</span>
                  ) : (
                    <span style={{ color: "#dc2626", fontWeight: 600 }}>Inactive</span>
                  )}
                </p>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 3 }}>
                  Remaining slots
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#4f46e5" }}>
                  {result.stats.remainingSlots} / 20
                </div>
              </div>
            </div>

            {/* Total Referral Earnings Highlight */}
            {result.stats.referralEarningsBalance > 0 && (
              <div style={S.earningsHighlight}>
                <div style={S.earningsIconBox}>
                  <Gift size={22} color="#fff" />
                </div>
                <div>
                  <p style={S.earningsTitle}>Total Referral Earnings (Balance)</p>
                  <p style={S.earningsAmount}>
                    Rs {fmt(result.stats.referralEarningsBalance)}
                  </p>
                  <p style={S.earningsSub}>
                    5% commission from their referrals' withdrawals
                  </p>
                </div>
              </div>
            )}

            {/* Stats Cards */}
            <div style={S.statsRow}>
              {[
                {
                  label: "Total Referrals",
                  value: result.stats.total,
                  sub: "all statuses",
                  color: "#4f46e5",
                  accent: "#4f46e5",
                },
                {
                  label: "Accepted",
                  value: result.stats.accepted,
                  sub: "active referrals",
                  color: "#059669",
                  accent: "#059669",
                },
                {
                  label: "Pending",
                  value: result.stats.pending,
                  sub: "awaiting response",
                  color: "#d97706",
                  accent: "#d97706",
                },
                {
                  label: "Rejected",
                  value: result.stats.rejected,
                  sub: "declined",
                  color: "#dc2626",
                  accent: "#dc2626",
                },
                {
                  label: "Commission Earned",
                  value: `Rs ${fmt(result.stats.totalCommissionFromReferrals)}`,
                  sub: "from referral activity",
                  color: "#059669",
                  accent: "#059669",
                },
                {
                  label: "Total Earnings",
                  value: `Rs ${fmt(result.stats.totalEarned)}`,
                  sub: "lifetime total",
                  color: "#1e293b",
                  accent: "#64748b",
                },
              ].map(({ label, value, sub, color, accent }) => (
                <div key={label} style={S.statCard(accent)}>
                  <div style={S.statLabel}>{label}</div>
                  <div style={S.statValue(color)}>{value}</div>
                  <div style={S.statSub}>{sub}</div>
                </div>
              ))}
            </div>

            {/* Referral List Table */}
            <div style={S.sectionTitle}>
              <Users size={16} color="#4f46e5" />
              Referral List ({result.referrals.length})
            </div>
            <div style={S.tableWrap}>
              {result.referrals.length === 0 ? (
                <div style={S.emptyReferrals}>
                  <Users size={36} style={{ marginBottom: 10, opacity: 0.3 }} />
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>
                    No referrals yet
                  </div>
                  <div style={{ fontSize: 12, marginTop: 4 }}>
                    This user hasn't added anyone to their referral network.
                  </div>
                </div>
              ) : (
                <>
                  <div style={S.tableHead}>
                    <span>Referred Person</span>
                    <span>Status</span>
                    <span>Commission Earned</span>
                    <span>Date Added</span>
                    <span></span>
                  </div>
                  {result.referrals.map((r, idx) => (
                    <React.Fragment key={r._id}>
                      <div style={S.tableRow(idx % 2 === 1)}>
                        {/* Referee */}
                        <div>
                          <div style={S.refereeName}>
                            {r.referee?.firstName} {r.referee?.lastName}
                            {(r.referee?.role === "admin" ||
                              r.referee?.role === "superadmin") && (
                              <span
                                style={{
                                  marginLeft: 6,
                                  fontSize: 9,
                                  background: "#ede9fe",
                                  color: "#7c3aed",
                                  padding: "1px 5px",
                                  borderRadius: 3,
                                  fontWeight: 700,
                                }}
                              >
                                ADMIN
                              </span>
                            )}
                          </div>
                          <div style={S.refereeEmail}>{r.referee?.email}</div>
                        </div>

                        {/* Status */}
                        <div>
                          <StatusBadge status={r.status} />
                        </div>

                        {/* Commission */}
                        <div style={S.commissionGreen}>
                          Rs {fmt(r.totalCommissionEarned)}
                          {r.commissionHistory?.length > 0 && (
                            <span
                              style={{
                                marginLeft: 6,
                                fontSize: 10,
                                background: "#d1fae5",
                                color: "#065f46",
                                padding: "1px 5px",
                                borderRadius: 3,
                                fontWeight: 600,
                              }}
                            >
                              {r.commissionHistory.length} txn
                            </span>
                          )}
                        </div>

                        {/* Date */}
                        <div style={{ color: "#94a3b8", fontSize: 12 }}>
                          {new Date(r.createdAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>

                        {/* Expand (only for accepted with commission history) */}
                        <div>
                          {r.status === "accepted" &&
                            r.commissionHistory?.length > 0 && (
                              <button
                                style={S.expandBtn}
                                onClick={() =>
                                  setExpandedId(
                                    expandedId === r._id ? null : r._id,
                                  )
                                }
                                title="View commission history"
                              >
                                {expandedId === r._id ? (
                                  <ChevronUp size={16} />
                                ) : (
                                  <ChevronDown size={16} />
                                )}
                              </button>
                            )}
                        </div>
                      </div>

                      {/* Expanded commission history */}
                      {expandedId === r._id &&
                        r.commissionHistory?.length > 0 && (
                          <div
                            style={{
                              ...S.tableRow(idx % 2 === 1),
                              display: "block",
                              padding: "0 16px 14px",
                            }}
                          >
                            <div style={S.historyBox}>
                              <div
                                style={{
                                  fontSize: 11,
                                  fontWeight: 700,
                                  color: "#64748b",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.05em",
                                  marginBottom: 8,
                                }}
                              >
                                Commission History
                              </div>
                              {r.commissionHistory.map((h, i) => (
                                <div key={i} style={S.historyRow}>
                                  <span>
                                    Withdrawal: Rs {fmt(h.withdrawalAmount)} ·{" "}
                                    {new Date(h.date).toLocaleDateString(
                                      "en-GB",
                                      {
                                        day: "2-digit",
                                        month: "short",
                                        year: "numeric",
                                      },
                                    )}
                                  </span>
                                  <span
                                    style={{ color: "#059669", fontWeight: 700 }}
                                  >
                                    +Rs {fmt(h.commissionAmount)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                    </React.Fragment>
                  ))}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Admin Referrals Page ─────────────────────────────────────────────────
export default function AdminReferrals() {
  const router = useRouter();
  const [referrals, setReferrals] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchReferrals = useCallback(
    async (page = 1) => {
      setIsFetching(true);
      setError(null);
      try {
        const params = new URLSearchParams({ page, limit: 20 });
        if (statusFilter) params.set("status", statusFilter);

        const res = await adminApi.get(
          `/referrals/admin/all?${params.toString()}`,
        );
        const data = res.data;

        if (!data.success)
          throw new Error(data.message || "Failed to load referrals");

        setReferrals(data.data.referrals || []);
        setPagination(data.data.pagination || { page, pages: 1, total: 0 });
        setSummary(data.data.summary || null);
        setCurrentPage(page);
      } catch (err) {
        console.error("Referrals fetch error:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load referrals. Check your connection and admin permissions.",
        );
      } finally {
        setIsFetching(false);
      }
    },
    [statusFilter],
  );

  useEffect(() => {
    fetchReferrals(1);
  }, [fetchReferrals]);

  // Client-side search filter
  const filtered = searchQuery
    ? referrals.filter((r) => {
        const q = searchQuery.toLowerCase();
        return (
          r.referrer?.firstName?.toLowerCase().includes(q) ||
          r.referrer?.lastName?.toLowerCase().includes(q) ||
          r.referrer?.email?.toLowerCase().includes(q) ||
          r.referee?.firstName?.toLowerCase().includes(q) ||
          r.referee?.lastName?.toLowerCase().includes(q) ||
          r.referee?.email?.toLowerCase().includes(q)
        );
      })
    : referrals;

  // ─── Styles ───────────────────────────────────────────────────────────────
  const S = {
    page: {
      minHeight: "100vh",
      background: "#f8fafc",
      fontFamily: "'Inter', sans-serif",
    },
    header: {
      background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
      padding: "28px 32px",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 16,
      flexWrap: "wrap",
    },
    headerLeft: {},
    headerTitle: {
      fontSize: 24,
      fontWeight: 800,
      margin: 0,
      letterSpacing: "-0.3px",
    },
    headerSub: { fontSize: 14, opacity: 0.8, marginTop: 4, margin: "4px 0 0" },
    backBtn: {
      background: "rgba(255,255,255,0.15)",
      border: "1px solid rgba(255,255,255,0.3)",
      color: "#fff",
      borderRadius: 10,
      padding: "8px 16px",
      cursor: "pointer",
      fontSize: 14,
      fontWeight: 600,
      display: "flex",
      alignItems: "center",
      gap: 6,
    },
    main: { maxWidth: 1200, margin: "0 auto", padding: "28px 24px" },
    summaryGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: 14,
      marginBottom: 24,
    },
    summaryCard: (accent) => ({
      background: "#fff",
      border: `1.5px solid ${accent}30`,
      borderRadius: 14,
      padding: "18px 20px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    }),
    summaryLabel: {
      fontSize: 12,
      color: "#64748b",
      fontWeight: 500,
      marginBottom: 6,
    },
    summaryValue: (color) => ({
      fontSize: 26,
      fontWeight: 800,
      color,
      lineHeight: 1,
    }),
    dividerLabel: {
      fontSize: 13,
      fontWeight: 700,
      color: "#374151",
      marginBottom: 14,
      display: "flex",
      alignItems: "center",
      gap: 8,
    },
    toolbar: {
      display: "flex",
      gap: 12,
      marginBottom: 20,
      flexWrap: "wrap",
      alignItems: "center",
    },
    searchBox: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      background: "#fff",
      border: "1.5px solid #e2e8f0",
      borderRadius: 10,
      padding: "8px 14px",
      flex: 1,
      minWidth: 200,
    },
    searchInput: {
      border: "none",
      outline: "none",
      fontSize: 14,
      color: "#1e293b",
      background: "transparent",
      width: "100%",
    },
    filterSelect: {
      padding: "9px 14px",
      borderRadius: 10,
      border: "1.5px solid #e2e8f0",
      fontSize: 14,
      color: "#374151",
      background: "#fff",
      cursor: "pointer",
    },
    refreshBtn: {
      padding: "9px 14px",
      borderRadius: 10,
      border: "1.5px solid #e2e8f0",
      background: "#fff",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: 6,
      fontSize: 14,
      color: "#4f46e5",
      fontWeight: 600,
    },
    tableWrapper: {
      background: "#fff",
      borderRadius: 16,
      border: "1px solid #e2e8f0",
      overflow: "hidden",
      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    },
    tableHeader: {
      display: "grid",
      gridTemplateColumns: "2fr 2fr 1fr 1.2fr 1fr",
      padding: "12px 20px",
      background: "#f8fafc",
      borderBottom: "1px solid #e2e8f0",
      fontSize: 11,
      fontWeight: 700,
      color: "#94a3b8",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    },
    tableRow: (isOdd) => ({
      display: "grid",
      gridTemplateColumns: "2fr 2fr 1fr 1.2fr 1fr",
      padding: "14px 20px",
      borderBottom: "1px solid #f1f5f9",
      alignItems: "center",
      fontSize: 13,
      color: "#374151",
      background: isOdd ? "#fafbfe" : "#fff",
    }),
    nameCell: { display: "flex", flexDirection: "column", gap: 2 },
    name: { fontWeight: 600, color: "#1e293b", fontSize: 14 },
    email: { color: "#94a3b8", fontSize: 12 },
    adminBadge: {
      marginLeft: 6,
      fontSize: 10,
      background: "#ede9fe",
      color: "#7c3aed",
      padding: "2px 6px",
      borderRadius: 4,
      fontWeight: 700,
    },
    pagination: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      padding: "16px",
      borderTop: "1px solid #f1f5f9",
    },
    pageBtn: (active, disabled) => ({
      width: 36,
      height: 36,
      borderRadius: 8,
      border: active ? "none" : "1px solid #e2e8f0",
      background: active ? "#4f46e5" : disabled ? "#f8fafc" : "#fff",
      color: active ? "#fff" : disabled ? "#cbd5e1" : "#374151",
      cursor: disabled ? "default" : "pointer",
      fontWeight: 600,
      fontSize: 14,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }),
    emptyState: {
      textAlign: "center",
      padding: "64px 24px",
      color: "#94a3b8",
    },
    errorBox: {
      background: "#fef2f2",
      color: "#dc2626",
      border: "1px solid #fecaca",
      borderRadius: 12,
      padding: "14px 18px",
      marginBottom: 20,
      fontSize: 14,
      display: "flex",
      alignItems: "flex-start",
      gap: 10,
    },
  };

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <div style={S.headerLeft}>
          <h1 style={S.headerTitle}>🤝 Referral Management</h1>
          <p style={S.headerSub}>
            View all referral relationships on the platform
          </p>
        </div>
        <button style={S.backBtn} onClick={() => router.back()}>
          <ChevronLeft size={16} /> Back
        </button>
      </div>

      <div style={S.main}>
        {/* ── USER REFERRAL CENTER LOOKUP ── */}
        <UserLookupPanel />

        {/* ── ALL REFERRALS SECTION ── */}
        <div style={S.dividerLabel}>
          <TrendingUp size={16} color="#4f46e5" />
          All Platform Referrals
        </div>

        {/* Error */}
        {error && (
          <div style={S.errorBox}>
            <XCircle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <strong>Error loading referrals:</strong> {error}
            </div>
          </div>
        )}

        {/* Summary Cards */}
        {summary && (
          <div style={S.summaryGrid}>
            {[
              {
                label: "Accepted Referrals",
                value: summary.totalAccepted,
                color: "#059669",
                accent: "#059669",
              },
              {
                label: "Pending Invitations",
                value: summary.totalPending,
                color: "#d97706",
                accent: "#d97706",
              },
              {
                label: "Rejected",
                value: summary.totalRejected,
                color: "#dc2626",
                accent: "#dc2626",
              },
              {
                label: "Total Commission Paid",
                value: `Rs ${fmt(summary.totalCommissionPaid)}`,
                color: "#4f46e5",
                accent: "#4f46e5",
              },
            ].map(({ label, value, color, accent }) => (
              <div key={label} style={S.summaryCard(accent)}>
                <div style={S.summaryLabel}>{label}</div>
                <div style={S.summaryValue(color)}>{value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Toolbar */}
        <div style={S.toolbar}>
          <div style={S.searchBox}>
            <Search size={15} color="#94a3b8" />
            <input
              style={S.searchInput}
              placeholder="Search by name or email…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            style={S.filterSelect}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
            }}
          >
            <option value="">All Statuses</option>
            <option value="accepted">Accepted</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
          <button
            style={S.refreshBtn}
            onClick={() => fetchReferrals(currentPage)}
            disabled={isFetching}
          >
            <RefreshCcw
              size={14}
              style={{
                animation: isFetching ? "spin 0.8s linear infinite" : "none",
              }}
            />
            {isFetching ? "Loading…" : "Refresh"}
          </button>
        </div>

        {/* Table */}
        <div style={S.tableWrapper}>
          <div style={S.tableHeader}>
            <span>Referrer</span>
            <span>Referee (Added Person)</span>
            <span>Status</span>
            <span>Commission Paid</span>
            <span>Date Added</span>
          </div>

          {isFetching ? (
            <div style={S.emptyState}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  border: "3px solid #e2e8f0",
                  borderTopColor: "#4f46e5",
                  animation: "spin 0.8s linear infinite",
                  margin: "0 auto 16px",
                }}
              />
              <div style={{ color: "#64748b", fontSize: 14 }}>
                Loading referrals…
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={S.emptyState}>
              <Users size={48} style={{ marginBottom: 14, opacity: 0.3 }} />
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#374151",
                  marginBottom: 6,
                }}
              >
                No referrals found
              </div>
              <div style={{ fontSize: 13 }}>
                {statusFilter
                  ? `No ${statusFilter} referrals.`
                  : "No referral data yet."}
              </div>
            </div>
          ) : (
            filtered.map((r, idx) => (
              <div key={r._id} style={S.tableRow(idx % 2 === 1)}>
                {/* Referrer */}
                <div style={S.nameCell}>
                  <span style={S.name}>
                    {r.referrer?.firstName} {r.referrer?.lastName}
                    {(r.referrer?.role === "admin" ||
                      r.referrer?.role === "superadmin") && (
                      <span style={S.adminBadge}>ADMIN</span>
                    )}
                  </span>
                  <span style={S.email}>{r.referrer?.email}</span>
                </div>

                {/* Referee */}
                <div style={S.nameCell}>
                  <span style={S.name}>
                    {r.referee?.firstName} {r.referee?.lastName}
                    {(r.referee?.role === "admin" ||
                      r.referee?.role === "superadmin") && (
                      <span style={S.adminBadge}>ADMIN</span>
                    )}
                  </span>
                  <span style={S.email}>{r.referee?.email}</span>
                </div>

                {/* Status */}
                <div>
                  <StatusBadge status={r.status} />
                </div>

                {/* Commission */}
                <div
                  style={{ fontWeight: 700, color: "#059669", fontSize: 14 }}
                >
                  Rs {fmt(r.totalCommissionEarned)}
                </div>

                {/* Date */}
                <div style={{ color: "#94a3b8", fontSize: 12 }}>
                  {new Date(r.createdAt).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </div>
            ))
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div style={S.pagination}>
              <button
                style={S.pageBtn(false, currentPage <= 1)}
                disabled={currentPage <= 1 || isFetching}
                onClick={() => fetchReferrals(currentPage - 1)}
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from(
                { length: Math.min(pagination.pages, 7) },
                (_, i) => i + 1,
              ).map((p) => (
                <button
                  key={p}
                  style={S.pageBtn(p === currentPage, false)}
                  onClick={() => fetchReferrals(p)}
                >
                  {p}
                </button>
              ))}

              <button
                style={S.pageBtn(false, currentPage >= pagination.pages)}
                disabled={currentPage >= pagination.pages || isFetching}
                onClick={() => fetchReferrals(currentPage + 1)}
              >
                <ChevronRight size={16} />
              </button>

              <span style={{ fontSize: 12, color: "#94a3b8", marginLeft: 4 }}>
                {filtered.length} of {pagination.total} total
              </span>
            </div>
          )}
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
