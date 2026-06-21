/**
 * Server-verified admin auth context.
 *
 * On mount, calls /api/admin/me to confirm the stored JWT is valid.
 * Provides `setAuthenticated` so the login page can update state without
 * requiring a page reload after a successful credential check.
 *
 * Role is stored in context from the server response — never trusted from
 * localStorage directly — so a client-side localStorage tamper cannot
 * escalate an authenticated user's role.
 */

import { createContext, useContext, useEffect, useState } from "react";
import { verifyAdminToken, clearAdminSession, saveAdminSession } from "./admin-api";

export type AdminRole = "admin" | "super_admin";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface AdminAuthContextValue {
  status: AuthStatus;
  role: AdminRole | null;
  setAuthenticated: (token: string, role: AdminRole, name: string) => void;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextValue>({
  status: "loading",
  role: null,
  setAuthenticated: () => {},
  logout: () => {},
});

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [role, setRole] = useState<AdminRole | null>(null);

  useEffect(() => {
    let cancelled = false;
    verifyAdminToken().then((result) => {
      if (cancelled) return;
      if (result) {
        setRole(result.role);
        setStatus("authenticated");
      } else {
        clearAdminSession();
        setRole(null);
        setStatus("unauthenticated");
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const setAuthenticated = (token: string, verifiedRole: AdminRole, name: string) => {
    saveAdminSession(token, verifiedRole, name);
    setRole(verifiedRole);
    setStatus("authenticated");
  };

  const logout = () => {
    clearAdminSession();
    setRole(null);
    setStatus("unauthenticated");
  };

  return (
    <AdminAuthContext.Provider value={{ status, role, setAuthenticated, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth(): AdminAuthContextValue {
  return useContext(AdminAuthContext);
}
