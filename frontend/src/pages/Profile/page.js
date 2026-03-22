"use client";
import React, { useEffect, useState } from "react";
import {
  User,
  DollarSign,
  Menu,
  X,
  Home,
  Settings,
  LogOut,
  Bell,
  ChevronDown,
  Wallet,
  TrendingUp,
  Edit3,
  Camera,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Loader2,
  Facebook,
} from "lucide-react";
import { useAuth } from "@/Context/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { useSocket } from "@/Context/SocketContext";
import ProfileEditModal from "@/components/Profile/profileModel";
import FacebookAccountsManager from "@/components/FacebookAccounts/FacebookAccountsManager";
import InstagramAccountsManager from "@/components/InstagramAccounts/InstrgramAccountsManager";
import { Instagram } from "@/components/Icons";

export default function Profile() {
  const [earnings, setEarnings] = useState({
    totalEarned: 0,
    availableBalance: 0,
    pendingWithdrawal: 0,
    withdrawnAmount: 0,
  });
  const [withdrawAmount, setWithdrawAmount] = useState("500");
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");

  const { user, isAuthLoading, setUser, logout } = useAuth();
  const socket = useSocket();
  const router = useRouter();

  const formatCurrency = (value) => (value || 0).toFixed(2);

  const fetchEarnings = async () => {
    try {
      setIsFetching(true);
      setError(null);
      const response = await api.get("/api/earnings");
      if (response.data?.success) {
        setEarnings(
          response.data.data || {
            totalEarned: 0,
            availableBalance: 0,
            pendingWithdrawal: 0,
            withdrawnAmount: 0,
          },
        );
      } else {
        throw new Error(response.data?.message || "Invalid earnings data");
      }
    } catch (err) {
      setEarnings({
        totalEarned: 0,
        availableBalance: 0,
        pendingWithdrawal: 0,
        withdrawnAmount: 0,
      });
      if (err.response?.status !== 500) {
        setError(err.response?.data?.message || "Failed to load earnings");
      }
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (user?._id) fetchEarnings();
  }, [user?._id]);

  useEffect(() => {
    if (!socket || !user?._id) return;
    socket.emit("register", user._id);
    const handleEarningsUpdate = (updated) =>
      setEarnings((prev) => ({ ...prev, ...updated }));
    socket.on("earningsUpdate", handleEarningsUpdate);
    return () => {
      socket.off("earningsUpdate", handleEarningsUpdate);
    };
  }, [socket, user?._id]);

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);
    if (!amount || amount < 500) {
      setError("Minimum withdrawal amount is Rs 500");
      return;
    }
    if (amount > earnings.availableBalance) {
      setError("Amount exceeds available balance");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post("/api/earnings/withdraw", { amount });
      if (response.data.success) {
        setEarnings(response.data.earnings);
        setIsWithdrawModalOpen(false);
        setWithdrawAmount("500");
        setSuccess(
          `Withdrawal of Rs ${amount} processed successfully! Funds will be transferred to your bank account.`,
        );
        setTimeout(() => setSuccess(null), 8000);
      }
    } catch (error) {
      setError(error.response?.data?.message || "Withdrawal failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdateSuccess = (updatedUser) => {
    setUser(updatedUser);
    setSuccess("Profile updated successfully!");
    setTimeout(() => setSuccess(null), 5000);
  };

  const getProfileImageUrl = () => {
    if (user?.profilePicture?.url) return user.profilePicture.url;
    const initials = `${user?.firstName?.charAt(0) || ""}${user?.lastName?.charAt(0) || ""}`;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=3B82F6&color=ffffff&size=400`;
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  if (isAuthLoading || !user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background:
            "linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 50%, #f0f4ff 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              position: "relative",
              width: "64px",
              height: "64px",
              margin: "0 auto 16px",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                border: "4px solid #dbeafe",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: "50%",
                border: "4px solid #3b82f6",
                borderTopColor: "transparent",
                animation: "spin 0.8s linear infinite",
              }}
            />
          </div>
          <p
            style={{
              color: "#64748b",
              fontWeight: 600,
              fontFamily: "Sora, sans-serif",
            }}
          >
            Loading your profile…
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { key: "personal", label: "Personal Info", icon: null },
    {
      key: "facebook-accounts",
      label: "Facebook Accounts",
      icon: <Facebook size={14} />,
    },
    {
      key: "instagram-accounts",
      label: "Instagram Accounts",
      icon: <Instagram size={14} />,
    },
    { key: "earnings", label: "Earnings", icon: null },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
        .profile-root { font-family: 'Sora', sans-serif; }

        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeSlideUp {
          from { opacity:0; transform:translateY(16px); }
          to { opacity:1; transform:translateY(0); }
        }
        @keyframes shimmer {
          0%,100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .profile-bg {
          min-height: 100vh;
          background: #f8faff;
          background-image:
            radial-gradient(ellipse at 20% 10%, rgba(59,130,246,0.06) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 80%, rgba(99,102,241,0.05) 0%, transparent 60%);
        }

        .profile-header {
          background: white;
          border-bottom: 1px solid #e8edf5;
          position: sticky;
          top: 0;
          z-index: 40;
          box-shadow: 0 1px 20px rgba(0,0,0,0.05);
        }

        .profile-logo {
          width: 44px; height: 44px;
          background: linear-gradient(135deg, #3b82f6, #6366f1);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 12px rgba(59,130,246,0.3);
          flex-shrink: 0;
        }

        .profile-nav-link {
          display: flex; align-items: center; gap: 6px;
          color: #64748b; font-size: 14px; font-weight: 500;
          text-decoration: none;
          padding: 8px 12px;
          border-radius: 10px;
          transition: all 0.2s;
          font-family: 'Sora', sans-serif;
        }
        .profile-nav-link:hover { background: #f0f4ff; color: #3b82f6; }
        .profile-nav-link.active { background: #eff6ff; color: #2563eb; font-weight: 600; }

        .profile-tab-btn {
          padding: 16px 4px;
          border: none;
          background: none;
          border-bottom: 2px solid transparent;
          font-size: 14px;
          font-weight: 500;
          color: #94a3b8;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          white-space: nowrap;
          transition: all 0.2s;
          font-family: 'Sora', sans-serif;
        }
        .profile-tab-btn:hover { color: #475569; border-color: #cbd5e1; }
        .profile-tab-btn.active { color: #2563eb; border-color: #2563eb; font-weight: 600; }

        .profile-card {
          background: white;
          border-radius: 24px;
          border: 1px solid #e8edf5;
          overflow: hidden;
          box-shadow: 0 4px 24px rgba(0,0,0,0.06);
          animation: fadeSlideUp 0.4s ease;
        }

        .earnings-stat-card {
          border-radius: 18px;
          padding: 22px;
          position: relative;
          overflow: hidden;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .earnings-stat-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.1);
        }
        .earnings-stat-card::after {
          content:'';
          position:absolute;
          top:-20px; right:-20px;
          width:80px; height:80px;
          border-radius:50%;
          opacity:0.15;
        }

        .withdraw-btn {
          width: 100%;
          padding: 16px;
          border: none;
          border-radius: 16px;
          font-size: 16px;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: all 0.3s;
          font-family: 'Sora', sans-serif;
        }
        .withdraw-btn.enabled {
          background: linear-gradient(135deg, #16a34a, #059669);
          color: white;
          box-shadow: 0 6px 24px rgba(22,163,74,0.3);
        }
        .withdraw-btn.enabled:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 32px rgba(22,163,74,0.4);
        }
        .withdraw-btn.disabled {
          background: #f1f5f9;
          color: #94a3b8;
          cursor: not-allowed;
        }

        .rule-card {
          text-align: center;
          padding: 24px 16px;
          border-radius: 18px;
        }
        .rule-icon {
          width: 56px; height: 56px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 12px;
          font-size: 16px; font-weight: 800;
        }

        .modal-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          padding: 16px; z-index: 50;
          animation: fadeSlideUp 0.2s ease;
        }

        .modal-box {
          background: white;
          border-radius: 24px;
          max-width: 440px;
          width: 100%;
          overflow: hidden;
          box-shadow: 0 32px 80px rgba(0,0,0,0.25);
          animation: fadeSlideUp 0.3s ease;
        }

        .modal-input {
          width: 100%;
          padding: 14px 14px 14px 52px;
          border: 2px solid #e2e8f0;
          border-radius: 14px;
          font-size: 16px;
          font-weight: 600;
          outline: none;
          transition: border-color 0.2s;
          font-family: 'Sora', sans-serif;
          color: #0f172a;
        }
        .modal-input:focus { border-color: #3b82f6; }

        .profile-hero {
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #6366f1 100%);
          background-size: 200% 200%;
          animation: shimmer 6s ease infinite;
          padding: 36px 28px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .mobile-menu-panel {
          background: white;
          border-top: 1px solid #f1f5f9;
          padding: 16px 20px;
        }

        .notif-bar {
          display: flex; align-items: center; gap: 12px;
          padding: 14px 18px;
          border-radius: 14px;
          margin-bottom: 16px;
          font-size: 14px;
          font-weight: 500;
          animation: fadeSlideUp 0.3s ease;
          font-family: 'Sora', sans-serif;
        }

        @media (max-width: 768px) {
          .lg-grid { grid-template-columns: 1fr !important; }
          .lg-col-2 { grid-column: auto !important; }
          .hide-mobile { display: none !important; }
          .tabs-scroll { overflow-x: auto; }
          .tabs-scroll::-webkit-scrollbar { display: none; }
        }
      `}</style>

      <div className="profile-root profile-bg">
        {/* Header */}
        <header className="profile-header">
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            <div
              style={{
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
              }}
            >
              {/* Logo */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  flexShrink: 0,
                }}
              >
                <div className="profile-logo">
                  <Wallet color="white" size={22} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "20px",
                      fontWeight: 800,
                      background: "linear-gradient(135deg, #2563eb, #6366f1)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      lineHeight: 1.1,
                    }}
                  >
                    TaskPay
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#94a3b8",
                      fontWeight: 500,
                    }}
                  >
                    Earn & Withdraw
                  </div>
                </div>
              </div>

              {/* Desktop Nav */}
              <nav
                className="hide-mobile"
                style={{ display: "flex", alignItems: "center", gap: "4px" }}
              >
                <a href="/" className="profile-nav-link">
                  <Home size={16} />
                  <span>Dashboard</span>
                </a>
                <a href="/Profile/page" className="profile-nav-link active">
                  <User size={16} />
                  <span>Profile</span>
                </a>
                <a href="#" className="profile-nav-link">
                  <TrendingUp size={16} />
                  <span>Analytics</span>
                </a>
                <a href="#" className="profile-nav-link">
                  <Settings size={16} />
                  <span>Settings</span>
                </a>
              </nav>

              {/* Right side */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  flexShrink: 0,
                }}
              >
                <button
                  style={{
                    position: "relative",
                    width: "40px",
                    height: "40px",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "#64748b",
                    transition: "all 0.2s",
                  }}
                >
                  <Bell size={18} />
                  <span
                    style={{
                      position: "absolute",
                      top: "-2px",
                      right: "-2px",
                      width: "18px",
                      height: "18px",
                      background: "#ef4444",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "10px",
                      color: "white",
                      fontWeight: 700,
                    }}
                  >
                    3
                  </span>
                </button>

                <div
                  className="hide-mobile"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    background: "linear-gradient(135deg, #f8fafc, #eff6ff)",
                    border: "1px solid #e2e8f0",
                    borderRadius: "99px",
                    padding: "8px 16px 8px 8px",
                    cursor: "pointer",
                    transition: "box-shadow 0.2s",
                  }}
                >
                  <img
                    src={getProfileImageUrl()}
                    alt="Profile"
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "2px solid white",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  />
                  <div>
                    <p
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "#0f172a",
                        margin: 0,
                      }}
                    >
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p
                      style={{ fontSize: "11px", color: "#64748b", margin: 0 }}
                    >
                      Rs {formatCurrency(earnings.availableBalance)}
                    </p>
                  </div>
                  <ChevronDown size={14} color="#94a3b8" />
                </div>

                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  style={{
                    display: "none",
                    width: "40px",
                    height: "40px",
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: "#64748b",
                  }}
                  className="mobile-menu-btn"
                >
                  {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
              <div className="mobile-menu-panel">
                <nav
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  {[
                    { href: "/", icon: <Home size={18} />, label: "Dashboard" },
                    {
                      href: "#",
                      icon: <User size={18} />,
                      label: "Profile",
                      active: true,
                    },
                    {
                      href: "#",
                      icon: <TrendingUp size={18} />,
                      label: "Analytics",
                    },
                    {
                      href: "#",
                      icon: <Settings size={18} />,
                      label: "Settings",
                    },
                  ].map((item, i) => (
                    <a
                      key={i}
                      href={item.href}
                      className={`profile-nav-link ${item.active ? "active" : ""}`}
                      style={{ padding: "12px 14px" }}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </a>
                  ))}
                  <hr
                    style={{
                      border: "none",
                      borderTop: "1px solid #f1f5f9",
                      margin: "8px 0",
                    }}
                  />
                  <button
                    onClick={handleLogout}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "12px 14px",
                      background: "none",
                      border: "none",
                      borderRadius: "10px",
                      color: "#ef4444",
                      fontSize: "14px",
                      fontWeight: 500,
                      cursor: "pointer",
                      width: "100%",
                      fontFamily: "Sora, sans-serif",
                    }}
                  >
                    <LogOut size={18} />
                    <span>Sign Out</span>
                  </button>
                </nav>
              </div>
            )}

            {/* Tabs */}
            <div
              className="tabs-scroll"
              style={{ borderTop: "1px solid #f1f5f9", padding: "0 20px" }}
            >
              <div style={{ display: "flex", gap: "24px" }}>
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`profile-tab-btn ${activeTab === tab.key ? "active" : ""}`}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* Main */}
        <main
          style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 20px" }}
        >
          {/* Notifications */}
          {error && (
            <div
              className="notif-bar"
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
                <X size={16} />
              </button>
            </div>
          )}
          {success && (
            <div
              className="notif-bar"
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
                <X size={16} />
              </button>
            </div>
          )}

          {/* Page heading */}
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <h1
              style={{
                fontSize: "clamp(26px, 5vw, 36px)",
                fontWeight: 800,
                color: "#0f172a",
                margin: "0 0 8px",
              }}
            >
              Your Profile
            </h1>
            <p
              style={{
                fontSize: "15px",
                color: "#64748b",
                margin: 0,
                maxWidth: "520px",
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              Complete tasks, upload proof, earn rewards. Track your earnings
              and withdraw funds easily.
            </p>
          </div>

          {/* ── PERSONAL TAB ── */}
          {activeTab === "personal" && (
            <div
              className="lg-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 2fr",
                gap: "24px",
              }}
            >
              {/* Left: Profile Card */}
              <div className="profile-card" style={{ height: "fit-content" }}>
                <div className="profile-hero">
                  {/* Decorative blobs */}
                  <div
                    style={{
                      position: "absolute",
                      top: "-30px",
                      right: "-30px",
                      width: "120px",
                      height: "120px",
                      background: "rgba(255,255,255,0.08)",
                      borderRadius: "50%",
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      bottom: "-20px",
                      left: "-20px",
                      width: "80px",
                      height: "80px",
                      background: "rgba(255,255,255,0.05)",
                      borderRadius: "50%",
                    }}
                  />

                  <div style={{ position: "relative", zIndex: 1 }}>
                    <div
                      style={{
                        position: "relative",
                        display: "inline-block",
                        marginBottom: "16px",
                      }}
                    >
                      <div
                        style={{
                          width: "96px",
                          height: "96px",
                          borderRadius: "50%",
                          overflow: "hidden",
                          border: "4px solid rgba(255,255,255,0.4)",
                          boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
                          margin: "0 auto",
                        }}
                      >
                        <img
                          src={getProfileImageUrl()}
                          alt="Profile"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      </div>
                      <button
                        onClick={() => setIsEditModalOpen(true)}
                        style={{
                          position: "absolute",
                          bottom: 0,
                          right: 0,
                          width: "30px",
                          height: "30px",
                          background: "white",
                          border: "none",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#3b82f6",
                          cursor: "pointer",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                          transition: "transform 0.2s",
                        }}
                      >
                        <Camera size={14} />
                      </button>
                    </div>
                    <h2
                      style={{
                        fontSize: "20px",
                        fontWeight: 800,
                        color: "white",
                        margin: "0 0 4px",
                      }}
                    >
                      {user?.firstName} {user?.lastName}
                    </h2>
                    <p
                      style={{
                        color: "rgba(255,255,255,0.7)",
                        fontSize: "13px",
                        margin: 0,
                      }}
                    >
                      {user?.email}
                    </p>
                  </div>
                </div>

                <div style={{ padding: "24px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "20px",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "15px",
                        fontWeight: 700,
                        color: "#0f172a",
                        margin: 0,
                      }}
                    >
                      Personal Information
                    </h3>
                    <button
                      onClick={() => setIsEditModalOpen(true)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        color: "#2563eb",
                        fontSize: "13px",
                        fontWeight: 600,
                        background: "#eff6ff",
                        border: "none",
                        borderRadius: "8px",
                        padding: "6px 12px",
                        cursor: "pointer",
                        fontFamily: "Sora, sans-serif",
                        transition: "background 0.2s",
                      }}
                    >
                      <Edit3 size={13} />
                      <span>Edit</span>
                    </button>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "12px 14px",
                        background: "#f8fafc",
                        borderRadius: "12px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "13px",
                          color: "#64748b",
                          fontWeight: 500,
                        }}
                      >
                        Phone
                      </span>
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: 700,
                          color: "#0f172a",
                        }}
                      >
                        {user?.phoneNumber}
                      </span>
                    </div>

                    <div
                      style={{
                        padding: "14px",
                        background: "linear-gradient(135deg, #f0fdf4, #ecfdf5)",
                        borderRadius: "14px",
                        border: "1px solid #d1fae5",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "12px",
                          fontWeight: 700,
                          color: "#047857",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          margin: "0 0 10px",
                        }}
                      >
                        Bank Information
                      </p>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                        }}
                      >
                        {[
                          { label: "Bank", value: user?.bankName },
                          { label: "Branch", value: user?.bankBranch },
                          { label: "Account", value: user?.bankAccountNo },
                        ].map((item) => (
                          <div
                            key={item.label}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <span
                              style={{ fontSize: "12px", color: "#64748b" }}
                            >
                              {item.label}
                            </span>
                            <span
                              style={{
                                fontSize: "12px",
                                fontWeight: 700,
                                color: "#0f172a",
                                fontFamily: "monospace",
                              }}
                            >
                              {item.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Earnings */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                }}
              >
                <div className="profile-card">
                  <div
                    style={{
                      background:
                        "linear-gradient(135deg, #059669, #16a34a, #0d9488)",
                      backgroundSize: "200% 200%",
                      animation: "shimmer 6s ease infinite",
                      padding: "24px 28px",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: "-30px",
                        right: "-30px",
                        width: "130px",
                        height: "130px",
                        background: "rgba(255,255,255,0.05)",
                        borderRadius: "50%",
                      }}
                    />
                    <div style={{ position: "relative", zIndex: 1 }}>
                      <h2
                        style={{
                          fontSize: "20px",
                          fontWeight: 800,
                          color: "white",
                          margin: "0 0 4px",
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <DollarSign size={24} /> Your Earnings
                      </h2>
                      <p
                        style={{
                          color: "rgba(255,255,255,0.7)",
                          fontSize: "13px",
                          margin: 0,
                        }}
                      >
                        Track your progress and manage withdrawals
                      </p>
                    </div>
                  </div>

                  <div style={{ padding: "24px" }}>
                    {isFetching ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: "48px 0",
                        }}
                      >
                        <div style={{ textAlign: "center" }}>
                          <div
                            style={{
                              width: "44px",
                              height: "44px",
                              borderRadius: "50%",
                              border: "4px solid #dbeafe",
                              borderTopColor: "#3b82f6",
                              animation: "spin 0.8s linear infinite",
                              margin: "0 auto 12px",
                            }}
                          />
                          <p
                            style={{
                              color: "#64748b",
                              fontSize: "14px",
                              margin: 0,
                            }}
                          >
                            Loading earnings…
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(2, 1fr)",
                            gap: "14px",
                            marginBottom: "24px",
                          }}
                        >
                          {[
                            {
                              label: "Total Approved Tasks",
                              value: Math.round(earnings.totalEarned / 1.0),
                              sub: "Tasks completed",
                              bg: "linear-gradient(135deg, #eff6ff, #dbeafe)",
                              border: "#bfdbfe",
                              labelColor: "#1d4ed8",
                              valueColor: "#1e3a8a",
                            },
                            {
                              label: "Total Earned",
                              value: `Rs ${formatCurrency(earnings.totalEarned)}`,
                              sub: "Lifetime earnings",
                              bg: "linear-gradient(135deg, #faf5ff, #ede9fe)",
                              border: "#ddd6fe",
                              labelColor: "#7c3aed",
                              valueColor: "#4c1d95",
                            },
                            {
                              label: "Available Balance",
                              value: `Rs ${formatCurrency(earnings.availableBalance)}`,
                              sub: "Ready to withdraw",
                              bg: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
                              border: "#bbf7d0",
                              labelColor: "#15803d",
                              valueColor: "#14532d",
                            },
                            {
                              label: "Total Withdrawn",
                              value: `Rs ${formatCurrency(earnings.withdrawnAmount)}`,
                              sub: "Successfully withdrawn",
                              bg: "linear-gradient(135deg, #fffbeb, #fef3c7)",
                              border: "#fde68a",
                              labelColor: "#b45309",
                              valueColor: "#78350f",
                            },
                          ].map((stat, i) => (
                            <div
                              key={i}
                              className="earnings-stat-card"
                              style={{
                                background: stat.bg,
                                border: `1px solid ${stat.border}`,
                              }}
                            >
                              <p
                                style={{
                                  fontSize: "12px",
                                  fontWeight: 600,
                                  color: stat.labelColor,
                                  margin: "0 0 8px",
                                  lineHeight: 1.3,
                                }}
                              >
                                {stat.label}
                              </p>
                              <p
                                style={{
                                  fontSize: "24px",
                                  fontWeight: 800,
                                  color: stat.valueColor,
                                  margin: "0 0 4px",
                                  lineHeight: 1,
                                }}
                              >
                                {stat.value}
                              </p>
                              <p
                                style={{
                                  fontSize: "11px",
                                  color: stat.labelColor,
                                  margin: 0,
                                  opacity: 0.7,
                                }}
                              >
                                {stat.sub}
                              </p>
                            </div>
                          ))}
                        </div>

                        {earnings.pendingWithdrawal > 0 && (
                          <div
                            style={{
                              background:
                                "linear-gradient(135deg, #fffbeb, #fef3c7)",
                              border: "2px solid #fde68a",
                              borderRadius: "16px",
                              padding: "16px 18px",
                              marginBottom: "20px",
                              display: "flex",
                              alignItems: "center",
                              gap: "14px",
                            }}
                          >
                            <div
                              style={{
                                width: "10px",
                                height: "10px",
                                background: "#f59e0b",
                                borderRadius: "50%",
                                animation: "spin 2s linear infinite",
                                flexShrink: 0,
                              }}
                            />
                            <div>
                              <p
                                style={{
                                  fontSize: "13px",
                                  fontWeight: 700,
                                  color: "#92400e",
                                  margin: "0 0 2px",
                                }}
                              >
                                Pending Withdrawal
                              </p>
                              <p
                                style={{
                                  fontSize: "20px",
                                  fontWeight: 800,
                                  color: "#78350f",
                                  margin: "0 0 2px",
                                }}
                              >
                                Rs {formatCurrency(earnings.pendingWithdrawal)}
                              </p>
                              <p
                                style={{
                                  fontSize: "11px",
                                  color: "#b45309",
                                  margin: 0,
                                }}
                              >
                                Processing within 3–5 business days
                              </p>
                            </div>
                          </div>
                        )}

                        <button
                          onClick={() => {
                            setIsWithdrawModalOpen(true);
                            setError(null);
                          }}
                          disabled={earnings.availableBalance < 500}
                          className={`withdraw-btn ${earnings.availableBalance >= 500 ? "enabled" : "disabled"}`}
                        >
                          <DollarSign size={20} />
                          {earnings.availableBalance >= 500
                            ? "Withdraw Funds"
                            : "Insufficient Balance"}
                        </button>
                        {earnings.availableBalance < 500 && (
                          <p
                            style={{
                              textAlign: "center",
                              fontSize: "12px",
                              color: "#94a3b8",
                              marginTop: "8px",
                            }}
                          >
                            Minimum withdrawal amount is Rs 500
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Withdrawal Rules */}
                <div className="profile-card" style={{ padding: "24px" }}>
                  <h3
                    style={{
                      fontSize: "15px",
                      fontWeight: 700,
                      color: "#0f172a",
                      margin: "0 0 20px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        width: "28px",
                        height: "28px",
                        background: "#eff6ff",
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Settings size={14} color="#2563eb" />
                    </div>
                    Withdrawal Information
                  </h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: "12px",
                    }}
                  >
                    {[
                      {
                        value: "500",
                        label: "Minimum Amount",
                        sub: "Rs 500 minimum",
                        bg: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
                        iconBg: "#bbf7d0",
                        textColor: "#15803d",
                      },
                      {
                        value: "3-5",
                        label: "Processing Time",
                        sub: "Business days",
                        bg: "linear-gradient(135deg, #eff6ff, #dbeafe)",
                        iconBg: "#bfdbfe",
                        textColor: "#1d4ed8",
                      },
                      {
                        value: "0%",
                        label: "No Fees",
                        sub: "Free withdrawals",
                        bg: "linear-gradient(135deg, #faf5ff, #ede9fe)",
                        iconBg: "#ddd6fe",
                        textColor: "#7c3aed",
                      },
                    ].map((rule, i) => (
                      <div
                        key={i}
                        className="rule-card"
                        style={{ background: rule.bg }}
                      >
                        <div
                          className="rule-icon"
                          style={{ background: rule.iconBg }}
                        >
                          <span style={{ color: rule.textColor }}>
                            {rule.value}
                          </span>
                        </div>
                        <p
                          style={{
                            fontSize: "13px",
                            fontWeight: 700,
                            color: "#0f172a",
                            margin: "0 0 4px",
                          }}
                        >
                          {rule.label}
                        </p>
                        <p
                          style={{
                            fontSize: "11px",
                            color: "#64748b",
                            margin: 0,
                          }}
                        >
                          {rule.sub}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── FACEBOOK ACCOUNTS TAB ── */}
          {activeTab === "facebook-accounts" && <FacebookAccountsManager />}
          {/* ── INSTAGRAM ACCOUNTS TAB ── */}
          {activeTab === "instagram-accounts" && <InstagramAccountsManager />}

          {/* ── EARNINGS TAB ── */}
          {activeTab === "earnings" && (
            <div className="profile-card">
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #059669, #16a34a, #0d9488)",
                  backgroundSize: "200% 200%",
                  animation: "shimmer 6s ease infinite",
                  padding: "24px 28px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "-30px",
                    right: "-30px",
                    width: "130px",
                    height: "130px",
                    background: "rgba(255,255,255,0.05)",
                    borderRadius: "50%",
                  }}
                />
                <div style={{ position: "relative", zIndex: 1 }}>
                  <h2
                    style={{
                      fontSize: "20px",
                      fontWeight: 800,
                      color: "white",
                      margin: "0 0 4px",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <DollarSign size={24} /> Earnings History
                  </h2>
                  <p
                    style={{
                      color: "rgba(255,255,255,0.7)",
                      fontSize: "13px",
                      margin: 0,
                    }}
                  >
                    Detailed breakdown of your earnings
                  </p>
                </div>
              </div>

              <div style={{ padding: "24px" }}>
                {isFetching ? (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      padding: "48px 0",
                    }}
                  >
                    <div style={{ textAlign: "center" }}>
                      <div
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "50%",
                          border: "4px solid #dbeafe",
                          borderTopColor: "#3b82f6",
                          animation: "spin 0.8s linear infinite",
                          margin: "0 auto 12px",
                        }}
                      />
                      <p
                        style={{
                          color: "#64748b",
                          fontSize: "14px",
                          margin: 0,
                        }}
                      >
                        Loading earnings…
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: "12px",
                        marginBottom: "28px",
                      }}
                    >
                      {[
                        {
                          label: "Total Earned",
                          value: `Rs ${formatCurrency(earnings.totalEarned)}`,
                          bg: "#eff6ff",
                          color: "#1d4ed8",
                        },
                        {
                          label: "Available",
                          value: `Rs ${formatCurrency(earnings.availableBalance)}`,
                          bg: "#f0fdf4",
                          color: "#15803d",
                        },
                        {
                          label: "Pending",
                          value: `Rs ${formatCurrency(earnings.pendingWithdrawal)}`,
                          bg: "#fffbeb",
                          color: "#b45309",
                        },
                        {
                          label: "Withdrawn",
                          value: `Rs ${formatCurrency(earnings.withdrawnAmount)}`,
                          bg: "#faf5ff",
                          color: "#7c3aed",
                        },
                      ].map((item, i) => (
                        <div
                          key={i}
                          style={{
                            background: item.bg,
                            padding: "16px",
                            borderRadius: "14px",
                          }}
                        >
                          <p
                            style={{
                              fontSize: "12px",
                              color: item.color,
                              fontWeight: 600,
                              margin: "0 0 6px",
                            }}
                          >
                            {item.label}
                          </p>
                          <p
                            style={{
                              fontSize: "22px",
                              fontWeight: 800,
                              color: item.color,
                              margin: 0,
                            }}
                          >
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    <div
                      style={{
                        borderTop: "1px solid #f1f5f9",
                        paddingTop: "24px",
                      }}
                    >
                      <h3
                        style={{
                          fontSize: "15px",
                          fontWeight: 700,
                          color: "#0f172a",
                          margin: "0 0 16px",
                        }}
                      >
                        Recent Transactions
                      </h3>
                      <div
                        style={{
                          textAlign: "center",
                          padding: "40px 20px",
                          background: "#f8fafc",
                          borderRadius: "16px",
                        }}
                      >
                        <div
                          style={{
                            width: "48px",
                            height: "48px",
                            background: "#e2e8f0",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 12px",
                          }}
                        >
                          <TrendingUp size={22} color="#94a3b8" />
                        </div>
                        <p
                          style={{
                            color: "#94a3b8",
                            fontSize: "14px",
                            margin: 0,
                          }}
                        >
                          Your transaction history will appear here
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </main>

        {/* Withdraw Modal */}
        {isWithdrawModalOpen && (
          <div
            className="modal-overlay"
            onClick={(e) =>
              e.target === e.currentTarget && setIsWithdrawModalOpen(false)
            }
          >
            <div className="modal-box">
              <div
                style={{
                  background: "linear-gradient(135deg, #2563eb, #6366f1)",
                  padding: "24px 28px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: "-20px",
                    right: "-20px",
                    width: "100px",
                    height: "100px",
                    background: "rgba(255,255,255,0.08)",
                    borderRadius: "50%",
                  }}
                />
                <div style={{ position: "relative", zIndex: 1 }}>
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: 800,
                      color: "white",
                      margin: "0 0 4px",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <Wallet size={22} /> Withdraw Funds
                  </h3>
                  <p
                    style={{
                      color: "rgba(255,255,255,0.7)",
                      fontSize: "13px",
                      margin: 0,
                    }}
                  >
                    Request a withdrawal to your bank account
                  </p>
                </div>
              </div>

              <div style={{ padding: "24px" }}>
                {error && (
                  <div
                    style={{
                      background: "#fef2f2",
                      border: "1px solid #fecaca",
                      color: "#dc2626",
                      padding: "12px 14px",
                      borderRadius: "12px",
                      marginBottom: "20px",
                      fontSize: "14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <AlertCircle size={16} /> {error}
                  </div>
                )}

                <label
                  style={{
                    display: "block",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#374151",
                    marginBottom: "10px",
                  }}
                >
                  Amount to withdraw
                </label>
                <div style={{ position: "relative", marginBottom: "20px" }}>
                  <span
                    style={{
                      position: "absolute",
                      left: "16px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#64748b",
                      fontWeight: 700,
                      fontSize: "15px",
                    }}
                  >
                    Rs
                  </span>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    min="500"
                    max={earnings.availableBalance}
                    className="modal-input"
                    placeholder={`Max: Rs${formatCurrency(earnings.availableBalance)}`}
                    style={{ paddingLeft: "52px" }}
                  />
                </div>

                <div
                  style={{
                    background: "linear-gradient(135deg, #f8fafc, #eff6ff)",
                    border: "1px solid #e2e8f0",
                    borderRadius: "14px",
                    padding: "16px",
                    marginBottom: "24px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: "13px", color: "#64748b" }}>
                    Available balance
                  </span>
                  <span
                    style={{
                      fontSize: "20px",
                      fontWeight: 800,
                      color: "#0f172a",
                    }}
                  >
                    Rs {formatCurrency(earnings.availableBalance)}
                  </span>
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                  <button
                    onClick={() => {
                      setIsWithdrawModalOpen(false);
                      setError(null);
                      setWithdrawAmount("500");
                    }}
                    style={{
                      flex: 1,
                      padding: "14px",
                      border: "2px solid #e2e8f0",
                      borderRadius: "14px",
                      color: "#374151",
                      fontWeight: 600,
                      fontSize: "14px",
                      cursor: "pointer",
                      background: "white",
                      fontFamily: "Sora, sans-serif",
                      transition: "all 0.2s",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleWithdraw}
                    disabled={isLoading}
                    style={{
                      flex: 1,
                      padding: "14px",
                      border: "none",
                      borderRadius: "14px",
                      color: "white",
                      fontWeight: 700,
                      fontSize: "14px",
                      cursor: isLoading ? "not-allowed" : "pointer",
                      background: isLoading
                        ? "#93c5fd"
                        : "linear-gradient(135deg, #2563eb, #6366f1)",
                      fontFamily: "Sora, sans-serif",
                      transition: "all 0.3s",
                      boxShadow: isLoading
                        ? "none"
                        : "0 6px 20px rgba(37,99,235,0.3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                    }}
                  >
                    {isLoading ? (
                      <>
                        <div
                          style={{
                            width: "16px",
                            height: "16px",
                            borderRadius: "50%",
                            border: "2px solid white",
                            borderTopColor: "transparent",
                            animation: "spin 0.7s linear infinite",
                          }}
                        />
                        Processing…
                      </>
                    ) : (
                      "Request Withdrawal"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Profile Edit Modal */}
        <ProfileEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={user}
          onUpdateSuccess={handleProfileUpdateSuccess}
          apiBaseUrl="/api"
        />
      </div>
    </>
  );
}
