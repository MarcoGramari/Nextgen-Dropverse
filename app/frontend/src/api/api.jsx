import axios from "axios";

const API_BASE = (import.meta.env.VITE_API_BASE || "http://127.0.0.1:5000") + "/api";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 12000
});

// Attach token if available
api.interceptors.request.use((cfg) => {
  const t = localStorage.getItem("token");
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

export default api;
