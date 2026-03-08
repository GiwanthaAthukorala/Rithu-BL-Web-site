import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://rithu-bl-web-site.vercel.app";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Add response interceptor to handle errors
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
          window.location.href = "/login";
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
  login: "/api/users/login", // Add /api prefix here
  register: "/api/users/register", // Add /api prefix here
  profile: "/api/users/profile", // Add /api prefix here
  submissions: "/api/submissions", // Add /api prefix here
  earnings: "/api/earnings",
  youtubeSubmission: "/api/youtubeSubmissions",
  fbReviews: "/api/fb-reviews",
  FacebookComments: "/api/fb-comments",
  instagram: "/api/instagram",
  Tiktok: "/api/tiktok",
  videos: "/api/videos",
  videoSessions: "/api/videos/session",
  // Password reset endpoints
  forgotPassword: "/api/auth/forgot-password",
  resetPassword: (token) => `/api/auth/reset-password/${token}`,
  verifyToken: (token) => `/api/auth/verify-token/${token}`,
};

// Or better yet, update all your API functions to use the endpoints object:
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

// Password Reset Functions - Using axios instead of fetch for consistency
export const forgotPassword = async (email) => {
  try {
    const response = await api.post(endpoints.forgotPassword, { email });
    return response.data;
  } catch (error) {
    console.error("Forgot password error:", error);

    // Extract error message from response
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
