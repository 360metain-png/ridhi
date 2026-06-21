/**
 * Admin API client — connects to real backend auth
 * All admin endpoints use JWT Bearer token.
 */

const API_BASE = "/api";

function getToken(): string | null {
  return localStorage.getItem("ridhi_admin_token");
}

function getAuthHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function adminLogin(email: string, password: string): Promise<{
  success: boolean;
  token?: string;
  role?: "admin" | "super_admin";
  name?: string;
  error?: string;
}> {
  const res = await fetch(`${API_BASE}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!data.success) {
    return { success: false, error: data.error || "Login failed" };
  }
  return {
    success: true,
    token: data.token,
    role: data.admin?.role,
    name: data.admin?.name,
  };
}

export async function adminRefresh(): Promise<{
  success: boolean;
  token?: string;
  role?: "admin" | "super_admin";
  name?: string;
  error?: string;
}> {
  const res = await fetch(`${API_BASE}/admin/refresh`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!data.success) {
    return { success: false, error: data.error || "Session expired" };
  }
  return {
    success: true,
    token: data.token,
    role: data.admin?.role,
    name: data.admin?.name,
  };
}

export function getAdminRole(): "admin" | "super_admin" | null {
  return localStorage.getItem("ridhi_admin_role") as "admin" | "super_admin" | null;
}

export function getAdminName(): string | null {
  return localStorage.getItem("ridhi_admin_name");
}

export function isAdminLoggedIn(): boolean {
  return !!getToken() && !!getAdminRole();
}

/**
 * Verify the stored JWT token against the server.
 * Returns the verified role on success, or null if the token is absent,
 * expired, or rejected by the backend.
 */
export async function verifyAdminToken(): Promise<{
  role: "admin" | "super_admin";
  name: string;
} | null> {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await fetch(`${API_BASE}/admin/me`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.success || !data.admin?.role) return null;
    return { role: data.admin.role, name: data.admin.name ?? "" };
  } catch {
    return null;
  }
}

export function saveAdminSession(token: string, role: "admin" | "super_admin", name: string): void {
  localStorage.setItem("ridhi_admin_token", token);
  localStorage.setItem("ridhi_admin_role", role);
  localStorage.setItem("ridhi_admin_name", name);
}

export function clearAdminSession(): void {
  localStorage.removeItem("ridhi_admin_token");
  localStorage.removeItem("ridhi_admin_role");
  localStorage.removeItem("ridhi_admin_name");
}
