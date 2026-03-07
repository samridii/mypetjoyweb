import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050";

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach auth token to every request automatically
axiosInstance.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// If server returns 401, clear auth and redirect to login
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      document.cookie = "auth_token=; path=/; max-age=0";
      document.cookie = "user_data=; path=/; max-age=0";
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;