"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Edit3,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Instagram,
  ExternalLink,
  Link as LinkIcon,
  ToggleLeft,
  ToggleRight,
  Zap,
  Shield,
  X,
  Loader2,
  User,
} from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/Context/AuthContext";
import InstagramEditAccountModal from "./InstagramEditAccountModal";

/* ═══════════════════════════════════════════════════════════
   ADD ACCOUNT MODAL  (embedded — no separate file needed)
═══════════════════════════════════════════════════════════ */
function InstagramAddAccountModal({ isOpen, onClose, onAdd, remainingSlots }) {
  const [formData, setFormData] = useState({ accountName: "", profileUrl: "" });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.accountName.trim())
      newErrors.accountName = "Account name is required";
    if (!formData.profileUrl.trim()) {
      newErrors.profileUrl = "Profile URL is required";
    } else {
      const urlPattern =
        /^(https?:\/\/)?(www\.)?(instagram\.com)\/[a-zA-Z0-9.\-_]+/i;
      const profilePattern =
        /^(https?:\/\/)?(www\.)?instagram\.com\/profile\.php\?id=\d+$/i;
      if (
        !urlPattern.test(formData.profileUrl) &&
        !profilePattern.test(formData.profileUrl)
      )
        newErrors.profileUrl = "Please enter a valid Instagram profile URL";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      await onAdd(formData);
      setFormData({ accountName: "", profileUrl: "" });
      setErrors({});
      onClose();
    } catch (error) {
      setSubmitError(
        error.message || "Failed to add account. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    if (submitError) setSubmitError(null);
  };

  if (!isOpen) return null;

  const inputBase = {
    width: "100%",
    paddingLeft: "42px",
    paddingRight: "16px",
    paddingTop: "12px",
    paddingBottom: "12px",
    borderRadius: "12px",
    outline: "none",
    fontFamily: "Sora, sans-serif",
    fontSize: "14px",
    boxSizing: "border-box",
    transition: "border-color 0.2s, box-shadow 0.2s",
    color: "#0f172a",
    background: "white",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        zIndex: 50,
      }}
    >
      <div
        style={{
          background: "white",
          borderRadius: "24px",
          maxWidth: "460px",
          width: "100%",
          boxShadow: "0 28px 64px rgba(0,0,0,0.22)",
          overflow: "hidden",
        }}
      >
        {/* ── Modal Header ── */}
        <div
          style={{
            background:
              "linear-gradient(135deg, #833ab4 0%, #c13584 35%, #e1306c 60%, #fd1d1d 80%, #fcaf45 100%)",
            padding: "24px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-50px",
              right: "-50px",
              width: "140px",
              height: "140px",
              background: "rgba(255,255,255,0.1)",
              borderRadius: "50%",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-35px",
              left: "25%",
              width: "90px",
              height: "90px",
              background: "rgba(255,255,255,0.07)",
              borderRadius: "50%",
            }}
          />
          <div
            style={{
              position: "relative",
              zIndex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  background: "rgba(255,255,255,0.18)",
                  backdropFilter: "blur(6px)",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid rgba(255,255,255,0.28)",
                }}
              >
                <Instagram color="white" size={22} />
              </div>
              <div>
                <h3
                  style={{
                    color: "white",
                    fontSize: "18px",
                    fontWeight: 800,
                    margin: 0,
                    lineHeight: 1.2,
                  }}
                >
                  Add Instagram Account
                </h3>
                <p
                  style={{
                    color: "rgba(255,255,255,0.72)",
                    fontSize: "12px",
                    margin: "3px 0 0",
                  }}
                >
                  Link a new account to your tasks
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "none",
                borderRadius: "50%",
                width: "36px",
                height: "36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "white",
                transition: "background 0.2s",
                flexShrink: 0,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.28)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.15)")
              }
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Modal Body ── */}
        <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
          {/* Slots info */}
          <div
            style={{
              background: "linear-gradient(135deg, #fdf2f8, #fef3f2)",
              border: "1px solid #f0b3d6",
              borderRadius: "14px",
              padding: "14px 16px",
              marginBottom: "20px",
            }}
          >
            <p
              style={{
                color: "#9d174d",
                fontSize: "13px",
                fontWeight: 700,
                margin: "0 0 4px",
              }}
            >
              Available Slots: {remainingSlots}/20
            </p>
            <p style={{ color: "#be185d", fontSize: "12px", margin: 0 }}>
              You can add up to 20 different Instagram accounts. Each must be
              unique.
            </p>
          </div>

          {/* Submit error */}
          {submitError && (
            <div
              style={{
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "12px",
                padding: "12px 14px",
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                marginBottom: "16px",
              }}
            >
              <AlertCircle
                size={16}
                color="#dc2626"
                style={{ flexShrink: 0, marginTop: "1px" }}
              />
              <p style={{ color: "#dc2626", fontSize: "13px", margin: 0 }}>
                {submitError}
              </p>
            </div>
          )}

          {/* Account Name */}
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 700,
                color: "#374151",
                marginBottom: "8px",
              }}
            >
              Account Name <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <div style={{ position: "relative" }}>
              <User
                size={17}
                color="#c13584"
                style={{
                  position: "absolute",
                  left: "13px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                }}
              />
              <input
                type="text"
                name="accountName"
                value={formData.accountName}
                onChange={handleChange}
                placeholder="e.g., My Personal Account"
                disabled={isLoading}
                style={{
                  ...inputBase,
                  border: `2px solid ${errors.accountName ? "#ef4444" : "#f0b3d6"}`,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#c13584";
                  e.target.style.boxShadow = "0 0 0 3px rgba(193,53,132,0.12)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.accountName
                    ? "#ef4444"
                    : "#f0b3d6";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
            {errors.accountName && (
              <p
                style={{
                  color: "#dc2626",
                  fontSize: "12px",
                  marginTop: "6px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <AlertCircle size={13} />
                {errors.accountName}
              </p>
            )}
          </div>

          {/* Profile URL */}
          <div style={{ marginBottom: "24px" }}>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 700,
                color: "#374151",
                marginBottom: "8px",
              }}
            >
              Instagram Profile URL <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <div style={{ position: "relative" }}>
              <LinkIcon
                size={17}
                color="#c13584"
                style={{
                  position: "absolute",
                  left: "13px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  pointerEvents: "none",
                }}
              />
              <input
                type="url"
                name="profileUrl"
                value={formData.profileUrl}
                onChange={handleChange}
                placeholder="https://instagram.com/username"
                disabled={isLoading}
                style={{
                  ...inputBase,
                  border: `2px solid ${errors.profileUrl ? "#ef4444" : "#f0b3d6"}`,
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#c13584";
                  e.target.style.boxShadow = "0 0 0 3px rgba(193,53,132,0.12)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.profileUrl
                    ? "#ef4444"
                    : "#f0b3d6";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
            {errors.profileUrl && (
              <p
                style={{
                  color: "#dc2626",
                  fontSize: "12px",
                  marginTop: "6px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <AlertCircle size={13} />
                {errors.profileUrl}
              </p>
            )}
            <p style={{ color: "#94a3b8", fontSize: "11px", marginTop: "6px" }}>
              Example: https://instagram.com/username or
              https://www.instagram.com/profile.php?id=12345
            </p>
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              style={{
                flex: 1,
                padding: "13px",
                border: "2px solid #f0b3d6",
                borderRadius: "12px",
                color: "#c13584",
                fontWeight: 600,
                fontSize: "14px",
                background: "white",
                cursor: "pointer",
                fontFamily: "Sora, sans-serif",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#fdf2f8")
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = "white")}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || remainingSlots === 0}
              style={{
                flex: 1,
                padding: "13px",
                borderRadius: "12px",
                fontWeight: 700,
                fontSize: "14px",
                color: "white",
                border: "none",
                cursor:
                  isLoading || remainingSlots === 0 ? "not-allowed" : "pointer",
                background:
                  isLoading || remainingSlots === 0
                    ? "linear-gradient(135deg, #d1b3c8, #e8b3c8)"
                    : "linear-gradient(135deg, #833ab4, #c13584, #fd1d1d)",
                boxShadow:
                  isLoading || remainingSlots === 0
                    ? "none"
                    : "0 4px 16px rgba(193,53,132,0.35)",
                fontFamily: "Sora, sans-serif",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                transition: "all 0.2s",
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Adding…
                </>
              ) : (
                "Add Account"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN MANAGER COMPONENT
═══════════════════════════════════════════════════════════ */
export default function InstagramAccountsManager() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    remainingSlots: 20,
  });

  const { user } = useAuth();

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/api/instagram-accounts");
      if (response.data.success) {
        setAccounts(response.data.data);
        const activeCount = response.data.data.filter(
          (acc) => acc.isActive,
        ).length;
        setStats({
          total: response.data.total,
          active: activeCount,
          remainingSlots: response.data.remainingSlots,
        });
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to load Instagram accounts",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccount = async (accountData) => {
    try {
      const response = await api.post("/api/instagram-accounts", accountData);
      if (response.data.success) {
        setSuccess("Instagram account added successfully!");
        await fetchAccounts();
        setTimeout(() => setSuccess(null), 5000);
      }
    } catch (err) {
      throw new Error(err.response?.data?.message || "Failed to add account");
    }
  };

  const handleUpdateAccount = async (accountId, accountData) => {
    try {
      const response = await api.put(
        `/api/instagram-accounts/${accountId}`,
        accountData,
      );
      if (response.data.success) {
        setSuccess("Account updated successfully!");
        fetchAccounts();
        setShowEditModal(false);
        setSelectedAccount(null);
        setTimeout(() => setSuccess(null), 5000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update account");
      throw err;
    }
  };

  const handleDeleteAccount = async (accountId) => {
    if (!confirm("Are you sure you want to delete this Instagram account?"))
      return;
    try {
      const response = await api.delete(`/api/instagram-accounts/${accountId}`);
      if (response.data.success) {
        setSuccess("Account deleted successfully!");
        fetchAccounts();
        setTimeout(() => setSuccess(null), 5000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete account");
    }
  };

  const handleToggleStatus = async (accountId, currentStatus) => {
    try {
      const response = await api.patch(
        `/api/instagram-accounts/${accountId}/toggle-status`,
      );
      if (response.data.success) {
        setSuccess(
          `Account ${currentStatus ? "deactivated" : "activated"} successfully!`,
        );
        fetchAccounts();
        setTimeout(() => setSuccess(null), 3000);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to toggle account status",
      );
    }
  };

  const slotPercentage = ((20 - stats.remainingSlots) / 20) * 100;

  /* ── Loading state ── */
  if (loading) {
    return (
      <>
        <style>{`@keyframes igSpin { to { transform: rotate(360deg); } }`}</style>
        <div
          style={{
            minHeight: "260px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "white",
            borderRadius: "22px",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                position: "relative",
                width: "60px",
                height: "60px",
                margin: "0 auto 16px",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  border: "4px solid #fce7f3",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  border: "4px solid transparent",
                  borderTopColor: "#c13584",
                  animation: "igSpin 0.85s linear infinite",
                }}
              />
            </div>
            <p
              style={{
                color: "#94a3b8",
                fontSize: "13px",
                fontWeight: 500,
                fontFamily: "Sora, sans-serif",
              }}
            >
              Loading accounts…
            </p>
          </div>
        </div>
      </>
    );
  }

  /* ── Main render ── */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');

        .ig-wrap, .ig-wrap * {
          font-family: 'Sora', sans-serif;
          box-sizing: border-box;
        }

        /* Instagram animated gradient */
        .ig-hero {
          background: linear-gradient(
            135deg,
            #833ab4 0%,
            #c13584 28%,
            #e1306c 50%,
            #fd1d1d 72%,
            #f77737 88%,
            #fcaf45 100%
          );
          background-size: 200% 200%;
          animation: igHero 8s ease infinite;
        }
        @keyframes igHero {
          0%,100% { background-position: 0% 50%; }
          50%      { background-position: 100% 50%; }
        }

        /* Stat glass cards */
        .ig-stat {
          background: rgba(255,255,255,0.14);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.22);
          border-radius: 16px;
          padding: 16px;
          transition: background 0.2s;
        }
        .ig-stat:hover { background: rgba(255,255,255,0.22); }

        /* Add button */
        .ig-add-btn {
          background: white;
          color: #c13584;
          border: none;
          padding: 10px 20px;
          border-radius: 12px;
          font-weight: 700;
          font-size: 14px;
          font-family: 'Sora', sans-serif;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 12px rgba(0,0,0,0.14);
          flex-shrink: 0;
        }
        .ig-add-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 22px rgba(0,0,0,0.2);
        }
        .ig-add-btn:disabled {
          background: rgba(255,255,255,0.28);
          color: rgba(255,255,255,0.55);
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }

        /* Progress bar */
        .ig-prog-track {
          height: 6px;
          background: rgba(255,255,255,0.22);
          border-radius: 99px;
          overflow: hidden;
          margin-top: 8px;
        }
        .ig-prog-fill {
          height: 100%;
          background: white;
          border-radius: 99px;
          transition: width 0.6s cubic-bezier(0.4,0,0.2,1);
        }

        /* Account card */
        .ig-card {
          background: white;
          border-radius: 20px;
          border: 1.5px solid #f0e6f6;
          transition: all 0.28s cubic-bezier(0.4,0,0.2,1);
          position: relative;
          overflow: hidden;
        }
        .ig-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, transparent 60%, rgba(193,53,132,0.04));
          pointer-events: none;
        }
        .ig-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(193,53,132,0.15);
          border-color: #f0b3d6;
        }
        .ig-card-on {
          border-color: #22c55e !important;
          background: linear-gradient(135deg, #f0fdf4, #ffffff) !important;
        }
        .ig-card-on::before {
          background: linear-gradient(135deg, transparent 60%, rgba(34,197,94,0.04)) !important;
        }

        /* Badge */
        .ig-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 10px;
          border-radius: 99px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.03em;
        }

        /* Icon button */
        .ig-icon-btn {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .ig-icon-btn:hover { transform: translateY(-1px); opacity: 0.85; }

        /* Alert bar */
        .ig-alert {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 20px;
          border-radius: 14px;
          margin: 14px 24px;
          font-size: 13px;
          font-weight: 500;
          animation: igAlertIn 0.3s ease;
        }
        @keyframes igAlertIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Empty state */
        .ig-empty {
          text-align: center;
          padding: 60px 24px;
          background: linear-gradient(135deg, #fdf2f8, #fef3f2);
          border-radius: 18px;
          border: 2px dashed #f0b3d6;
        }

        @media (max-width: 640px) {
          .ig-stats-grid { grid-template-columns: repeat(3,1fr) !important; gap: 10px !important; }
          .ig-card-body { flex-direction: column !important; }
          .ig-meta-row  { flex-direction: column !important; gap: 4px !important; }
        }
      `}</style>

      <div
        className="ig-wrap"
        style={{
          background: "white",
          borderRadius: "22px",
          overflow: "hidden",
          boxShadow: "0 4px 28px rgba(0,0,0,0.09)",
          border: "1px solid #f0e6f6",
        }}
      >
        {/* ══════════════ HERO HEADER ══════════════ */}
        <div
          className="ig-hero"
          style={{
            position: "relative",
            overflow: "hidden",
            padding: "28px 32px",
          }}
        >
          {/* Decorative shapes */}
          <div
            style={{
              position: "absolute",
              top: "-70px",
              right: "-70px",
              width: "220px",
              height: "220px",
              background: "rgba(255,255,255,0.07)",
              borderRadius: "50%",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-50px",
              left: "35%",
              width: "140px",
              height: "140px",
              background: "rgba(255,255,255,0.05)",
              borderRadius: "50%",
            }}
          />
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: i % 2 === 0 ? "7px" : "4px",
                height: i % 2 === 0 ? "7px" : "4px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.18)",
                top: `${12 + (i % 4) * 22}%`,
                right: `${6 + Math.floor(i / 4) * 11}%`,
              }}
            />
          ))}

          <div style={{ position: "relative", zIndex: 1 }}>
            {/* Title + Add button */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: "16px",
                flexWrap: "wrap",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "16px" }}
              >
                <div
                  style={{
                    width: "58px",
                    height: "58px",
                    background: "rgba(255,255,255,0.18)",
                    backdropFilter: "blur(10px)",
                    borderRadius: "18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid rgba(255,255,255,0.3)",
                    flexShrink: 0,
                  }}
                >
                  <Instagram color="white" size={28} />
                </div>
                <div>
                  <h2
                    style={{
                      fontSize: "22px",
                      fontWeight: 800,
                      color: "white",
                      margin: 0,
                      lineHeight: 1.2,
                    }}
                  >
                    Instagram Accounts
                  </h2>
                  <p
                    style={{
                      color: "rgba(255,255,255,0.72)",
                      fontSize: "13px",
                      margin: "5px 0 0",
                      fontWeight: 400,
                    }}
                  >
                    Manage accounts linked to your tasks
                  </p>
                </div>
              </div>

              <button
                className="ig-add-btn"
                onClick={() => setShowAddModal(true)}
                disabled={stats.remainingSlots === 0}
              >
                <Plus size={16} />
                Add Account
              </button>
            </div>

            {/* Stats */}
            <div
              className="ig-stats-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: "14px",
                marginTop: "24px",
              }}
            >
              {[
                {
                  label: "Total",
                  val: stats.total,
                  sub: "accounts",
                  prog: false,
                },
                {
                  label: "Active",
                  val: stats.active,
                  sub: "running",
                  prog: false,
                },
                {
                  label: "Slots",
                  val: stats.remainingSlots,
                  sub: null,
                  prog: true,
                },
              ].map(({ label, val, sub, prog }) => (
                <div className="ig-stat" key={label}>
                  <p
                    style={{
                      color: "rgba(255,255,255,0.65)",
                      fontSize: "10px",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.07em",
                      margin: 0,
                    }}
                  >
                    {label}
                  </p>
                  <p
                    style={{
                      color: "white",
                      fontSize: "30px",
                      fontWeight: 800,
                      margin: "4px 0 0",
                      lineHeight: 1,
                    }}
                  >
                    {val}
                  </p>
                  {sub && (
                    <p
                      style={{
                        color: "rgba(255,255,255,0.5)",
                        fontSize: "11px",
                        margin: "2px 0 0",
                      }}
                    >
                      {sub}
                    </p>
                  )}
                  {prog && (
                    <div className="ig-prog-track">
                      <div
                        className="ig-prog-fill"
                        style={{ width: `${slotPercentage}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════════ NOTIFICATIONS ══════════════ */}
        {error && (
          <div
            className="ig-alert"
            style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#dc2626",
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1 }}>{error}</span>
            <button
              onClick={() => setError(null)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#dc2626",
                padding: 0,
                display: "flex",
              }}
            >
              <XCircle size={18} />
            </button>
          </div>
        )}
        {success && (
          <div
            className="ig-alert"
            style={{
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              color: "#16a34a",
            }}
          >
            <CheckCircle size={18} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1 }}>{success}</span>
            <button
              onClick={() => setSuccess(null)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#16a34a",
                padding: 0,
                display: "flex",
              }}
            >
              <XCircle size={18} />
            </button>
          </div>
        )}

        {/* ══════════════ ACCOUNT LIST ══════════════ */}
        <div style={{ padding: "20px 24px 28px" }}>
          {accounts.length === 0 ? (
            /* Empty state */
            <div className="ig-empty">
              <div
                style={{
                  width: "76px",
                  height: "76px",
                  background:
                    "linear-gradient(135deg, #833ab4, #c13584, #fd1d1d, #fcaf45)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 18px",
                  boxShadow: "0 8px 24px rgba(193,53,132,0.32)",
                }}
              >
                <Instagram color="white" size={34} />
              </div>
              <h3
                style={{
                  fontSize: "19px",
                  fontWeight: 700,
                  color: "#1e293b",
                  margin: "0 0 10px",
                }}
              >
                No Instagram Accounts Yet
              </h3>
              <p
                style={{
                  color: "#64748b",
                  fontSize: "14px",
                  margin: "0 auto 26px",
                  maxWidth: "290px",
                  lineHeight: 1.6,
                }}
              >
                Add your first Instagram account to start completing tasks and
                earning rewards.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "13px 28px",
                  background:
                    "linear-gradient(135deg, #833ab4, #c13584, #fd1d1d)",
                  color: "white",
                  border: "none",
                  borderRadius: "14px",
                  fontWeight: 700,
                  fontSize: "14px",
                  cursor: "pointer",
                  boxShadow: "0 6px 20px rgba(193,53,132,0.38)",
                  fontFamily: "Sora, sans-serif",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.transform = "translateY(-2px)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.transform = "translateY(0)")
                }
              >
                <Plus size={18} />
                Add Your First Account
              </button>
            </div>
          ) : (
            /* Account cards */
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {accounts.map((account) => (
                <div
                  key={account._id}
                  className={`ig-card ${account.isActive ? "ig-card-on" : ""}`}
                  style={{ padding: "18px 20px" }}
                >
                  <div
                    className="ig-card-body"
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "14px",
                    }}
                  >
                    {/* Avatar circle */}
                    <div
                      style={{
                        width: "46px",
                        height: "46px",
                        borderRadius: "50%",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: account.isActive
                          ? "linear-gradient(135deg, #dcfce7, #bbf7d0)"
                          : "linear-gradient(135deg, #fdf2f8, #fce7f3)",
                      }}
                    >
                      <Instagram
                        size={21}
                        color={account.isActive ? "#16a34a" : "#c13584"}
                      />
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Name row */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          flexWrap: "wrap",
                          marginBottom: "6px",
                        }}
                      >
                        <h4
                          style={{
                            fontWeight: 700,
                            fontSize: "15px",
                            color: "#0f172a",
                            margin: 0,
                          }}
                        >
                          {account.accountName}
                        </h4>
                        {account.isVerified && (
                          <span
                            className="ig-badge"
                            style={{
                              background:
                                "linear-gradient(90deg,#f3e8ff,#fce7f3)",
                              color: "#9333ea",
                            }}
                          >
                            <Shield size={10} />
                            Verified
                          </span>
                        )}
                        <span
                          className="ig-badge"
                          style={{
                            background: account.isActive
                              ? "#dcfce7"
                              : "#fdf2f8",
                            color: account.isActive ? "#15803d" : "#c13584",
                          }}
                        >
                          <span
                            style={{
                              width: "5px",
                              height: "5px",
                              borderRadius: "50%",
                              background: account.isActive
                                ? "#22c55e"
                                : "#c13584",
                              display: "inline-block",
                            }}
                          />
                          {account.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>

                      {/* Profile URL */}
                      <a
                        href={account.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          color: "#c13584",
                          fontSize: "12px",
                          fontWeight: 500,
                          textDecoration: "none",
                          maxWidth: "100%",
                        }}
                      >
                        <LinkIcon size={11} />
                        <span
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: "260px",
                          }}
                        >
                          {account.profileUrl}
                        </span>
                        <ExternalLink size={10} />
                      </a>

                      {/* Meta row */}
                      <div
                        className="ig-meta-row"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "18px",
                          marginTop: "10px",
                          flexWrap: "wrap",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                          }}
                        >
                          <div
                            style={{
                              width: "5px",
                              height: "5px",
                              borderRadius: "50%",
                              background: "#e2e8f0",
                            }}
                          />
                          <span style={{ fontSize: "12px", color: "#64748b" }}>
                            Last used:{" "}
                            <span style={{ color: "#334155", fontWeight: 600 }}>
                              {account.lastUsed
                                ? new Date(
                                    account.lastUsed,
                                  ).toLocaleDateString()
                                : "Never"}
                            </span>
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                          }}
                        >
                          <Zap size={12} color="#f59e0b" />
                          <span style={{ fontSize: "12px", color: "#64748b" }}>
                            <span style={{ color: "#334155", fontWeight: 600 }}>
                              {account.usageCount}
                            </span>{" "}
                            tasks
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "7px",
                        flexShrink: 0,
                      }}
                    >
                      {/* Toggle */}
                      <button
                        className="ig-icon-btn"
                        onClick={() =>
                          handleToggleStatus(account._id, account.isActive)
                        }
                        title={account.isActive ? "Deactivate" : "Activate"}
                        style={{
                          background: account.isActive ? "#dcfce7" : "#fdf2f8",
                          color: account.isActive ? "#16a34a" : "#c13584",
                        }}
                      >
                        {account.isActive ? (
                          <ToggleRight size={18} />
                        ) : (
                          <ToggleLeft size={18} />
                        )}
                      </button>

                      {/* Edit */}
                      <button
                        className="ig-icon-btn"
                        onClick={() => {
                          setSelectedAccount(account);
                          setShowEditModal(true);
                        }}
                        title="Edit"
                        style={{
                          background:
                            "linear-gradient(135deg, #f3e8ff, #fce7f3)",
                          color: "#9333ea",
                        }}
                      >
                        <Edit3 size={15} />
                      </button>

                      {/* Delete */}
                      <button
                        className="ig-icon-btn"
                        onClick={() => handleDeleteAccount(account._id)}
                        title="Delete"
                        style={{ background: "#fee2e2", color: "#dc2626" }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ══════════════ MODALS ══════════════ */}
        <InstagramAddAccountModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddAccount}
          remainingSlots={stats.remainingSlots}
        />
        <InstagramEditAccountModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedAccount(null);
          }}
          account={selectedAccount}
          onUpdate={handleUpdateAccount}
        />
      </div>
    </>
  );
}
