"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  UserPlus,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Gift,
  Star,
  Award,
} from "lucide-react";
import api from "@/lib/api";

// ─── helpers ────────────────────────────────────────────────────────────────
const fmt = (v) => (v || 0).toFixed(2);

const StatusBadge = ({ status }) => {
  const map = {
    accepted: {
      bg: "#d1fae5",
      color: "#065f46",
      icon: <CheckCircle size={12} />,
      label: "Accepted",
    },
    pending: {
      bg: "#fef3c7",
      color: "#92400e",
      icon: <Clock size={12} />,
      label: "Pending",
    },
    rejected: {
      bg: "#fee2e2",
      color: "#991b1b",
      icon: <XCircle size={12} />,
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

// ─── Main Component ──────────────────────────────────────────────────────────
export default function ReferralCenter({ user }) {
  const [tab, setTab] = useState("overview"); // overview | add | list
  const [referrals, setReferrals] = useState([]);
  const [stats, setStats] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Add-referral form
  const [form, setForm] = useState({ name: "", email: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Expanded card
  const [expandedId, setExpandedId] = useState(null);

  const fetchReferrals = useCallback(async () => {
    try {
      setIsFetching(true);
      setError(null);
      const res = await api.get("/api/referrals/mine");
      if (res.data?.success) {
        setReferrals(res.data.data.referrals || []);
        setStats(res.data.data.stats);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load referrals");
    } finally {
      setIsFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchReferrals();
  }, [fetchReferrals]);

  const handleAddReferral = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setFormError("Please fill in both name and email.");
      return;
    }
    setIsSubmitting(true);
    setFormError(null);
    try {
      const res = await api.post("/api/referrals/send", {
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
      });
      if (res.data?.success) {
        setSuccess(res.data.message);
        setForm({ name: "", email: "" });
        setTab("list");
        fetchReferrals();
        setTimeout(() => setSuccess(null), 7000);
      }
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to send referral invite.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Styles ───────────────────────────────────────────────────────────────
  const styles = {
    root: {
      fontFamily: "var(--font-sans, 'Inter', sans-serif)",
      maxWidth: "100%",
    },
    // ── Header banner ──
    banner: {
      background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%)",
      borderRadius: 16,
      padding: "28px 32px",
      marginBottom: 24,
      color: "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 16,
      boxShadow: "0 8px 32px rgba(99,102,241,0.25)",
    },
    bannerLeft: { display: "flex", flexDirection: "column", gap: 6 },
    bannerTitle: {
      fontSize: 22,
      fontWeight: 700,
      margin: 0,
      letterSpacing: "-0.3px",
    },
    bannerSub: { fontSize: 14, opacity: 0.85, margin: 0 },
    slotsChip: {
      background: "rgba(255,255,255,0.2)",
      borderRadius: 20,
      padding: "6px 16px",
      fontSize: 13,
      fontWeight: 600,
      backdropFilter: "blur(4px)",
      border: "1px solid rgba(255,255,255,0.3)",
    },
    // ── Stats row ──
    statsRow: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
      gap: 12,
      marginBottom: 24,
    },
    statCard: {
      background: "#fff",
      borderRadius: 12,
      padding: "16px 18px",
      border: "1px solid #e2e8f0",
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      display: "flex",
      flexDirection: "column",
      gap: 6,
    },
    statLabel: { fontSize: 12, color: "#64748b", fontWeight: 500 },
    statValue: { fontSize: 22, fontWeight: 700, color: "#1e293b" },
    statSub: { fontSize: 11, color: "#94a3b8" },
    // ── Tabs ──
    tabs: {
      display: "flex",
      gap: 8,
      marginBottom: 20,
      borderBottom: "2px solid #f1f5f9",
      paddingBottom: 0,
    },
    tabBtn: (active) => ({
      padding: "8px 18px",
      border: "none",
      background: "none",
      cursor: "pointer",
      fontSize: 14,
      fontWeight: active ? 700 : 500,
      color: active ? "#6366f1" : "#64748b",
      borderBottom: active ? "2px solid #6366f1" : "2px solid transparent",
      marginBottom: -2,
      transition: "all 0.15s",
    }),
    // ── Add Form ──
    formCard: {
      background: "#fff",
      border: "1px solid #e2e8f0",
      borderRadius: 16,
      padding: 28,
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    },
    formTitle: {
      fontSize: 17,
      fontWeight: 700,
      color: "#1e293b",
      marginBottom: 8,
      display: "flex",
      alignItems: "center",
      gap: 8,
    },
    formDesc: { fontSize: 13, color: "#64748b", marginBottom: 24 },
    fieldGroup: { marginBottom: 18 },
    label: {
      display: "block",
      fontSize: 13,
      fontWeight: 600,
      color: "#374151",
      marginBottom: 6,
    },
    input: {
      width: "100%",
      padding: "11px 14px",
      borderRadius: 10,
      border: "1.5px solid #e2e8f0",
      fontSize: 14,
      color: "#1e293b",
      outline: "none",
      transition: "border 0.15s",
      boxSizing: "border-box",
      background: "#f8fafc",
    },
    submitBtn: {
      width: "100%",
      padding: "13px",
      background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
      color: "#fff",
      border: "none",
      borderRadius: 10,
      fontSize: 15,
      fontWeight: 700,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      marginTop: 8,
      transition: "opacity 0.2s",
      boxShadow: "0 4px 14px rgba(99,102,241,0.35)",
    },
    // ── Referral Cards ──
    referralCard: (status) => ({
      background: "#fff",
      border: `1.5px solid ${status === "accepted" ? "#a7f3d0" : status === "pending" ? "#fde68a" : "#fca5a5"}`,
      borderRadius: 14,
      padding: "18px 20px",
      marginBottom: 12,
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      transition: "box-shadow 0.15s",
    }),
    cardTop: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
    },
    cardLeft: { display: "flex", alignItems: "center", gap: 12 },
    avatar: {
      width: 42,
      height: 42,
      borderRadius: "50%",
      objectFit: "cover",
      border: "2px solid #e2e8f0",
    },
    cardName: { fontSize: 15, fontWeight: 700, color: "#1e293b" },
    cardEmail: { fontSize: 12, color: "#64748b", marginTop: 2 },
    cardRight: { display: "flex", alignItems: "center", gap: 10 },
    expandBtn: {
      background: "none",
      border: "none",
      cursor: "pointer",
      color: "#94a3b8",
      padding: 4,
    },
    commissionLine: {
      marginTop: 14,
      paddingTop: 14,
      borderTop: "1px solid #f1f5f9",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      fontSize: 13,
      color: "#475569",
    },
    commissionHistory: {
      marginTop: 12,
      background: "#f8fafc",
      borderRadius: 8,
      padding: "10px 14px",
    },
    historyTitle: {
      fontSize: 12,
      fontWeight: 700,
      color: "#64748b",
      marginBottom: 8,
      textTransform: "uppercase",
      letterSpacing: "0.05em",
    },
    historyRow: {
      display: "flex",
      justifyContent: "space-between",
      fontSize: 12,
      color: "#475569",
      padding: "4px 0",
      borderBottom: "1px solid #e2e8f0",
    },
    // ── Commission earnings banner ──
    earningsBanner: {
      background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
      borderRadius: 14,
      padding: "18px 24px",
      color: "#fff",
      display: "flex",
      alignItems: "center",
      gap: 16,
      marginBottom: 20,
      boxShadow: "0 4px 16px rgba(16,185,129,0.25)",
    },
    earningsIcon: {
      background: "rgba(255,255,255,0.2)",
      borderRadius: "50%",
      width: 48,
      height: 48,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    },
    earningsTitle: { fontSize: 13, opacity: 0.85, marginBottom: 2 },
    earningsAmount: { fontSize: 28, fontWeight: 800, letterSpacing: "-0.5px" },
    earningsSub: { fontSize: 12, opacity: 0.75, marginTop: 2 },
    // ── Alert ──
    alert: (type) => ({
      padding: "12px 16px",
      borderRadius: 10,
      display: "flex",
      alignItems: "center",
      gap: 10,
      fontSize: 13,
      fontWeight: 500,
      marginBottom: 16,
      background: type === "error" ? "#fef2f2" : "#f0fdf4",
      color: type === "error" ? "#dc2626" : "#16a34a",
      border: `1px solid ${type === "error" ? "#fecaca" : "#bbf7d0"}`,
    }),
    emptyState: {
      textAlign: "center",
      padding: "48px 24px",
      color: "#64748b",
    },
    emptyIcon: {
      margin: "0 auto 16px",
      width: 64,
      height: 64,
      background: "#f1f5f9",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  };

  const getAvatarUrl = (referee) => {
    if (referee?.profilePicture?.url) return referee.profilePicture.url;
    const initials = `${referee?.firstName?.charAt(0) || ""}${referee?.lastName?.charAt(0) || ""}`;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=6366f1&color=ffffff&size=80`;
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div style={styles.root}>
      {/* ── Banner ── */}
      <div style={styles.banner}>
        <div style={styles.bannerLeft}>
          <h2 style={styles.bannerTitle}>🤝 Referral Center</h2>
          <p style={styles.bannerSub}>
            Invite members to your network and earn 5% commission on every withdrawal they make.
          </p>
        </div>
        {stats && (
          <div style={styles.slotsChip}>
            {stats.remainingSlots} / 20 slots remaining
          </div>
        )}
      </div>

      {/* ── Global alerts ── */}
      {success && (
        <div style={styles.alert("success")}>
          <CheckCircle size={16} />
          {success}
        </div>
      )}
      {error && (
        <div style={styles.alert("error")}>
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {/* ── Stats Row ── */}
      {stats && (
        <div style={styles.statsRow}>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Total Referrals</span>
            <span style={styles.statValue}>{stats.accepted}</span>
            <span style={styles.statSub}>accepted</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Pending</span>
            <span style={styles.statValue}>{stats.pending}</span>
            <span style={styles.statSub}>awaiting response</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Commission Earned</span>
            <span style={{ ...styles.statValue, color: "#059669" }}>
              Rs {fmt(stats.totalCommissionEarned)}
            </span>
            <span style={styles.statSub}>from referral activity</span>
          </div>
          <div style={styles.statCard}>
            <span style={styles.statLabel}>Available Balance</span>
            <span style={{ ...styles.statValue, color: "#6366f1" }}>
              Rs {fmt(stats.referralEarningsBalance)}
            </span>
            <span style={styles.statSub}>referral earnings</span>
          </div>
        </div>
      )}

      {/* ── Tabs ── */}
      <div style={styles.tabs}>
        {[
          { key: "overview", label: "Overview" },
          { key: "add", label: "Add Referral" },
          { key: "list", label: `My Referrals (${referrals.length})` },
        ].map(({ key, label }) => (
          <button key={key} style={styles.tabBtn(tab === key)} onClick={() => setTab(key)}>
            {label}
          </button>
        ))}
      </div>

      {/* ══════ OVERVIEW TAB ══════ */}
      {tab === "overview" && (
        <div>
          {/* Commission banner */}
          {stats && stats.referralEarningsBalance > 0 && (
            <div style={styles.earningsBanner}>
              <div style={styles.earningsIcon}>
                <Gift size={24} />
              </div>
              <div>
                <div style={styles.earningsTitle}>Referral Commission Balance</div>
                <div style={styles.earningsAmount}>Rs {fmt(stats.referralEarningsBalance)}</div>
                <div style={styles.earningsSub}>5% of your referrals' withdrawals</div>
              </div>
            </div>
          )}

          {/* How it works */}
          <div style={styles.formCard}>
            <div style={styles.formTitle}>
              <Star size={18} color="#f59e0b" /> How the Referral Program Works
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 16 }}>
              {[
                {
                  step: "1",
                  icon: <UserPlus size={20} color="#6366f1" />,
                  title: "Add a Member",
                  desc: "Go to 'Add Referral' and enter the name and email of a registered member.",
                },
                {
                  step: "2",
                  icon: <Mail size={20} color="#6366f1" />,
                  title: "They Accept",
                  desc: "The member receives a notification and must accept your invitation.",
                },
                {
                  step: "3",
                  icon: <DollarSign size={20} color="#059669" />,
                  title: "Earn 5% Commission",
                  desc: "Every time they make a withdrawal, 5% is automatically added to your account.",
                },
                {
                  step: "4",
                  icon: <Award size={20} color="#f59e0b" />,
                  title: "Up to 20 Referrals",
                  desc: "You can have up to 20 active referrals in your network.",
                },
              ].map(({ step, icon, title, desc }) => (
                <div
                  key={step}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 14,
                    padding: "14px 16px",
                    background: "#f8fafc",
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: "#fff",
                      border: "2px solid #e2e8f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#1e293b" }}>{title}</div>
                    <div style={{ fontSize: 13, color: "#64748b", marginTop: 3 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════ ADD TAB ══════ */}
      {tab === "add" && (
        <div style={styles.formCard}>
          <div style={styles.formTitle}>
            <UserPlus size={18} color="#6366f1" /> Add a Referral
          </div>
          <p style={styles.formDesc}>
            Enter the name and registered email of the member you want to add. They will receive an
            invitation and must accept it.
          </p>

          {formError && (
            <div style={styles.alert("error")}>
              <AlertCircle size={16} /> {formError}
            </div>
          )}

          {stats && stats.remainingSlots === 0 && (
            <div style={styles.alert("error")}>
              <AlertCircle size={16} />
              You have reached the maximum limit of 20 referrals.
            </div>
          )}

          <form onSubmit={handleAddReferral}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Name of Member</label>
              <input
                style={styles.input}
                type="text"
                placeholder="Enter the member's name"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                disabled={isSubmitting || (stats && stats.remainingSlots === 0)}
              />
            </div>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                style={styles.input}
                type="email"
                placeholder="Enter their registered email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                disabled={isSubmitting || (stats && stats.remainingSlots === 0)}
              />
            </div>
            <button
              type="submit"
              style={{
                ...styles.submitBtn,
                opacity: isSubmitting || (stats && stats.remainingSlots === 0) ? 0.6 : 1,
              }}
              disabled={isSubmitting || (stats && stats.remainingSlots === 0)}
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
              {isSubmitting ? "Sending Invitation…" : "Send Referral Invitation"}
            </button>
          </form>
        </div>
      )}

      {/* ══════ LIST TAB ══════ */}
      {tab === "list" && (
        <div>
          {isFetching ? (
            <div style={{ textAlign: "center", padding: 40 }}>
              <Loader2 size={32} color="#6366f1" style={{ animation: "spin 0.8s linear infinite" }} />
            </div>
          ) : referrals.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>
                <Users size={28} color="#94a3b8" />
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                No referrals yet
              </div>
              <div style={{ fontSize: 13, color: "#94a3b8" }}>
                Head over to the "Add Referral" tab to invite your first member.
              </div>
            </div>
          ) : (
            <div>
              {referrals.map((r) => (
                <div key={r._id} style={styles.referralCard(r.status)}>
                  <div style={styles.cardTop}>
                    <div style={styles.cardLeft}>
                      <img
                        src={getAvatarUrl(r.referee)}
                        alt="avatar"
                        style={styles.avatar}
                        onError={(e) => {
                          e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            r.referee?.firstName || "?"
                          )}&background=6366f1&color=ffffff&size=80`;
                        }}
                      />
                      <div>
                        <div style={styles.cardName}>
                          {r.referee?.firstName} {r.referee?.lastName}
                        </div>
                        <div style={styles.cardEmail}>{r.referee?.email}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                          Added {new Date(r.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div style={styles.cardRight}>
                      <StatusBadge status={r.status} />
                      {r.status === "accepted" && (
                        <button
                          style={styles.expandBtn}
                          onClick={() => setExpandedId(expandedId === r._id ? null : r._id)}
                        >
                          {expandedId === r._id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded commission details */}
                  {r.status === "accepted" && expandedId === r._id && (
                    <div>
                      <div style={styles.commissionLine}>
                        <span>Total commission earned from this referral</span>
                        <span style={{ fontWeight: 700, color: "#059669" }}>
                          Rs {fmt(r.totalCommissionEarned)}
                        </span>
                      </div>
                      {r.commissionHistory && r.commissionHistory.length > 0 && (
                        <div style={styles.commissionHistory}>
                          <div style={styles.historyTitle}>Commission History</div>
                          {r.commissionHistory.map((h, i) => (
                            <div key={i} style={styles.historyRow}>
                              <span>
                                Withdrawal: Rs {fmt(h.withdrawalAmount)} •{" "}
                                {new Date(h.date).toLocaleDateString()}
                              </span>
                              <span style={{ color: "#059669", fontWeight: 600 }}>
                                +Rs {fmt(h.commissionAmount)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
