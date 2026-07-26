const TOKEN_KEY = "token";
const ROLE_KEY = "authRole";

const SESSION_CACHE_KEYS = ["empList", "activeTab", "selectedEmployee"];

const userKeyForRole = (role) => {
  if (role === "owner") return "currentOwner";
  if (role === "operator") return "currentOperator";
  return "currentAdmin";
};

const parseJson = (value, fallback = {}) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

const tokenIsExpired = (token) => {
  try {
    const encodedPayload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(encodedPayload));
    return payload.exp ? payload.exp * 1000 <= Date.now() : false;
  } catch {
    return true;
  }
};

export const saveAuthSession = ({ role, token, user }) => {
  ["currentOwner", "currentOperator", "currentAdmin", ...SESSION_CACHE_KEYS].forEach((key) => localStorage.removeItem(key));
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ROLE_KEY, role);
  localStorage.setItem(userKeyForRole(role), JSON.stringify(user));
};

export const clearAuthSession = () => {
  [TOKEN_KEY, ROLE_KEY, "currentOwner", "currentOperator", "currentAdmin", "ownerState", "operatorState", ...SESSION_CACHE_KEYS].forEach((key) => localStorage.removeItem(key));
};

export const getAuthSession = (role) => {
  const storedRole = localStorage.getItem(ROLE_KEY);
  const token = localStorage.getItem(TOKEN_KEY);

  if (storedRole !== role || !token || tokenIsExpired(token)) {
    if (token && tokenIsExpired(token)) clearAuthSession();
    return null;
  }

  return { role, token, user: parseJson(localStorage.getItem(userKeyForRole(role))) };
};

export const getAuthToken = () => {
  const role = localStorage.getItem(ROLE_KEY);
  if (!role) return null;
  return getAuthSession(role)?.token || null;
};

export const getStoredRole = () => localStorage.getItem(ROLE_KEY);
