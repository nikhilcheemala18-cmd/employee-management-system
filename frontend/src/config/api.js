import axios from "axios";
import { clearAuthSession, getAuthToken, getStoredRole } from "../utils/authSession";

const defaultApiBaseUrl = process.env.REACT_APP_API_BASE_URL || (process.env.NODE_ENV === "production" ? "" : "http://localhost:4000");
export const API_BASE_URL = defaultApiBaseUrl;

export const apiUrl = (path) => `${API_BASE_URL}${path}`;

export const authHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

axios.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if ([401, 403].includes(error.response?.status)) {
      const role = getStoredRole();
      const loginPath = role === "operator" ? "/operatorLogin" : role === "admin" ? "/adminLogin" : "/ownerLogin";
      clearAuthSession();

      if (window.location.pathname !== loginPath) {
        window.location.assign(loginPath);
      }
    }

    return Promise.reject(error);
  }
);
