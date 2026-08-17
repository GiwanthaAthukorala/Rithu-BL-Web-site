"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Bell,
  UserPlus,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
  Gift,
  RefreshCcw,
} from "lucide-react";
import api from "@/lib/api";

export default function ReferralNotifications({ onUnreadCountChange }) {
  const [notifications, setNotifications] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [responding, setResponding] = useState({}); // { [referralId]: true }
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setIsFetching(true);
      setError(null);
      const res = await api.get("/api/referrals/notifications");
      if (res.data?.success) {
        const notifs = res.data.data.notifications || [];
        setNotifications(notifs);
        onUnreadCountChange?.(res.data.data.unreadCount || 0);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load notifications");
    } finally {
      setIsFetching(false);
    }
  }, [onUnreadCountChange]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleRespond = async (referralId, notifId, action) => {
    setResponding((prev) => ({ ...prev, [referralId]: true }));
    try {
      const res = await api.put(`/api/referrals/${referralId}/respond`, { action });
      if (res.data?.success) {
        // Mark the notification read
        await api.put(`/api/referrals/notifications/${notifId}/read`);
        setSuccess(res.data.message);
        fetchNotifications();
        setTimeout(() => setSuccess(null), 5000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to respond. Please try again.");
      setTimeout(() => setError(null), 5000);
    } finally {
      setResponding((prev) => ({ ...prev, [referralId]: false }));
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put("/api/referrals/notifications/read-all");
      fetchNotifications();
    } catch {}
  };

  // ─── icons by type ───────────────────────────────────────────────────────
  const typeConfig = {
    referral_invite: {
      icon: <UserPlus size={18} color="#6366f1" />,
      bg: "#ede9fe",
      label: "Referral Invitation",
    },
    referral_accepted: {
      icon: <CheckCircle size={18} color="#059669" />,
      bg: "#d1fae5",
      label: "Referral Accepted",
    },
    referral_rejected: {
      icon: <XCircle size={18} color="#dc2626" />,
      bg: "#fee2e2",
      label: "Referral Declined",
    },
    referral_commission: {
      icon: <Gift size={18} color="#d97706" />,
      bg: "#fef3c7",
      label: "Commission Earned",
    },
  };

  // ─── Styles ───────────────────────────────────────────────────────────────
  const S = {
    root: { fontFamily: "var(--font-sans, 'Inter', sans-serif)" },
    header: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    title: {
      fontSize: 17,
      fontWeight: 700,
      color: "#1e293b",
      display: "flex",
      alignItems: "center",
      gap: 8,
    },
    markAllBtn: {
      background: "none",
      border: "1px solid #e2e8f0",
      borderRadius: 8,
      padding: "5px 12px",
      fontSize: 12,
      fontWeight: 600,
      color: "#6366f1",
      cursor: "pointer",
    },
    alert: (type) => ({
      padding: "10px 14px",
      borderRadius: 10,
      fontSize: 13,
      fontWeight: 500,
      marginBottom: 14,
      background: type === "error" ? "#fef2f2" : "#f0fdf4",
      color: type === "error" ? "#dc2626" : "#16a34a",
      border: `1px solid ${type === "error" ? "#fecaca" : "#bbf7d0"}`,
      display: "flex",
      alignItems: "center",
      gap: 8,
    }),
    notifCard: (isRead) => ({
      background: isRead ? "#fff" : "#f5f3ff",
      border: `1.5px solid ${isRead ? "#e2e8f0" : "#ddd6fe"}`,
      borderRadius: 14,
      padding: "14px 16px",
      marginBottom: 10,
      transition: "box-shadow 0.15s",
    }),
    notifTop: {
      display: "flex",
      alignItems: "flex-start",
      gap: 12,
    },
    iconBox: (bg) => ({
      width: 38,
      height: 38,
      borderRadius: "50%",
      background: bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }),
    notifContent: { flex: 1 },
    notifLabel: {
      fontSize: 11,
      fontWeight: 700,
      color: "#6366f1",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      marginBottom: 3,
    },
    notifMsg: { fontSize: 13, color: "#374151", lineHeight: 1.5 },
    notifTime: { fontSize: 11, color: "#94a3b8", marginTop: 4 },
    unreadDot: {
      width: 8,
      height: 8,
      borderRadius: "50%",
      background: "#6366f1",
      flexShrink: 0,
      marginTop: 6,
    },
    actionRow: {
      display: "flex",
      gap: 8,
      marginTop: 12,
    },
    acceptBtn: {
      flex: 1,
      padding: "8px",
      background: "linear-gradient(135deg, #059669, #10b981)",
      color: "#fff",
      border: "none",
      borderRadius: 8,
      fontSize: 13,
      fontWeight: 700,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    },
    rejectBtn: {
      flex: 1,
      padding: "8px",
      background: "#fff",
      color: "#dc2626",
      border: "1.5px solid #fca5a5",
      borderRadius: 8,
      fontSize: 13,
      fontWeight: 700,
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
    },
    emptyState: {
      textAlign: "center",
      padding: "48px 24px",
      color: "#94a3b8",
    },
  };

  const pendingInvites = notifications.filter(
    (n) => n.type === "referral_invite" && n.referral?.status === "pending"
  );

  return (
    <div style={S.root}>
      <div style={S.header}>
        <div style={S.title}>
          <Bell size={18} color="#6366f1" /> Referral Notifications
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={S.markAllBtn} onClick={fetchNotifications} title="Refresh">
            <RefreshCcw size={13} />
          </button>
          {notifications.some((n) => !n.isRead) && (
            <button style={S.markAllBtn} onClick={handleMarkAllRead}>
              Mark all read
            </button>
          )}
        </div>
      </div>

      {success && (
        <div style={S.alert("success")}>
          <CheckCircle size={15} /> {success}
        </div>
      )}
      {error && (
        <div style={S.alert("error")}>
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {/* Pending invitations section */}
      {pendingInvites.length > 0 && (
        <div
          style={{
            background: "#ede9fe",
            borderRadius: 12,
            padding: "12px 14px",
            marginBottom: 16,
            border: "1.5px solid #ddd6fe",
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: "#5b21b6", marginBottom: 4 }}>
            🎯 {pendingInvites.length} Pending Invitation{pendingInvites.length > 1 ? "s" : ""}
          </div>
          <div style={{ fontSize: 12, color: "#7c3aed" }}>
            You have referral invitations waiting for your response below.
          </div>
        </div>
      )}

      {isFetching ? (
        <div style={{ textAlign: "center", padding: 32 }}>
          <Loader2 size={28} color="#6366f1" style={{ animation: "spin 0.8s linear infinite" }} />
        </div>
      ) : notifications.length === 0 ? (
        <div style={S.emptyState}>
          <Bell size={36} style={{ marginBottom: 12, opacity: 0.4 }} />
          <div style={{ fontSize: 15, fontWeight: 600, color: "#374151" }}>
            No notifications yet
          </div>
          <div style={{ fontSize: 13, marginTop: 4 }}>
            Referral invites and commission alerts will appear here.
          </div>
        </div>
      ) : (
        notifications.map((notif) => {
          const cfg = typeConfig[notif.type] || typeConfig.referral_invite;
          const isPendingInvite =
            notif.type === "referral_invite" && notif.referral?.status === "pending";
          const isResponding = responding[notif.referral?._id];

          return (
            <div key={notif._id} style={S.notifCard(notif.isRead)}>
              <div style={S.notifTop}>
                <div style={S.iconBox(cfg.bg)}>{cfg.icon}</div>
                <div style={S.notifContent}>
                  <div style={S.notifLabel}>{cfg.label}</div>
                  <div style={S.notifMsg}>{notif.message}</div>
                  <div style={S.notifTime}>
                    {new Date(notif.createdAt).toLocaleString()}
                  </div>

                  {/* Accept / Reject buttons for pending invites */}
                  {isPendingInvite && notif.referral?._id && (
                    <div style={S.actionRow}>
                      <button
                        style={{ ...S.acceptBtn, opacity: isResponding ? 0.6 : 1 }}
                        disabled={isResponding}
                        onClick={() =>
                          handleRespond(notif.referral._id, notif._id, "accept")
                        }
                      >
                        {isResponding ? (
                          <Loader2 size={14} />
                        ) : (
                          <CheckCircle size={14} />
                        )}
                        Accept
                      </button>
                      <button
                        style={{ ...S.rejectBtn, opacity: isResponding ? 0.6 : 1 }}
                        disabled={isResponding}
                        onClick={() =>
                          handleRespond(notif.referral._id, notif._id, "reject")
                        }
                      >
                        {isResponding ? <Loader2 size={14} /> : <XCircle size={14} />}
                        Decline
                      </button>
                    </div>
                  )}
                </div>
                {!notif.isRead && <div style={S.unreadDot} />}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
