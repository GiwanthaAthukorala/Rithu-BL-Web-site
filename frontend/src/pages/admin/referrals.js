"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  TrendingUp,
  RefreshCcw,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
} from "lucide-react";
import { useRouter } from "next/router";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

// ─── helpers ────────────────────────────────────────────────────────────────
const fmt = (v) => (v || 0).toFixed(2);

const StatusBadge = ({ status }) => {
  const map = {
    accepted: { bg: "#d1fae5", color: "#065f46", icon: <CheckCircle size={11} />, label: "Accepted" },
    pending:  { bg: "#fef3c7", color: "#92400e", icon: <Clock size={11} />,        label: "Pending"  },
    rejected: { bg: "#fee2e2", color: "#991b1b", icon: <XCircle size={11} />,      label: "Rejected" },
  };
  const s = map[status] || map.pending;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 10px", borderRadius: 20,
      background: s.bg, color: s.color, fontSize: 12, fontWeight: 600,
    }}>
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

  const getToken = () => {
    try { return JSON.parse(localStorage.getItem("adminUser"))?.token || ""; }
    catch { return ""; }
  };

  const fetchReferrals = useCallback(async (page = 1) => {
    setIsFetching(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`${API_BASE}/api/referrals/admin/all?${params}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to load");

      setReferrals(data.data.referrals || []);
      setPagination(data.data.pagination);
      setSummary(data.data.summary);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsFetching(false);
    }
  }, [statusFilter]);

  useEffect(() => { fetchReferrals(1); }, [fetchReferrals]);

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
    },
    headerTitle: { fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: "-0.3px" },
    headerSub: { fontSize: 14, opacity: 0.8, marginTop: 4 },
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
      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
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
    summaryLabel: { fontSize: 12, color: "#64748b", fontWeight: 500, marginBottom: 4 },
    summaryValue: (color) => ({ fontSize: 24, fontWeight: 800, color }),
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
      gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr",
      padding: "12px 20px",
      background: "#f8fafc",
      borderBottom: "1px solid #e2e8f0",
      fontSize: 11,
      fontWeight: 700,
      color: "#94a3b8",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    },
    tableRow: {
      display: "grid",
      gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr",
      padding: "14px 20px",
      borderBottom: "1px solid #f1f5f9",
      alignItems: "center",
      fontSize: 13,
      color: "#374151",
    },
    nameCell: { display: "flex", flexDirection: "column", gap: 2 },
    name: { fontWeight: 600, color: "#1e293b", fontSize: 14 },
    email: { color: "#94a3b8", fontSize: 12 },
    pagination: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      padding: "16px",
      borderTop: "1px solid #f1f5f9",
    },
    pageBtn: (active) => ({
      width: 36, height: 36, borderRadius: 8,
      border: active ? "none" : "1px solid #e2e8f0",
      background: active ? "#4f46e5" : "#fff",
      color: active ? "#fff" : "#374151",
      cursor: "pointer", fontWeight: 600, fontSize: 14,
    }),
    emptyState: { textAlign: "center", padding: "64px 24px", color: "#94a3b8" },
  };

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <div>
          <h1 style={S.headerTitle}>🤝 Referral Management</h1>
          <p style={S.headerSub}>View and manage all referral relationships on the platform</p>
        </div>
        <button style={S.backBtn} onClick={() => router.back()}>
          <ChevronLeft size={16} /> Back
        </button>
      </div>

      <div style={S.main}>
        {/* Error */}
        {error && (
          <div style={{
            background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca",
            borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 13,
          }}>
            {error}
          </div>
        )}

        {/* Summary Cards */}
        {summary && (
          <div style={S.summaryGrid}>
            {[
              { label: "Total Accepted", value: summary.totalAccepted, color: "#059669", accent: "#059669" },
              { label: "Pending", value: summary.totalPending, color: "#d97706", accent: "#d97706" },
              { label: "Rejected", value: summary.totalRejected, color: "#dc2626", accent: "#dc2626" },
              { label: "Total Commission Paid", value: `Rs ${fmt(summary.totalCommissionPaid)}`, color: "#4f46e5", accent: "#4f46e5" },
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
            onChange={(e) => { setStatusFilter(e.target.value); fetchReferrals(1); }}
          >
            <option value="">All Statuses</option>
            <option value="accepted">Accepted</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
          <button style={S.refreshBtn} onClick={() => fetchReferrals(pagination.page)}>
            <RefreshCcw size={14} /> Refresh
          </button>
        </div>

        {/* Table */}
        <div style={S.tableWrapper}>
          <div style={S.tableHeader}>
            <span>Referrer</span>
            <span>Referee (Added Person)</span>
            <span>Status</span>
            <span>Commission</span>
            <span>Date</span>
          </div>

          {isFetching ? (
            <div style={S.emptyState}>
              <div style={{
                width: 40, height: 40, borderRadius: "50%",
                border: "3px solid #e2e8f0", borderTopColor: "#4f46e5",
                animation: "spin 0.8s linear infinite", margin: "0 auto 12px",
              }} />
              Loading…
            </div>
          ) : filtered.length === 0 ? (
            <div style={S.emptyState}>
              <Users size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
              <div style={{ fontSize: 16, fontWeight: 600, color: "#374151" }}>No referrals found</div>
            </div>
          ) : (
            filtered.map((r) => (
              <div key={r._id} style={S.tableRow}>
                {/* Referrer */}
                <div style={S.nameCell}>
                  <span style={S.name}>
                    {r.referrer?.firstName} {r.referrer?.lastName}
                    {(r.referrer?.role === "admin" || r.referrer?.role === "superadmin") && (
                      <span style={{ marginLeft: 6, fontSize: 10, background: "#ede9fe", color: "#7c3aed", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>
                        ADMIN
                      </span>
                    )}
                  </span>
                  <span style={S.email}>{r.referrer?.email}</span>
                </div>

                {/* Referee */}
                <div style={S.nameCell}>
                  <span style={S.name}>
                    {r.referee?.firstName} {r.referee?.lastName}
                    {(r.referee?.role === "admin" || r.referee?.role === "superadmin") && (
                      <span style={{ marginLeft: 6, fontSize: 10, background: "#ede9fe", color: "#7c3aed", padding: "2px 6px", borderRadius: 4, fontWeight: 700 }}>
                        ADMIN
                      </span>
                    )}
                  </span>
                  <span style={S.email}>{r.referee?.email}</span>
                </div>

                {/* Status */}
                <div><StatusBadge status={r.status} /></div>

                {/* Commission */}
                <div style={{ fontWeight: 700, color: "#059669" }}>
                  Rs {fmt(r.totalCommissionEarned)}
                </div>

                {/* Date */}
                <div style={{ color: "#94a3b8", fontSize: 12 }}>
                  {new Date(r.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div style={S.pagination}>
              <button
                style={S.pageBtn(false)}
                disabled={pagination.page <= 1}
                onClick={() => fetchReferrals(pagination.page - 1)}
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  style={S.pageBtn(p === pagination.page)}
                  onClick={() => fetchReferrals(p)}
                >
                  {p}
                </button>
              ))}
              <button
                style={S.pageBtn(false)}
                disabled={pagination.page >= pagination.pages}
                onClick={() => fetchReferrals(pagination.page + 1)}
              >
                <ChevronRight size={16} />
              </button>
              <span style={{ fontSize: 13, color: "#94a3b8" }}>
                {pagination.total} total
              </span>
            </div>
          )}
        </div>

        {/* Spin animation */}
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
