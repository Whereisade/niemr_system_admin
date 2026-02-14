export async function GET(req, { params }) {
  return proxy(req, params);
}
export async function POST(req, { params }) {
  return proxy(req, params);
}
export async function PATCH(req, { params }) {
  return proxy(req, params);
}
export async function PUT(req, { params }) {
  return proxy(req, params);
}
export async function DELETE(req, { params }) {
  return proxy(req, params);
}

async function proxy(req, params) {
  const base = (process.env.DJANGO_API_BASE_URL || "http://localhost:8000/api").replace(/\/+$/, "");
  const path = Array.isArray(params?.path) ? params.path.join("/") : "";
  const search = new URL(req.url).search || "";
  // DRF endpoints expect trailing slash; keep it stable for POST/PATCH/DELETE when APPEND_SLASH=True
  const urlObj = new URL(`${base}/${path}`.replace(/\/+$/, "/"));
  if (!urlObj.pathname.endsWith("/")) urlObj.pathname += "/";
  urlObj.search = search;
  const url = urlObj.toString();

  const headers = new Headers(req.headers);
  headers.delete("host");
  // Avoid forwarding content-length from the browser because we may not forward the body verbatim.
  // Keeping the old content-length can cause POSTs with empty bodies (e.g. approve/unapprove) to fail silently.
  headers.delete("content-length");
  // Let the platform handle compression between browser <-> Vercel.
  // Forwarding accept-encoding to the backend can lead to mismatched encoding/length headers.
  headers.delete("accept-encoding");
  headers.set("accept", "application/json");

  const init = {
    method: req.method,
    headers,
    redirect: "manual",
  };

  // Body only for non-GET/HEAD.
  // Use the raw bytes to preserve the exact payload (and avoid manufacturing "{}" for empty JSON POSTs).
  if (req.method !== "GET" && req.method !== "HEAD") {
    const buf = await req.arrayBuffer();
    if (buf && buf.byteLength) {
      init.body = buf;
    }
  }

  const res = await fetch(url, init);

  const resHeaders = new Headers(res.headers);
  // Avoid passing through encoding/length headers that may not match the proxied stream.
  resHeaders.delete("content-encoding");
  resHeaders.delete("content-length");
  resHeaders.delete("transfer-encoding");
  // Basic CORS-friendly header passthrough (client uses same-origin anyway)
  resHeaders.set("x-proxied-by", "nextjs");

  return new Response(res.body, { status: res.status, headers: resHeaders });
}
