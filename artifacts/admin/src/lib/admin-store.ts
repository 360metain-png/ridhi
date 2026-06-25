import { useState, useEffect } from "react";

// Shared admin state stored in localStorage so both Admin Management
// and Agent Management pages stay in sync.

export interface SharedAdmin {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: "active" | "inactive" | "suspended";
  lastLogin: string;
  joinedAt: string;
  actionsToday: number;
  actionsTotal: number;
  city: string;
  permissions: Record<string, boolean>;
}

const STORAGE_KEY = "ridhi_admin_accounts";

const DEFAULT_ADMINS: SharedAdmin[] = [
  { id: "adm1", name: "Priya Sharma", email: "priya@ridhi.app", phone: "+91 XXXXX XXXXX", role: "Full Admin", status: "active", lastLogin: "1h ago", joinedAt: "Jan 2024", actionsToday: 12, actionsTotal: 3400, city: "Delhi", permissions: {} },
  { id: "adm2", name: "Rahul Mehta", email: "rahul@ridhi.app", phone: "+91 XXXXX XXXXX", role: "Full Admin", status: "active", lastLogin: "3h ago", joinedAt: "Feb 2024", actionsToday: 8, actionsTotal: 2100, city: "Mumbai", permissions: {} },
  { id: "adm3", name: "Neha Gupta", email: "neha@ridhi.app", phone: "+91 XXXXX XXXXX", role: "Creator Admin", status: "active", lastLogin: "5h ago", joinedAt: "Mar 2024", actionsToday: 5, actionsTotal: 980, city: "Bangalore", permissions: {} },
];

function load(): SharedAdmin[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [...DEFAULT_ADMINS];
}

function save(admins: SharedAdmin[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(admins));
  window.dispatchEvent(new Event("admin-store-change"));
}

export function getSharedAdmins(): SharedAdmin[] {
  return load();
}

export function setSharedAdmins(admins: SharedAdmin[]) {
  save(admins);
}

export function addSharedAdmin(admin: SharedAdmin) {
  const all = load();
  save([admin, ...all]);
}

export function updateSharedAdmin(id: string, patch: Partial<SharedAdmin>) {
  const all = load().map((a) => (a.id === id ? { ...a, ...patch } : a));
  save(all);
}

export function deleteSharedAdmin(id: string) {
  const all = load().filter((a) => a.id !== id);
  save(all);
}

export function getAgentAssignableAdmins(): { id: string; name: string; email: string; agentCount: number }[] {
  return load()
    .filter((a) => a.status === "active")
    .map((a) => ({ id: a.id, name: a.name, email: a.email, agentCount: 0 }));
}

// Hook to keep a React component in sync with localStorage changes
export function useSharedAdmins(): SharedAdmin[] {
  const [admins, setAdmins] = useState<SharedAdmin[]>(load());
  useEffect(() => {
    const refresh = () => setAdmins(load());
    window.addEventListener("admin-store-change", refresh);
    const timer = setInterval(refresh, 500); // fallback
    return () => { window.removeEventListener("admin-store-change", refresh); clearInterval(timer); };
  }, []);
  return admins;
}
