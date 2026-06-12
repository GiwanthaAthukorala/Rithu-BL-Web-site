"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Edit3,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Facebook,
  ExternalLink,
  User,
  Link as LinkIcon,
  ToggleLeft,
  ToggleRight,
  Zap,
  Shield,
} from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/Context/AuthContext";
import AddAccountModal from "./AddAccountModal";
import EditAccountModal from "./EditAccountModal";

export default function FacebookAccountsManager() {
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
      const response = await api.get("/api/facebook-accounts");
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
        err.response?.data?.message || "Failed to load Facebook accounts",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccount = async (accountData) => {
    try {
      const response = await api.post("/api/facebook-accounts", accountData);
      if (response.data.success) {
        setSuccess("Facebook account added successfully!");
        await fetchAccounts();
        setTimeout(() => setSuccess(null), 5000);
      }
    } catch (err) {
      console.error("Add account error:", err);
      const errorMessage =
        err.response?.data?.message || "Failed to add account";
      throw new Error(errorMessage);
    }
  };

  const handleUpdateAccount = async (accountId, accountData) => {
    try {
      const response = await api.put(
        `/api/facebook-accounts/${accountId}`,
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
    if (!confirm("Are you sure you want to delete this Facebook account?"))
      return;
    try {
      const response = await api.delete(`/api/facebook-accounts/${accountId}`);
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
        `/api/facebook-accounts/${accountId}/toggle-status`,
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

  if (loading) {
    return (
      <div className="min-h-64 flex items-center justify-center bg-white rounded-2xl">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-gray-500 text-sm font-medium tracking-wide">
            Loading accounts…
          </p>
        </div>
      </div>
    );
  }

  const slotPercentage = ((20 - stats.remainingSlots) / 20) * 100;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');

        .fb-manager * { font-family: 'Sora', sans-serif; }

        .fb-hero-bg {
          background: linear-gradient(135deg, #1877F2 0%, #0a5ac2 40%, #3b5998 70%, #1877F2 100%);
          background-size: 200% 200%;
          animation: heroShift 8s ease infinite;
        }
        @keyframes heroShift {
          0%,100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .fb-card {
          background: white;
          border-radius: 20px;
          border: 1px solid #e8edf5;
          transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
          position: relative;
          overflow: hidden;
        }
        .fb-card::before {
          content:'';
          position:absolute;
          inset:0;
          background: linear-gradient(135deg, transparent 60%, rgba(24,119,242,0.03));
          pointer-events:none;
        }
        .fb-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(24,119,242,0.12);
          border-color: #bbd0f8;
        }

        .fb-card-active {
          border-color: #22c55e !important;
          background: linear-gradient(135deg, #f0fdf4, #ffffff) !important;
        }
        .fb-card-active::before {
          background: linear-gradient(135deg, transparent 60%, rgba(34,197,94,0.04)) !important;
        }

        .fb-stat-card {
          background: rgba(255,255,255,0.12);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 16px;
          padding: 16px;
          transition: background 0.2s;
        }
        .fb-stat-card:hover { background: rgba(255,255,255,0.18); }

        .fb-btn-add {
          background: white;
          color: #1877F2;
          border: none;
          padding: 10px 20px;
          border-radius: 12px;
          font-weight: 600;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .fb-btn-add:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,0,0,0.15); }
        .fb-btn-add:disabled { background: rgba(255,255,255,0.3); color: rgba(255,255,255,0.6); cursor:not-allowed; transform:none; }

        .fb-progress-bar {
          height: 6px;
          background: rgba(255,255,255,0.2);
          border-radius: 99px;
          overflow: hidden;
          margin-top: 6px;
        }
        .fb-progress-fill {
          height: 100%;
          background: white;
          border-radius: 99px;
          transition: width 0.6s cubic-bezier(0.4,0,0.2,1);
        }

        .fb-icon-circle {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .fb-action-btn {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }

        .fb-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 3px 10px;
          border-radius: 99px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.03em;
        }

        .fb-empty-state {
          text-align: center;
          padding: 60px 20px;
          background: linear-gradient(135deg, #f8faff, #f0f4ff);
          border-radius: 16px;
          border: 2px dashed #c7d7f8;
        }

        .fb-alert {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 18px;
          border-radius: 14px;
          margin: 16px 24px;
          font-size: 14px;
          font-weight: 500;
          animation: slideDown 0.3s ease;
        }
        @keyframes slideDown {
          from { opacity:0; transform:translateY(-8px); }
          to { opacity:1; transform:translateY(0); }
        }

        .fb-grid-dot {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: rgba(255,255,255,0.15);
        }

        @media (max-width: 640px) {
          .fb-stats-grid { grid-template-columns: repeat(3, 1fr) !important; gap: 10px !important; }
          .fb-card-actions { flex-wrap: wrap; gap: 6px; }
          .fb-account-meta { flex-direction: column !important; gap: 4px !important; }
        }
      `}</style>

      <div className="fb-manager bg-white rounded-2xl overflow-hidden shadow-lg border border-gray-100">
        {/* Hero Header */}
        <div className="fb-hero-bg relative overflow-hidden p-6 sm:p-8">
          {/* Decorative dots */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="fb-grid-dot"
              style={{
                top: `${10 + (i % 4) * 25}%`,
                right: `${5 + Math.floor(i / 4) * 12}%`,
                opacity: 0.1 + (i % 3) * 0.08,
                width: i % 2 === 0 ? "8px" : "5px",
                height: i % 2 === 0 ? "8px" : "5px",
              }}
            />
          ))}

          {/* Large decorative circle */}
          <div
            style={{
              position: "absolute",
              top: "-60px",
              right: "-60px",
              width: "200px",
              height: "200px",
              background: "rgba(255,255,255,0.06)",
              borderRadius: "50%",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-40px",
              left: "30%",
              width: "120px",
              height: "120px",
              background: "rgba(255,255,255,0.04)",
              borderRadius: "50%",
            }}
          />

          <div className="relative z-10">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    background: "rgba(255,255,255,0.15)",
                    backdropFilter: "blur(8px)",
                    borderRadius: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid rgba(255,255,255,0.25)",
                    flexShrink: 0,
                  }}
                >
                  <Facebook color="white" size={26} />
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
                    Facebook Accounts
                  </h2>
                  <p
                    style={{
                      color: "rgba(255,255,255,0.7)",
                      fontSize: "13px",
                      margin: "4px 0 0",
                      fontWeight: 400,
                    }}
                  >
                    Manage accounts linked to your tasks
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                disabled={stats.remainingSlots === 0}
                className="fb-btn-add"
              >
                <Plus size={16} />
                <span>Add Account</span>
              </button>
            </div>

            {/* Stats */}
            <div
              className="fb-stats-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: "14px",
                marginTop: "24px",
              }}
            >
              <div className="fb-stat-card">
                <p
                  style={{
                    color: "rgba(255,255,255,0.65)",
                    fontSize: "11px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    margin: 0,
                  }}
                >
                  Total
                </p>
                <p
                  style={{
                    color: "white",
                    fontSize: "28px",
                    fontWeight: 800,
                    margin: "4px 0 0",
                    lineHeight: 1,
                  }}
                >
                  {stats.total}
                </p>
                <p
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    fontSize: "11px",
                    margin: "2px 0 0",
                  }}
                >
                  accounts
                </p>
              </div>
              <div className="fb-stat-card">
                <p
                  style={{
                    color: "rgba(255,255,255,0.65)",
                    fontSize: "11px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    margin: 0,
                  }}
                >
                  Active
                </p>
                <p
                  style={{
                    color: "white",
                    fontSize: "28px",
                    fontWeight: 800,
                    margin: "4px 0 0",
                    lineHeight: 1,
                  }}
                >
                  {stats.active}
                </p>
                <p
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    fontSize: "11px",
                    margin: "2px 0 0",
                  }}
                >
                  running
                </p>
              </div>
              <div className="fb-stat-card">
                <p
                  style={{
                    color: "rgba(255,255,255,0.65)",
                    fontSize: "11px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    margin: 0,
                  }}
                >
                  Slots
                </p>
                <p
                  style={{
                    color: "white",
                    fontSize: "28px",
                    fontWeight: 800,
                    margin: "4px 0 0",
                    lineHeight: 1,
                  }}
                >
                  {stats.remainingSlots}
                </p>
                <div className="fb-progress-bar">
                  <div
                    className="fb-progress-fill"
                    style={{ width: `${slotPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div
            className="fb-alert"
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
              }}
            >
              <XCircle size={18} />
            </button>
          </div>
        )}
        {success && (
          <div
            className="fb-alert"
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
              }}
            >
              <XCircle size={18} />
            </button>
          </div>
        )}

        {/* Accounts List */}
        <div style={{ padding: "20px 24px 24px" }}>
          {accounts.length === 0 ? (
            <div className="fb-empty-state">
              <div
                style={{
                  width: "72px",
                  height: "72px",
                  background: "linear-gradient(135deg, #dbeafe, #bfdbfe)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <Facebook color="#1877F2" size={32} />
              </div>
              <h3
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#1e293b",
                  margin: "0 0 8px",
                }}
              >
                No Facebook Accounts Yet
              </h3>
              <p
                style={{
                  color: "#64748b",
                  fontSize: "14px",
                  margin: "0 0 24px",
                  maxWidth: "280px",
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                Add your first Facebook account to start completing tasks and
                earning rewards.
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 24px",
                  background: "linear-gradient(135deg, #1877F2, #0a5ac2)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontWeight: 700,
                  fontSize: "14px",
                  cursor: "pointer",
                  boxShadow: "0 4px 16px rgba(24,119,242,0.3)",
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
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {accounts.map((account, idx) => (
                <div
                  key={account._id}
                  className={`fb-card ${account.isActive ? "fb-card-active" : ""}`}
                  style={{ padding: "18px 20px" }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "14px",
                    }}
                  >
                    {/* Avatar */}
                    <div
                      className="fb-icon-circle"
                      style={{
                        background: account.isActive
                          ? "linear-gradient(135deg, #dcfce7, #bbf7d0)"
                          : "linear-gradient(135deg, #f1f5f9, #e2e8f0)",
                      }}
                    >
                      <Facebook
                        size={20}
                        color={account.isActive ? "#16a34a" : "#94a3b8"}
                      />
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
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
                            className="fb-badge"
                            style={{ background: "#dbeafe", color: "#1d4ed8" }}
                          >
                            <Shield size={10} />
                            Verified
                          </span>
                        )}
                        <span
                          className="fb-badge"
                          style={{
                            background: account.isActive
                              ? "#dcfce7"
                              : "#f1f5f9",
                            color: account.isActive ? "#15803d" : "#64748b",
                          }}
                        >
                          <span
                            style={{
                              width: "5px",
                              height: "5px",
                              borderRadius: "50%",
                              background: account.isActive
                                ? "#22c55e"
                                : "#94a3b8",
                              display: "inline-block",
                            }}
                          />
                          {account.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <a
                        href={account.profileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          color: "#1877F2",
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
                            maxWidth: "240px",
                          }}
                        >
                          {account.profileUrl}
                        </span>
                        <ExternalLink size={10} />
                      </a>

                      <div
                        className="fb-account-meta"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "16px",
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
                              width: "6px",
                              height: "6px",
                              borderRadius: "50%",
                              background: "#cbd5e1",
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
                          <Zap size={11} color="#f59e0b" />
                          <span style={{ fontSize: "12px", color: "#64748b" }}>
                            <span style={{ color: "#334155", fontWeight: 600 }}>
                              {account.usageCount}
                            </span>{" "}
                            tasks
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div
                      className="fb-card-actions"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        flexShrink: 0,
                      }}
                    >
                      <button
                        onClick={() =>
                          handleToggleStatus(account._id, account.isActive)
                        }
                        title={account.isActive ? "Deactivate" : "Activate"}
                        className="fb-action-btn"
                        style={{
                          background: account.isActive ? "#dcfce7" : "#f1f5f9",
                          color: account.isActive ? "#16a34a" : "#94a3b8",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.opacity = "0.8")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.opacity = "1")
                        }
                      >
                        {account.isActive ? (
                          <ToggleRight size={18} />
                        ) : (
                          <ToggleLeft size={18} />
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setSelectedAccount(account);
                          setShowEditModal(true);
                        }}
                        title="Edit"
                        className="fb-action-btn"
                        style={{ background: "#dbeafe", color: "#1877F2" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.opacity = "0.8")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.opacity = "1")
                        }
                      >
                        <Edit3 size={16} />
                      </button>

                      <button
                        onClick={() => handleDeleteAccount(account._id)}
                        title="Delete"
                        className="fb-action-btn"
                        style={{ background: "#fee2e2", color: "#dc2626" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.opacity = "0.8")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.opacity = "1")
                        }
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modals */}
        <AddAccountModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddAccount}
          remainingSlots={stats.remainingSlots}
        />
        <EditAccountModal
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
