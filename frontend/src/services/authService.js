import axios from "axios";
import { API_BASE_URL, STORAGE_KEYS } from "../utils/constants";

const api = axios.create({ baseURL: API_BASE_URL });

// Attach token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Auth API calls ───────────────────────────────────────────────────────────

export const login = async (email, password) => {
  const { data } = await api.post("/auth/login", { email, password });
  localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
  return data;
};

export const signup = async (payload) => {
  // payload: { name, email, password, role }
  const { data } = await api.post("/auth/signup", payload);
  localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
  return data;
};

export const logout = () => {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
};

export const getProfile = async () => {
  const { data } = await api.get("/auth/me");
  return data;
};

export const updateProfile = async (payload) => {
  const { data } = await api.put("/auth/me", payload);
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));
  return data;
};

export const changePassword = async (currentPassword, newPassword) => {
  const { data } = await api.put("/auth/change-password", {
    currentPassword,
    newPassword,
  });
  return data;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER));
  } catch {
    return null;
  }
};

export const getStoredToken = () => localStorage.getItem(STORAGE_KEYS.TOKEN);

export const isAuthenticated = () => !!getStoredToken();