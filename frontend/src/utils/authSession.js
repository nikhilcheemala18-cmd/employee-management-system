const TOKEN_KEY = "token";
const ROLE_KEY = "authRole";
const ADMIN_SESSION_KEY = "adminSession";

const userKeyForRole = (role) => (role === "owner" ? "currentOwner" : "currentOperator");

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
  localStorage.removeItem("currentOwner");
  localStorage.removeItem("currentOperator");
  localStorage.removeItem(ADMIN_SESSION_KEY);
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ROLE_KEY, role);
  localStorage.setItem(userKeyForRole(role), JSON.stringify(user));
};

export const saveAdminSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem("currentOwner");
  localStorage.removeItem("currentOperator");
  localStorage.setItem(ROLE_KEY, "admin");
  localStorage.setItem(ADMIN_SESSION_KEY, "true");
};

export const clearAuthSession = () => {
  [TOKEN_KEY, ROLE_KEY, ADMIN_SESSION_KEY, "currentOwner", "currentOperator", "ownerState", "operatorState"].forEach((key) => localStorage.removeItem(key));
};

export const getAuthSession = (role) => {
  const storedRole = localStorage.getItem(ROLE_KEY);

  if (role === "admin") {
    return storedRole === "admin" && localStorage.getItem(ADMIN_SESSION_KEY) === "true" ? { role: "admin" } : null;
  }

  const token = localStorage.getItem(TOKEN_KEY);
  if (storedRole !== role || !token || tokenIsExpired(token)) {
    if (token && tokenIsExpired(token)) clearAuthSession();
    return null;
  }

  return { role, token, user: parseJson(localStorage.getItem(userKeyForRole(role))) };
};

export const getAuthToken = () => {
  const role = localStorage.getItem(ROLE_KEY);
  const session = role === "owner" || role === "operator" ? getAuthSession(role) : null;
  return session?.token || null;
};

export const getStoredRole = () => localStorage.getItem(ROLE_KEY);
