/**
 * Admin Authentication & Management
 *
 * Real backend auth for admin/super admin with:
 * - Password-based login (bcrypt-hashed)
 * - JWT token generation
 * - Role-based access control
 * - Admin CRUD (Super Admin only)
 * - SPOC chain assignment
 */

import { Router } from "express";
import { db } from "@workspace/db";
import { users } from "@workspace/db";
import { eq } from "drizzle-orm";
import { signAdminToken, signUserToken, requireAuth, requireSuperAdmin, requireAdminOrSuper, type AuthenticatedRequest } from "../lib/auth";
import { auditFromRequest } from "../lib/audit";
import { adminRateLimit } from "../lib/rateLimit";
import { logger } from "../lib/logger";
import bcrypt from "bcrypt";

const router = Router();

// In-memory admin store (until admin table is created in DB)
// Format: { id, email, passwordHash, name, role, adminId, status, permissions, createdAt }
const adminStore = new Map<string, AdminRecord>();

interface AdminRecord {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: "admin" | "super_admin";
  adminId: string; // for SPOC chain
  status: "active" | "suspended" | "inactive";
  permissions: string[];
  createdAt: string;
  lastLogin: string | null;
}

// Seed default Super Admin
const SA_PASSWORD = "Ridhi@2025";
const SA_EMAIL = "admin.sneha@ridhi.app";

// Initialize seed admin
async function seedAdmin() {
  const hash = await bcrypt.hash(SA_PASSWORD, 12);
  adminStore.set("adm-sa", {
    id: "adm-sa",
    email: SA_EMAIL,
    passwordHash: hash,
    name: "Sneha Sharma",
    role: "super_admin",
    adminId: "adm-sa",
    status: "active",
    permissions: ["*"],
    createdAt: new Date().toISOString(),
    lastLogin: null,
  });
}
seedAdmin();

// ── POST /api/admin/login ───────────────────────────────────────────────────

router.post("/admin/login", adminRateLimit, async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ success: false, error: "Email and password are required" });
    return;
  }

  // Find admin by email
  let admin: AdminRecord | null = null;
  for (const a of adminStore.values()) {
    if (a.email.toLowerCase() === email.toLowerCase()) {
      admin = a;
      break;
    }
  }

  if (!admin) {
    auditFromRequest(req, "admin_login_failed", email, "admin", { reason: "admin_not_found" });
    res.status(401).json({ success: false, error: "Invalid credentials" });
    return;
  }

  if (admin.status !== "active") {
    auditFromRequest(req, "admin_login_failed", admin.id, "admin", { reason: "account_suspended" });
    res.status(403).json({ success: false, error: "Account is suspended or inactive" });
    return;
  }

  // Verify password
  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    auditFromRequest(req, "admin_login_failed", admin.id, "admin", { reason: "wrong_password" });
    res.status(401).json({ success: false, error: "Invalid credentials" });
    return;
  }

  // Update last login
  admin.lastLogin = new Date().toISOString();

  // Generate JWT
  const token = signAdminToken(admin.id, admin.role, admin.adminId);

  auditFromRequest(req, "admin_login", admin.id, "admin", { role: admin.role });

  res.json({
    success: true,
    token,
    admin: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      adminId: admin.adminId,
      permissions: admin.permissions,
    },
  });
});

// ── POST /api/admin/create ── (Super Admin only) ───────────────────────────

router.post("/admin/create", requireSuperAdmin, adminRateLimit, async (req: AuthenticatedRequest, res) => {
  const { email, password, name, role, adminId } = req.body as {
    email?: string;
    password?: string;
    name?: string;
    role?: "admin" | "super_admin";
    adminId?: string;
  };

  if (!email || !password || !name || !role) {
    res.status(400).json({ success: false, error: "email, password, name, and role are required" });
    return;
  }

  if (role !== "admin" && role !== "super_admin") {
    res.status(400).json({ success: false, error: "role must be 'admin' or 'super_admin'" });
    return;
  }

  // Check email uniqueness
  for (const a of adminStore.values()) {
    if (a.email.toLowerCase() === email.toLowerCase()) {
      res.status(409).json({ success: false, error: "An admin with this email already exists" });
      return;
    }
  }

  const hash = await bcrypt.hash(password, 12);
  const id = `adm-${Date.now()}`;

  const admin: AdminRecord = {
    id,
    email,
    passwordHash: hash,
    name,
    role,
    adminId: adminId || id,
    status: "active",
    permissions: role === "super_admin" ? ["*"] : ["users", "hosts", "kyc", "payments", "tickets"],
    createdAt: new Date().toISOString(),
    lastLogin: null,
  };

  adminStore.set(id, admin);

  auditFromRequest(req, "role_change", id, "admin", { action: "create", role, adminId });

  res.json({
    success: true,
    admin: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      adminId: admin.adminId,
      status: admin.status,
      permissions: admin.permissions,
      createdAt: admin.createdAt,
    },
  });
});

// ── GET /api/admin/list ── (Super Admin only) ──────────────────────────────

router.get("/admin/list", requireSuperAdmin, async (req: AuthenticatedRequest, res) => {
  const admins = Array.from(adminStore.values()).map((a) => ({
    id: a.id,
    email: a.email,
    name: a.name,
    role: a.role,
    adminId: a.adminId,
    status: a.status,
    permissions: a.permissions,
    createdAt: a.createdAt,
    lastLogin: a.lastLogin,
  }));

  auditFromRequest(req, "user_data_access", undefined, "admin", { action: "list_admins", count: admins.length });

  res.json({ success: true, admins });
});

// ── POST /api/admin/:id/status ── (Super Admin only) ─────────────────────

router.post("/admin/:id/status", requireSuperAdmin, adminRateLimit, async (req: AuthenticatedRequest, res) => {
  const id = req.params.id as string;
  const { status } = req.body as { status?: "active" | "suspended" | "inactive" };

  const admin = adminStore.get(id);
  if (!admin) {
    res.status(404).json({ success: false, error: "Admin not found" });
    return;
  }

  if (admin.role === "super_admin" && status === "suspended" && admin.id === "adm-sa") {
    res.status(403).json({ success: false, error: "Cannot suspend the primary Super Admin" });
    return;
  }

  admin.status = status || admin.status;

  auditFromRequest(req, "role_change", id, "admin", { action: "status_change", status: admin.status });

  res.json({
    success: true,
    admin: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      status: admin.status,
    },
  });
});

// ── POST /api/admin/:id/password ── (Self or Super Admin) ─────────────────

router.post("/admin/:id/password", requireAuth, adminRateLimit, async (req: AuthenticatedRequest, res) => {
  const id = req.params.id as string;
  const { currentPassword, newPassword } = req.body as { currentPassword?: string; newPassword?: string };
  const actorId = req.user!.sub;
  const actorRole = req.user!.role;

  const admin = adminStore.get(id);
  if (!admin) {
    res.status(404).json({ success: false, error: "Admin not found" });
    return;
  }

  // Self or Super Admin can change
  if (actorId !== id && actorRole !== "super_admin") {
    res.status(403).json({ success: false, error: "Not authorized to change this admin's password" });
    return;
  }

  // Self must provide current password
  if (actorId === id && currentPassword) {
    const valid = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!valid) {
      res.status(401).json({ success: false, error: "Current password is incorrect" });
      return;
    }
  }

  if (!newPassword || newPassword.length < 8) {
    res.status(400).json({ success: false, error: "New password must be at least 8 characters" });
    return;
  }

  admin.passwordHash = await bcrypt.hash(newPassword, 12);

  auditFromRequest(req, "role_change", id, "admin", { action: "password_change" });

  res.json({ success: true, message: "Password updated successfully" });
});

// ── POST /api/admin/refresh ── (Any admin) ─────────────────────────────────

router.post("/admin/refresh", requireAdminOrSuper, async (req: AuthenticatedRequest, res) => {
  const admin = adminStore.get(req.user!.sub);
  if (!admin || admin.status !== "active") {
    res.status(403).json({ success: false, error: "Account is no longer active" });
    return;
  }

  const token = signAdminToken(admin.id, admin.role, admin.adminId);

  res.json({
    success: true,
    token,
    admin: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      adminId: admin.adminId,
      permissions: admin.permissions,
    },
  });
});

// ── POST /api/admin/me ── (Get current admin) ───────────────────────────────

router.get("/admin/me", requireAdminOrSuper, async (req: AuthenticatedRequest, res) => {
  const admin = adminStore.get(req.user!.sub);
  if (!admin) {
    res.status(404).json({ success: false, error: "Admin not found" });
    return;
  }

  res.json({
    success: true,
    admin: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      adminId: admin.adminId,
      status: admin.status,
      permissions: admin.permissions,
    },
  });
});

export default router;
