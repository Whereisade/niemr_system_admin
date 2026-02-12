import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "@/lib/auth";

async function refreshAccessToken() {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  const res = await fetch(`/api/proxy/accounts/token/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!res.ok) return null;

  const data = await res.json().catch(() => null);
  const access =
    data?.access ||
    data?.token ||
    data?.jwt ||
    data?.tokens?.access ||
    null;

  if (!access) return null;

  setTokens({ access }); // keep existing refresh
  return access;
}

export async function apiFetch(path, opts = {}) {
  const method = (opts.method || "GET").toUpperCase();
  const headers = { ...(opts.headers || {}) };

  const isForm = opts.body instanceof FormData;
  // Only set JSON content-type when we actually have a body.
  // (Some endpoints like approve/unapprove are POSTs with an empty body.)
  if (!isForm && !headers["Content-Type"] && method !== "GET" && opts.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const access = getAccessToken();
  if (access) headers["Authorization"] = `Bearer ${access}`;

  const makeBody = () => {
    if (isForm) return opts.body;
    if (!opts.body) return undefined;
    if (typeof opts.body === "string") return opts.body;
    return JSON.stringify(opts.body);
  };

  const doFetch = async () => {
    const res = await fetch(`/api/proxy/${path}`, {
      ...opts,
      method,
      headers,
      body: makeBody(),
    });

    const contentType = res.headers.get("content-type") || "";
    let data = null;
    if (contentType.includes("application/json")) {
      data = await res.json().catch(() => null);
    } else {
      data = await res.text().catch(() => null);
    }

    if (!res.ok) {
      const msg = (data && (data.detail || data.message)) || `Request failed (${res.status})`;
      const err = new Error(msg);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  };

  try {
    return await doFetch();
  } catch (err) {
    // Auto-refresh once on 401
    if (err?.status === 401) {
      const newAccess = await refreshAccessToken();
      if (newAccess) {
        headers["Authorization"] = `Bearer ${newAccess}`;
        return await doFetch();
      }
      clearTokens();
    }
    throw err;
  }
}
