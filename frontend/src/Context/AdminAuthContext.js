"use client";
import { createContext, useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  adminLogin as apiAdminLogin,
  adminLogout as apiAdminLogout,
  getAdminStats,
} from "@/lib/adminApi";

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initializeAdminAuth = async () => {
      const storedUser = localStorage.getItem("adminUser");
      const storedToken = localStorage.getItem("adminToken");

      if (storedUser && storedToken) {
        try {
          // Verify token is still valid
          await getAdminStats();
          setAdminUser(JSON.parse(storedUser));
        } catch (error) {
          console.error("Token validation failed:", error);
          localStorage.removeItem("adminUser");
          localStorage.removeItem("adminToken");
        }
      }
      setLoading(false);
    };

    initializeAdminAuth();
  }, []);

  const adminLogin = async (credentials) => {
    try {
      const response = await apiAdminLogin(credentials);

      if (response.success) {
        setAdminUser(response.user);
        localStorage.setItem("adminToken", response.token);
        localStorage.setItem("adminUser", JSON.stringify(response.user));
        router.push("/admin/dashboard");
      }

      return response;
    } catch (error) {
      console.error("Admin login failed:", error);
      throw error;
    }
  };

  const adminLogout = async () => {
    try {
      await apiAdminLogout();
    } catch (error) {
      console.error("Admin logout error:", error);
    } finally {
      setAdminUser(null);
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      router.push("/admin/login");
    }
  };

  const isAuthenticated = () => {
    return !!adminUser && !!localStorage.getItem("adminToken");
  };

  const isSuperAdmin = () => {
    return adminUser?.role === "superadmin";
  };

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        adminLogin,
        adminLogout,
        isAuthenticated,
        isSuperAdmin,
        loading,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
};
