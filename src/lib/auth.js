export const ACCESS_TOKEN_KEY = "niemr_superadmin_access";
export const REFRESH_TOKEN_KEY = "niemr_superadmin_refresh";

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens({ access, refresh }) {
  if (typeof window === "undefined") return;
  if (access) window.localStorage.setItem(ACCESS_TOKEN_KEY, access);
  if (refresh) window.localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}

// Backwards compat (old imports)
export const TOKEN_KEY = ACCESS_TOKEN_KEY;
export function getToken() { return getAccessToken(); }
export function setToken(token) { return setTokens({ access: token }); }
export function clearToken() { return clearTokens(); }
