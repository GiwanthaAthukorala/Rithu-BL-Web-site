import axios from "axios";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://rithu-bl-web-side.vercel.app/api";

const adminApi = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
adminApi.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("adminToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Handle auth errors
adminApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminUser");
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  },
);

// Add named exports
export const adminLogin = async (credentials) => {
  const response = await adminApi.post("/admin/login", credentials);
  return response.data;
};

export const adminLogout = async () => {
  const response = await adminApi.post("/admin/logout");
  return response.data;
};

export const getAdminStats = async () => {
  const response = await adminApi.get("/admin/stats");
  return response.data;
};

export const getAdminSubmissions = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await adminApi.get(`/admin/submissions?${params}`);
  return response.data;
};

export const updateSubmissionStatus = async (data) => {
  const response = await adminApi.put("/admin/submissions/status", data);
  return response.data;
};

export const deleteSubmission = async (platformType, submissionId) => {
  const response = await adminApi.delete(
    `/admin/submissions/${platformType}/${submissionId}`,
  );
  return response.data;
};

export const getSubmissionDetail = async (platformType, submissionId) => {
  const response = await adminApi.get(
    `/admin/submissions/${platformType}/${submissionId}`,
  );
  return response.data;
};

// Keep default export for backward compatibility
export default adminApi;
