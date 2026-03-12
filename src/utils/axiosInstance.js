import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://192.168.1.14:3000/api/admin",
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

/* ================= REQUEST INTERCEPTOR ================= */
axiosInstance.interceptors.request.use(
  (config) => {
    const url = config.url || "";

    const publicRoutes = ["/login", "/forgot-password", "/reset-password"];
    const isPublicRoute = publicRoutes.some((route) => url.startsWith(route));

    if (!isPublicRoute) {
      let token = localStorage.getItem("admin_token");

      token = String(token || "")
        .replace(/^"|"$/g, "")
        .replace(/^Bearer\s+/i, "");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        delete config.headers.Authorization;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/* ================= RESPONSE INTERCEPTOR ================= */
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      localStorage.removeItem("adminUser");
      localStorage.removeItem("admin_token");
      window.dispatchEvent(new Event("authChanged"));
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;