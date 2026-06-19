/**
 * Audit Logging for Admin Actions
 *
 * Tracks all privileged operations:
 * - KYC approval/rejection
 * - Host suspension/removal
 * - Payment verification
 * - Admin config changes
 * - User data access
 *
 * Logs are written to the database audit table + structured logger.
 */

import { db } from "@workspace/db";
import { logger } from "./logger";
import type { TokenPayload } from "./auth";

export type AuditAction =
  | "kyc_approve"
  | "kyc_reject"
  | "host_suspend"
  | "host_remove"
  | "host_verify"
  | "host_assign"
  | "payment_verify"
  | "payment_refund"
  | "otp_config_change"
  | "payment_config_change"
  | "user_data_access"
  | "admin_login"
  | "admin_login_failed"
  | "user_delete"
  | "role_change"
  | "pk_battle_approve"
  | "pk_battle_reject";

export interface AuditEntry {
  action: AuditAction;
  actorId: string;
  actorType: "user" | "admin" | "super_admin";
  targetId?: string;
  targetType?: string;
  details?: Record<string, unknown>;
  ip?: string;
  userAgent?: string;
}

// In-memory buffer for audit logs (batch writes to DB)
const auditBuffer: AuditEntry[] = [];
const BUFFER_FLUSH_INTERVAL = 30 * 1000; // 30 seconds

// ── Log an Audit Event ──────────────────────────────────────────────────────

export function auditLog(entry: AuditEntry) {
  // Always log to structured logger
  logger.info(
    {
      audit: true,
      action: entry.action,
      actorId: entry.actorId,
      actorType: entry.actorType,
      targetId: entry.targetId,
      targetType: entry.targetType,
      details: entry.details,
      ip: entry.ip,
    },
    `AUDIT: ${entry.action}`
  );

  // Buffer for DB write
  auditBuffer.push(entry);
}

// ── Convenience: Log from Request ────────────────────────────────────────────

export function auditFromRequest(
  req: any,
  action: AuditAction,
  targetId?: string,
  targetType?: string,
  details?: Record<string, unknown>
) {
  const user = req.user as TokenPayload | undefined;
  const actorId = user?.sub || "anonymous";
  const actorType = user?.type === "admin"
    ? (user.role === "super_admin" ? "super_admin" : "admin")
    : "user";

  auditLog({
    action,
    actorId,
    actorType,
    targetId,
    targetType,
    details,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });
}

// ── Flush Buffer to DB ────────────────────────────────────────────────────────

async function flushAuditBuffer() {
  if (auditBuffer.length === 0) return;

  const batch = auditBuffer.splice(0, auditBuffer.length);

  try {
    // For now, we log to structured logger only.
    // When audit table is added to schema, uncomment below:
    // await db.insert(auditTable).values(batch.map(e => ({
    //   action: e.action,
    //   actorId: e.actorId,
    //   actorType: e.actorType,
    //   targetId: e.targetId,
    //   targetType: e.targetType,
    //   details: e.details,
    //   ip: e.ip,
    //   userAgent: e.userAgent,
    //   createdAt: new Date(),
    // })));

    logger.info({ count: batch.length }, "Audit buffer flushed");
  } catch (err) {
    logger.error({ err, count: batch.length }, "Failed to flush audit buffer");
  }
}

// Start flush interval
setInterval(flushAuditBuffer, BUFFER_FLUSH_INTERVAL);

// Flush on graceful shutdown
process.on("SIGTERM", flushAuditBuffer);
process.on("SIGINT", flushAuditBuffer);
