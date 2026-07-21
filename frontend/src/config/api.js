export const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://ashrmservices.onrender.com";

export const apiUrl = (path) => `${API_BASE_URL}${path}`;

export const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});
