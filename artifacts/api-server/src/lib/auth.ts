/**
 * JWT Authentication & Authorization
 *
 * - Signs JWTs on OTP verification (no password storage needed)
 * - Verifies JWT on every protected request
 * - Supports user tokens and admin tokens with roles
 * - 7-day expiry for users, 24-hour for admins
 */

import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { logger } from "./logger";
import { db } from "@workspace/db";
import { users } from "@workspace/db";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env["SESSION_SECRET"] || "ridhi-development-secret-change-in-production";

// Token expiry
const USER_TOKEN_EXPIRY = "7d";
const ADMIN_TOKEN_EXPIRY = "24h";

export interface TokenPayload {
  sub: string;      // user ID
  type: "user" | "admin";
  role?: string;    // admin role: "admin" | "super_admin"
  adminId?: string; // admin's ID for SPOC chain
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

// ── Token Generation ──────────────────────────────────────────────────────────

export function signUserToken(userId: string): string {
  return jwt.sign({ sub: userId, type: "user" }, JWT_SECRET, {
    expiresIn: USER_TOKEN_EXPIRY,
  });
}

export function signAdminToken(adminId: string, role: string, adminId2?: string): string {
  return jwt.sign(
    { sub: adminId, type: "admin", role, adminId: adminId2 || adminId },
    JWT_SECRET,
    { expiresIn: ADMIN_TOKEN_EXPIRY }
  );
}

// ── Token Verification ────────────────────────────────────────────────────────

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (err) {
    logger.warn({ err: (err as Error).message }, "JWT verification failed");
    return null;
  }
}

// ── Middleware: Require Authentication ────────────────────────────────────────

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Authentication required. Provide a Bearer token." });
    return;
  }

  const token = authHeader.slice(7);
  const payload = verifyToken(token);

  if (!payload) {
    res.status(401).json({ error: "Invalid or expired token. Please log in again." });
    return;
  }

  req.user = payload;
  next();
}

// ── Middleware: Require User (not admin) ──────────────────────────────────────

export function requireUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (req.user?.type !== "user") {
      res.status(403).json({ error: "User access required." });
      return;
    }
    next();
  });
}

// ── Middleware: Require Admin ─────────────────────────────────────────────────

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (req.user?.type !== "admin") {
      res.status(403).json({ error: "Admin access required." });
      return;
    }
    next();
  });
}

// ── Middleware: Require Super Admin ─────────────────────────────────────────

export function requireSuperAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (req.user?.type !== "admin" || req.user.role !== "super_admin") {
      res.status(403).json({ error: "Super Admin access required." });
      return;
    }
    next();
  });
}

// ── Middleware: Require Admin or Super Admin ────────────────────────────────

export function requireAdminOrSuper(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    if (req.user?.type !== "admin" || !["admin", "super_admin"].includes(req.user.role || "")) {
      res.status(403).json({ error: "Admin or Super Admin access required." });
      return;
    }
    next();
  });
}

// ── Helper: Extract user ID from request ────────────────────────────────────

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function getUserId(req: AuthenticatedRequest): string | undefined {
  return req.user?.sub;
}

/**
 * Resolve the user identifier from the JWT `sub` to the canonical UUID.
 * Supports both old tokens (sub = phone number) and new tokens (sub = UUID).
 * Returns `undefined` if the user is not found.
 */
export async function resolveUserId(req: AuthenticatedRequest): Promise<string | undefined> {
  const sub = req.user?.sub;
  if (!sub) return undefined;

  // Already a UUID — no translation needed
  if (UUID_RE.test(sub)) return sub;

  // Old token: sub is a phone number; look up the real UUID
  try {
    const rows = await db.select({ id: users.id }).from(users).where(eq(users.phone, sub)).limit(1);
    return rows[0]?.id ?? undefined;
  } catch (err) {
    logger.warn({ err, sub }, "resolveUserId: failed to look up user by phone");
    return undefined;
  }
}

// ── Helper: Extract admin info from request ───────────────────────────────────

export function getAdminInfo(req: AuthenticatedRequest): { id: string; role: string; adminId: string } | null {
  if (req.user?.type !== "admin") return null;
  return {
    id: req.user.sub,
    role: req.user.role || "admin",
    adminId: req.user.adminId || req.user.sub,
  };
}
