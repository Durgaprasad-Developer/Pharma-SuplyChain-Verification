// src/api/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "http://127.0.0.1:5000/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
