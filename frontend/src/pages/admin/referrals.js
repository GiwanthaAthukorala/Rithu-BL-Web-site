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
  Gift,
  TrendingUp,
  Mail,
  UserSearch,
  AlertCircle,
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

<<<<<<< HEAD
  // Withdrawal bonus events state
  const [bonusEvents, setBonusEvents] = useState([]);
  const [bonusSummary, setBonusSummary] = useState({ count: 0, totalBonusPaid: 0 });
  const [isFetchingBonus, setIsFetchingBonus] = useState(false);

  // ─── Email Lookup State ────────────────────────────────────────────────────
  const [lookupEmail, setLookupEmail] = useState("");
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupResult, setLookupResult] = useState(null); // { referrer, referrals, stats }
  const [lookupError, setLookupError] = useState(null);

  const fetchReferrals = useCallback(async (page = 1) => {
    setIsFetching(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (statusFilter) params.set("status", statusFilter);

      const res = await adminApi.get(`/referrals/admin/all?${params.toString()}`);
      const data = res.data;
=======
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
>>>>>>> aca866e9 (Youtube link update)

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

  const fetchBonusEvents = useCallback(async () => {
    setIsFetchingBonus(true);
    try {
      const res = await adminApi.get("/referrals/admin/withdrawal-bonus-events?limit=50");
      if (res.data.success) {
        setBonusEvents(res.data.data.events || []);
        setBonusSummary({
          count: res.data.data.count || 0,
          totalBonusPaid: res.data.data.totalBonusPaid || 0,
        });
      }
    } catch (err) {
      console.error("Bonus events fetch error:", err);
    } finally {
      setIsFetchingBonus(false);
    }
  }, []);

  useEffect(() => {
    fetchReferrals(1);
  }, [fetchReferrals]);

  useEffect(() => {
    fetchBonusEvents();
  }, [fetchBonusEvents]);

  // ─── Email Lookup Handler ──────────────────────────────────────────────────
  const handleEmailLookup = async (e) => {
    e.preventDefault();
    if (!lookupEmail.trim()) return;

    setIsLookingUp(true);
    setLookupError(null);
    setLookupResult(null);

    try {
      const res = await adminApi.get(
        `/referrals/admin/by-email?email=${encodeURIComponent(lookupEmail.trim().toLowerCase())}`
      );
      if (res.data.success) {
        setLookupResult(res.data.data);
      }
    } catch (err) {
      setLookupError(
        err.response?.data?.message || "Failed to find user. Please check the email and try again."
      );
    } finally {
      setIsLookingUp(false);
    }
  };

  const clearLookup = () => {
    setLookupResult(null);
    setLookupError(null);
    setLookupEmail("");
  };

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
<<<<<<< HEAD
    summaryLabel: { fontSize: 12, color: "#64748b", fontWeight: 500, marginBottom: 6 },
    summaryValue: (color) => ({ fontSize: 26, fontWeight: 800, color, lineHeight: 1 }),
    // ─── Email Lookup Panel ───────────────────────────────────────────────────
    lookupPanel: {
      background: "#fff",
      border: "1.5px solid #c7d2fe",
      borderRadius: 16,
      marginBottom: 24,
      overflow: "hidden",
      boxShadow: "0 2px 8px rgba(79,70,229,0.08)",
    },
    lookupHeader: {
      background: "linear-gradient(135deg, #eef2ff, #e0e7ff)",
      padding: "16px 20px",
      borderBottom: "1px solid #c7d2fe",
      display: "flex",
      alignItems: "center",
      gap: 10,
    },
    lookupTitle: {
      fontSize: 15,
      fontWeight: 700,
      color: "#3730a3",
      display: "flex",
      alignItems: "center",
      gap: 8,
    },
    lookupDesc: {
      fontSize: 13,
      color: "#6366f1",
      marginLeft: "auto",
      opacity: 0.8,
    },
    lookupBody: { padding: "20px 24px" },
    lookupForm: {
      display: "flex",
      gap: 10,
      alignItems: "stretch",
    },
    lookupInputWrap: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      background: "#f8fafc",
      border: "1.5px solid #e2e8f0",
      borderRadius: 10,
      padding: "0 14px",
      flex: 1,
    },
    lookupInput: {
      border: "none",
      outline: "none",
      fontSize: 14,
      color: "#1e293b",
      background: "transparent",
      width: "100%",
      padding: "11px 0",
    },
    lookupBtn: {
      padding: "11px 22px",
      background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
      color: "#fff",
      border: "none",
      borderRadius: 10,
      fontSize: 14,
      fontWeight: 700,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: 8,
      boxShadow: "0 4px 12px rgba(79,70,229,0.3)",
      whiteSpace: "nowrap",
    },
    lookupClearBtn: {
      padding: "11px 16px",
      background: "#f1f5f9",
      color: "#64748b",
      border: "1.5px solid #e2e8f0",
      borderRadius: 10,
      fontSize: 13,
      fontWeight: 600,
      cursor: "pointer",
      whiteSpace: "nowrap",
    },
    lookupError: {
      marginTop: 14,
      padding: "12px 16px",
      background: "#fef2f2",
      border: "1px solid #fecaca",
      borderRadius: 10,
      color: "#dc2626",
      fontSize: 13,
      display: "flex",
      alignItems: "center",
      gap: 8,
    },
    lookupResult: {
      marginTop: 20,
    },
    lookupReferrerCard: {
      display: "flex",
      alignItems: "center",
      gap: 16,
      padding: "16px 18px",
      background: "linear-gradient(135deg, #f0f4ff, #eef2ff)",
      borderRadius: 12,
      border: "1px solid #c7d2fe",
      marginBottom: 16,
      flexWrap: "wrap",
      gap: 12,
    },
    lookupStatsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
      gap: 10,
      marginBottom: 16,
    },
    lookupStatCard: (accent) => ({
      background: accent + "15",
      border: `1px solid ${accent}30`,
      borderRadius: 10,
      padding: "12px 14px",
    }),
    lookupReferralTable: {
      background: "#f8fafc",
      borderRadius: 12,
      overflow: "hidden",
      border: "1px solid #e2e8f0",
    },
    lookupTableHeader: {
      display: "grid",
      gridTemplateColumns: "2fr 2fr 1fr 1.2fr 1fr",
      padding: "10px 16px",
      background: "#f1f5f9",
      borderBottom: "1px solid #e2e8f0",
      fontSize: 11,
      fontWeight: 700,
      color: "#94a3b8",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    },
    lookupTableRow: (isOdd) => ({
      display: "grid",
      gridTemplateColumns: "2fr 2fr 1fr 1.2fr 1fr",
      padding: "12px 16px",
      borderBottom: "1px solid #f1f5f9",
      alignItems: "center",
      fontSize: 13,
      color: "#374151",
      background: isOdd ? "#fafbff" : "#fff",
    }),
    // ─── Bonus Events Panel ───────────────────────────────────────────────
    bonusPanel: {
      background: "#fff",
      border: "1.5px solid #86efac",
      borderRadius: 16,
      marginBottom: 24,
      overflow: "hidden",
      boxShadow: "0 2px 8px rgba(16,185,129,0.08)",
    },
    bonusPanelHeader: {
      background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
      padding: "16px 20px",
      borderBottom: "1px solid #bbf7d0",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      flexWrap: "wrap",
    },
    bonusPanelTitle: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      fontSize: 15,
      fontWeight: 700,
      color: "#15803d",
    },
    bonusBadge: {
      background: "#16a34a",
      color: "#fff",
      fontSize: 11,
      fontWeight: 700,
      borderRadius: 20,
      padding: "2px 10px",
    },
    bonusPanelMeta: {
      fontSize: 13,
      color: "#166534",
      display: "flex",
      alignItems: "center",
      gap: 16,
    },
    bonusEventRow: (isOdd) => ({
      display: "grid",
      gridTemplateColumns: "2fr 1.2fr 1.2fr 1.2fr",
      padding: "12px 20px",
      borderBottom: "1px solid #f1f5f9",
      alignItems: "center",
      fontSize: 13,
      color: "#374151",
      background: isOdd ? "#fafffe" : "#fff",
    }),
    bonusEventHeader: {
      display: "grid",
      gridTemplateColumns: "2fr 1.2fr 1.2fr 1.2fr",
      padding: "10px 20px",
      background: "#f8fafc",
      borderBottom: "1px solid #e2e8f0",
      fontSize: 11,
      fontWeight: 700,
      color: "#94a3b8",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    },
    bonusEmptyState: {
      textAlign: "center",
      padding: "32px 24px",
      color: "#94a3b8",
      fontSize: 14,
    },
    // ─── Main table ───────────────────────────────────────────────────────
=======
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
>>>>>>> aca866e9 (Youtube link update)
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
<<<<<<< HEAD
              { label: "Accepted Referrals", value: summary.totalAccepted, color: "#059669", accent: "#059669" },
              { label: "Pending Invitations", value: summary.totalPending, color: "#d97706", accent: "#d97706" },
              { label: "Rejected", value: summary.totalRejected, color: "#dc2626", accent: "#dc2626" },
              { label: "Total Commission Paid", value: `Rs ${fmt(summary.totalCommissionPaid)}`, color: "#4f46e5", accent: "#4f46e5" },
              { label: "Referral Bonus Payouts", value: `Rs ${fmt(bonusSummary.totalBonusPaid)}`, color: "#059669", accent: "#059669" },
=======
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
>>>>>>> aca866e9 (Youtube link update)
            ].map(({ label, value, color, accent }) => (
              <div key={label} style={S.summaryCard(accent)}>
                <div style={S.summaryLabel}>{label}</div>
                <div style={S.summaryValue(color)}>{value}</div>
              </div>
            ))}
          </div>
        )}

        {/* ── Email Lookup Panel ── */}
        <div style={S.lookupPanel}>
          <div style={S.lookupHeader}>
            <div style={S.lookupTitle}>
              <UserSearch size={18} />
              Referral Center Lookup by Email
            </div>
            <span style={S.lookupDesc}>Admin-only • Enter a user's email to view their Referral Center</span>
          </div>

          <div style={S.lookupBody}>
            <form onSubmit={handleEmailLookup} style={S.lookupForm}>
              <div style={S.lookupInputWrap}>
                <Mail size={15} color="#94a3b8" />
                <input
                  style={S.lookupInput}
                  type="email"
                  placeholder="Enter referrer's email address…"
                  value={lookupEmail}
                  onChange={(e) => setLookupEmail(e.target.value)}
                  disabled={isLookingUp}
                />
              </div>
              <button
                type="submit"
                style={{ ...S.lookupBtn, opacity: isLookingUp ? 0.7 : 1 }}
                disabled={isLookingUp || !lookupEmail.trim()}
              >
                {isLookingUp ? (
                  <div style={{
                    width: 14, height: 14, borderRadius: "50%",
                    border: "2px solid rgba(255,255,255,0.4)",
                    borderTopColor: "#fff",
                    animation: "spin 0.7s linear infinite",
                  }} />
                ) : (
                  <Search size={15} />
                )}
                {isLookingUp ? "Searching…" : "Search"}
              </button>
              {(lookupResult || lookupError) && (
                <button type="button" style={S.lookupClearBtn} onClick={clearLookup}>
                  Clear
                </button>
              )}
            </form>

            {/* Lookup Error */}
            {lookupError && (
              <div style={S.lookupError}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                {lookupError}
              </div>
            )}

            {/* Lookup Results */}
            {lookupResult && (
              <div style={S.lookupResult}>
                {/* Referrer profile banner */}
                <div style={S.lookupReferrerCard}>
                  <div style={{
                    width: 48, height: 48, borderRadius: "50%",
                    overflow: "hidden", border: "2px solid #c7d2fe", flexShrink: 0,
                  }}>
                    <img
                      src={
                        lookupResult.referrer?.profilePicture?.url ||
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          (lookupResult.referrer?.firstName || "") + "+" + (lookupResult.referrer?.lastName || "")
                        )}&background=4f46e5&color=ffffff&size=96`
                      }
                      alt="avatar"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          lookupResult.referrer?.firstName || "?"
                        )}&background=4f46e5&color=ffffff&size=96`;
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 16, color: "#1e293b" }}>
                      {lookupResult.referrer?.firstName} {lookupResult.referrer?.lastName}
                      {(lookupResult.referrer?.role === "admin" || lookupResult.referrer?.role === "superadmin") && (
                        <span style={S.adminBadge}>ADMIN</span>
                      )}
                    </div>
                    <div style={{ fontSize: 13, color: "#6366f1", marginTop: 2 }}>
                      {lookupResult.referrer?.email}
                    </div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                      Member since {new Date(lookupResult.referrer?.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </div>
                  </div>
                </div>

                {/* Stats row */}
                <div style={S.lookupStatsGrid}>
                  {[
                    { label: "Accepted Referrals", value: lookupResult.stats.accepted, accent: "#059669" },
                    { label: "Pending", value: lookupResult.stats.pending, accent: "#d97706" },
                    { label: "Rejected", value: lookupResult.stats.rejected, accent: "#dc2626" },
                    {
                      label: "Total Commission Earned",
                      value: `Rs ${fmt(lookupResult.stats.totalCommissionEarned)}`,
                      accent: "#4f46e5",
                    },
                    {
                      label: "Referral Balance",
                      value: `Rs ${fmt(lookupResult.stats.referralBalance)}`,
                      accent: "#059669",
                    },
                  ].map(({ label, value, accent }) => (
                    <div key={label} style={S.lookupStatCard(accent)}>
                      <div style={{ fontSize: 11, color: accent, fontWeight: 600, marginBottom: 4 }}>{label}</div>
                      <div style={{ fontSize: 20, fontWeight: 800, color: accent }}>{value}</div>
                    </div>
                  ))}
                </div>

                {/* Referral list table */}
                {lookupResult.referrals.length === 0 ? (
                  <div style={{
                    textAlign: "center", padding: "32px 24px",
                    background: "#f8fafc", borderRadius: 12,
                    color: "#94a3b8", fontSize: 14,
                  }}>
                    <Users size={32} style={{ marginBottom: 10, opacity: 0.3 }} />
                    <div style={{ fontWeight: 600, color: "#374151", marginBottom: 4 }}>No referrals yet</div>
                    <div>This user has not added anyone to their Referral Center.</div>
                  </div>
                ) : (
                  <div style={S.lookupReferralTable}>
                    <div style={S.lookupTableHeader}>
                      <span>Referred Person</span>
                      <span>Email</span>
                      <span>Status</span>
                      <span>Commission Earned</span>
                      <span>Date Added</span>
                    </div>
                    {lookupResult.referrals.map((r, idx) => (
                      <div key={r._id} style={S.lookupTableRow(idx % 2 === 1)}>
                        {/* Name */}
                        <div style={S.nameCell}>
                          <span style={S.name}>
                            {r.referee?.firstName} {r.referee?.lastName}
                            {(r.referee?.role === "admin" || r.referee?.role === "superadmin") && (
                              <span style={S.adminBadge}>ADMIN</span>
                            )}
                          </span>
                        </div>

                        {/* Email */}
                        <div style={{ color: "#64748b", fontSize: 12 }}>{r.referee?.email}</div>

                        {/* Status */}
                        <div><StatusBadge status={r.status} /></div>

                        {/* Commission */}
                        <div style={{ fontWeight: 700, color: "#059669", fontSize: 14 }}>
                          Rs {fmt(r.totalCommissionEarned)}
                        </div>

                        {/* Date */}
                        <div style={{ color: "#94a3b8", fontSize: 12 }}>
                          {new Date(r.createdAt).toLocaleDateString("en-GB", {
                            day: "2-digit", month: "short", year: "numeric",
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Referral Bonus Withdrawal Notification Panel ── */}
        <div style={S.bonusPanel}>
          <div style={S.bonusPanelHeader}>
            <div style={S.bonusPanelTitle}>
              <Gift size={18} />
              Referral Bonus Withdrawal Events
              {bonusSummary.count > 0 && (
                <span style={S.bonusBadge}>{bonusSummary.count} payouts</span>
              )}
            </div>
            <div style={S.bonusPanelMeta}>
              <span>
                <TrendingUp size={14} style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }} />
                Total paid out: <strong>Rs {fmt(bonusSummary.totalBonusPaid)}</strong>
              </span>
              <button
                style={{ ...S.refreshBtn, border: "none", background: "transparent", padding: "4px 8px" }}
                onClick={fetchBonusEvents}
                disabled={isFetchingBonus}
              >
                <RefreshCcw
                  size={13}
                  style={{ animation: isFetchingBonus ? "spin 0.8s linear infinite" : "none" }}
                />
                Refresh
              </button>
            </div>
          </div>

          {isFetchingBonus ? (
            <div style={S.bonusEmptyState}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                border: "3px solid #e2e8f0", borderTopColor: "#16a34a",
                animation: "spin 0.8s linear infinite",
                margin: "0 auto 10px",
              }} />
              Loading…
            </div>
          ) : bonusEvents.length === 0 ? (
            <div style={S.bonusEmptyState}>
              <Gift size={32} style={{ marginBottom: 10, opacity: 0.25 }} />
              <div style={{ fontWeight: 600, color: "#374151", marginBottom: 4 }}>No referral bonus payouts yet</div>
              <div style={{ fontSize: 12 }}>
                When a referred user makes a withdrawal, 5% will be credited to the referrer and will appear here.
              </div>
            </div>
          ) : (
            <>
              <div style={S.bonusEventHeader}>
                <span>User (Who Withdrew)</span>
                <span>Withdrawal Amount</span>
                <span>5% Referral Bonus</span>
                <span>Date</span>
              </div>
              {bonusEvents.map((event, idx) => (
                <div key={event._id} style={S.bonusEventRow(idx % 2 === 1)}>
                  {/* User */}
                  <div style={S.nameCell}>
                    <span style={S.name}>
                      {event.user?.firstName} {event.user?.lastName}
                    </span>
                    <span style={S.email}>{event.user?.email}</span>
                  </div>

                  {/* Total withdrawal */}
                  <div style={{ fontWeight: 700, color: "#1e293b" }}>
                    Rs {fmt(event.amount)}
                  </div>

                  {/* Referral bonus portion */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{
                      background: "#d1fae5", color: "#065f46",
                      fontWeight: 700, fontSize: 13,
                      padding: "2px 10px", borderRadius: 20,
                    }}>
                      +Rs {fmt(event.referralBonus)}
                    </span>
                  </div>

                  {/* Date */}
                  <div style={{ color: "#94a3b8", fontSize: 12 }}>
                    {new Date(event.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit", month: "short", year: "numeric",
                    })}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

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
