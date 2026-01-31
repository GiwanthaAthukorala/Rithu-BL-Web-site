import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://rithu-bl-web-site.vercel.app/api";

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
  login: "/users/login",
  register: "/users/register",
  profile: "/users/profile",
  submissions: "/submissions", // Note: Changed from /submissions to /api/submissions
  earnings: "/earnings",
  youtubeSubmission: "/youtubeSubmissions",
  fbReviews: "/fb-reviews",
  FacebookComments: "/fb-comments",
  instagram: "/instagram",
  Tiktok: "/tiktok",
  videos: "/videos",
  videoSessions: "/videos/session",
};

export const register = async (userData) => {
  try {
    const response = await api.post("/api/users/register", userData);

    if (response.data.success) {
      return response.data;
    } else {
      // Handle specific backend validation errors
      const error = new Error(response.data.message || "Registration failed");
      error.errorType = response.data.errorType;
      throw error;
    }
  } catch (error) {
    console.error("Registration error:", error.response?.data || error.message);

    // Enhance error with server response if available
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
    const response = await api.post("/api/users/login", credentials);
    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const getProfile = async () => {
  try {
    const response = await api.get("/api/users/profile");
    return response.data;
  } catch (error) {
    console.error("Profile error:", error);
    throw error;
  }
};

export default api;
