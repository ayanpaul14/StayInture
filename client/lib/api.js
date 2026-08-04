const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("xid_token");
}

async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Something went wrong");
  }
  return data;
}

export const api = {
  // auth
 sendOtp: (email) => request("/auth/send-otp", { method: "POST", body: { email } }),
  verifyOtp: (email, code, name) =>
  request("/auth/verify-otp", { method: "POST", body: { email, code, name } }), 
  getMe: () => request("/auth/me", { auth: true }),
  updateMe: (payload) => request("/auth/me", { method: "PATCH", body: payload, auth: true }),
  switchRole: (role) =>
    request("/auth/switch-role", { method: "PATCH", body: { role }, auth: true }),
  
  // properties
  createProperty: (payload) =>
    request("/properties", { method: "POST", body: payload, auth: true }),
  getProperty: (id) => request(`/properties/${id}`),
  updateProperty: (id, payload) =>
    request(`/properties/${id}`, { method: "PATCH", body: payload, auth: true }),
  deleteProperty: (id) =>
    request(`/properties/${id}`, { method: "DELETE", auth: true }),
  getMyProperties: () => request("/properties/mine", { auth: true }),

  // search
  search: (params) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== "")
    ).toString();
    return request(`/search?${qs}`);
  },

  // conversations
  startConversation: (propertyId, message) =>
    request("/conversations", { method: "POST", body: { propertyId, message }, auth: true }),
  getMyConversations: () => request("/conversations", { auth: true }),
  sendMessage: (id, message) =>
    request(`/conversations/${id}/messages`, { method: "POST", body: { message }, auth: true }),
  updateVisit: (id, status, visitDate) =>
    request(`/conversations/${id}/visit`, {
      method: "PATCH",
      body: { status, visitDate },
      auth: true,
    }),
};

export function saveSession(token, user) {
  localStorage.setItem("xid_token", token);
  localStorage.setItem("xid_user", JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem("xid_token");
  localStorage.removeItem("xid_user");
}

export function loadSession() {
  if (typeof window === "undefined") return { token: null, user: null };
  const token = localStorage.getItem("xid_token");
  const userRaw = localStorage.getItem("xid_user");
  return { token, user: userRaw ? JSON.parse(userRaw) : null };
}
