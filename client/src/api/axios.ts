import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";
console.log("📡 API Connection Point:", baseURL);

const api = axios.create({ baseURL });

api.interceptors.request.use((config) => {
  const raw = localStorage.getItem("auth");
  if (raw) {
    const { token } = JSON.parse(raw);
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
