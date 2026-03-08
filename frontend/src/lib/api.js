import axios from "axios";

// Make sure this points to your backend WITHOUT /api at the end
const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://rithu-bl-web-site.vercel.app";

// Create axios instance with /api base URL
const api = axios.create({
  baseURL: `${API_URL}/api`, // Add /api here
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Add request interceptor to handle errors
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Handle 401 Unauthorized
      if (error.response.status === 401) {
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          window.location.href = "/LoginPage/page";
        }
      }

      const errorMessage =
        error.response?.data?.message || error.message || "Request failed";
      return Promise.reject(new Error(errorMessage));
    }

    return Promise.reject(error);
  },
);

export const endpoints = {
  // Remove /api from these since baseURL already includes it
  login: "/users/login",
  register: "/users/register",
  profile: "/users/profile",
  submissions: "/submissions",
  earnings: "/earnings",
  youtubeSubmission: "/youtubeSubmissions",
  fbReviews: "/fb-reviews",
  FacebookComments: "/fb-comments",
  instagram: "/instagram",
  Tiktok: "/tiktok",
  videos: "/videos",
  videoSessions: "/videos/session",
  // Password reset endpoints - also without /api prefix
  forgotPassword: "/auth/forgot-password",
  resetPassword: (token) => `/auth/reset-password/${token}`,
  verifyToken: (token) => `/auth/verify-token/${token}`,
};

// Auth functions
export const register = async (userData) => {
  try {
    const response = await api.post(endpoints.register, userData);

    if (response.data.success) {
      return response.data;
    } else {
      const error = new Error(response.data.message || "Registration failed");
      error.errorType = response.data.errorType;
      throw error;
    }
  } catch (error) {
    console.error("Registration error:", error.response?.data || error.message);

    if (error.response?.data) {
      const serverError = new Error(
        error.response.data.message || "Registration failed",
      );
      serverError.errorType = error.response.data.errorType;
      throw serverError;
    }

    throw error;
  }
};

export const login = async (credentials) => {
  try {
    const response = await api.post(endpoints.login, credentials);

    // Store token if it exists
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
    }

    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const getProfile = async () => {
  try {
    const response = await api.get(endpoints.profile);
    return response.data;
  } catch (error) {
    console.error("Profile error:", error);
    throw error;
  }
};

// Password Reset Functions
export const forgotPassword = async (email) => {
  try {
    const response = await api.post(endpoints.forgotPassword, { email });
    return response.data;
  } catch (error) {
    console.error("Forgot password error:", error);

    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
};

export const resetPassword = async (token, passwords) => {
  try {
    const response = await api.put(endpoints.resetPassword(token), passwords);
    return response.data;
  } catch (error) {
    console.error("Reset password error:", error);

    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
};

export const verifyResetToken = async (token) => {
  try {
    const response = await api.get(endpoints.verifyToken(token));
    return response.data;
  } catch (error) {
    console.error("Verify token error:", error);

    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
};

export default api;
