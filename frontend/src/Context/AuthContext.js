"use client";

import { createContext, useState, useEffect, useContext } from "react";
import { useRouter } from "next/navigation";
import {
  login as apiLogin,
  getProfile,
  register as apiRegister,
} from "@/lib/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("token");
      if (storedToken) {
        try {
          const userData = await getProfile();
          setUser(userData);
          setToken(storedToken);
        } catch (error) {
          console.error("Failed to authenticate with stored token:", error);
          localStorage.removeItem("token");
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials) => {
    try {
      const userData = await apiLogin(credentials);
      setUser({
        _id: userData._id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        bankName: userData.bankName,
        bankBranch: userData.bankBranch,
        bankAccountNo: userData.bankAccountNo,
      });
      setToken(userData.token);
      localStorage.setItem("token", userData.token);
      if (credentials.rememberMe) {
        localStorage.setItem("rememberMe", "true");
      }
      router.push("/");
      return userData;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await apiRegister(userData);
      // Automatically log in after registration
      if (response && response.success) {
        console.log("Registration successful, attempting login...");
        await login({
          email: userData.email,
          password: userData.password,
          rememberMe: true,
        });
      }
      router.push("/Profile/page");
      return response;
    } catch (error) {
      console.error("Registration failed:", error);
      const enhancedError = new Error(error.message);
      enhancedError.errorType = error.errorType;
      throw enhancedError;
    }
  };

  const adminLogin = async (credentials) => {
    try {
      const response = await api.post("/api/admin/login", credentials);
      localStorage.setItem("token", response.data.token);
      setUser(response.data.user);
      return response.data;
    } catch (error) {
      console.error("Admin login error:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("token");
    router.push("/Log-in/page");
  };

  return (
    <AuthContext.Provider
      value={{ user, token, login, logout, register, loading, adminLogin }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
