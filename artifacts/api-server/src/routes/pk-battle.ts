import { Router } from "express";
import { db } from "@workspace/db";
import { users, kycRecords } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireUser, requireSuperAdmin, getUserId, getAdminInfo, type AuthenticatedRequest } from "../lib/auth";
import { adminRateLimit } from "../lib/rateLimit";
import { auditFromRequest } from "../lib/audit";

const router = Router();

// PK Battle host approval status
// 0 = not_requested, 1 = requested, 2 = approved, 3 = rejected

/**
 * POST /api/pk-battle/request
 * User requests approval to host PK Battles.
 * Requires: E-verified (KYC approved) + user token.
 */
router.post("/pk-battle/request", requireUser, async (req: AuthenticatedRequest, res) => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ success: false, error: "Authentication required" });
    return;
  }

  try {
    // Check KYC status
    const kycRows = await db.select().from(kycRecords).where(eq(kycRecords.userId, userId)).limit(1);
    if (kycRows.length === 0 || kycRows[0].reviewStatus !== "approved") {
      res.status(403).json({
        success: false,
        error: "E-verification (KYC) required before requesting PK Battle hosting.",
        kycStatus: kycRows[0]?.reviewStatus || "not_started",
      });
      return;
    }

    // Check current PK Battle status
    const userRows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (userRows.length === 0) {
      res.status(404).json({ success: false, error: "User not found" });
      return;
    }

    const user = userRows[0];
    const currentStatus = user.pkBattleApproved ?? 0;

    if (currentStatus === 1) {
      res.status(409).json({ success: false, error: "Request already pending." });
      return;
    }
    if (currentStatus === 2) {
      res.status(409).json({ success: false, error: "Already approved to host PK Battles." });
      return;
    }

    // Submit request
    await db
      .update(users)
      .set({
        pkBattleApproved: 1,
        pkBattleRequestedAt: new Date(),
        pkBattleRejectionReason: null,
      })
      .where(eq(users.id, userId));

    req.log.info({ userId }, "PK Battle host request submitted");
    res.json({
      success: true,
      status: "requested",
      message: "Request submitted. Awaiting Super Admin approval.",
    });
  } catch (err) {
    req.log.error({ err }, "PK Battle request failed");
    res.status(500).json({ success: false, error: "Failed to submit request" });
  }
});

/**
 * GET /api/pk-battle/status
 * Get current user's PK Battle host status.
 */
router.get("/pk-battle/status", requireUser, async (req: AuthenticatedRequest, res) => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ success: false, error: "Authentication required" });
    return;
  }

  try {
    const userRows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (userRows.length === 0) {
      res.status(404).json({ success: false, error: "User not found" });
      return;
    }

    const user = userRows[0];
    const kycRows = await db.select().from(kycRecords).where(eq(kycRecords.userId, userId)).limit(1);
    const kycStatus = kycRows[0]?.reviewStatus || "not_started";

    const statusMap: Record<number, string> = {
      0: "not_requested",
      1: "requested",
      2: "approved",
      3: "rejected",
    };

    res.json({
      success: true,
      pkBattleStatus: statusMap[user.pkBattleApproved ?? 0] ?? "not_requested",
      pkBattleStatusCode: user.pkBattleApproved ?? 0,
      kycStatus,
      kycApproved: kycStatus === "approved",
      requestedAt: user.pkBattleRequestedAt,
      approvedAt: user.pkBattleApprovedAt,
      approvedBy: user.pkBattleApprovedBy,
      rejectionReason: user.pkBattleRejectionReason,
      canRequest: kycStatus === "approved" && (user.pkBattleApproved ?? 0) === 0,
      canHost: (user.pkBattleApproved ?? 0) === 2,
    });
  } catch (err) {
    req.log.error({ err }, "PK Battle status fetch failed");
    res.status(500).json({ success: false, error: "Failed to fetch status" });
  }
});

/**
 * GET /api/pk-battle/requests
 * Super Admin views pending PK Battle host requests.
 */
router.get("/pk-battle/requests", requireSuperAdmin, adminRateLimit, async (req: AuthenticatedRequest, res) => {
  try {
    const rows = await db
      .select()
      .from(users)
      .where(eq(users.pkBattleApproved, 1));

    // Fetch KYC status for each user
    const requests = await Promise.all(
      rows.map(async (user) => {
        const kycRows = await db.select().from(kycRecords).where(eq(kycRecords.userId, user.id)).limit(1);
        const kyc = kycRows[0];
        return {
          id: user.id,
          name: user.name,
          phone: user.phone,
          city: user.city,
          kycStatus: kyc?.reviewStatus || "not_started",
          kycSubmittedAt: kyc?.submittedAt,
          requestedAt: user.pkBattleRequestedAt,
        };
      })
    );

    res.json({ success: true, total: requests.length, requests });
  } catch (err) {
    req.log.error({ err }, "PK Battle requests fetch failed");
    res.status(500).json({ success: false, error: "Failed to fetch requests" });
  }
});

/**
 * POST /api/pk-battle/approve/:userId
 * Super Admin approves or rejects a PK Battle host request.
 */
router.post("/pk-battle/approve/:userId", requireSuperAdmin, adminRateLimit, async (req: AuthenticatedRequest, res) => {
  const userId = req.params.userId as string;
  const body = req.body as any;
  const action = body?.action;
  const adminInfo = getAdminInfo(req);

  if (!action || !["approve", "reject"].includes(action)) {
    res.status(400).json({ success: false, error: "action must be 'approve' or 'reject'" });
    return;
  }

  try {
    const userRows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (userRows.length === 0) {
      res.status(404).json({ success: false, error: "User not found" });
      return;
    }

    const user = userRows[0];
    if (user.pkBattleApproved !== 1) {
      res.status(409).json({ success: false, error: "No pending request for this user" });
      return;
    }

    const now = new Date();
    const isApprove = action === "approve";

    await db
      .update(users)
      .set({
        pkBattleApproved: isApprove ? 2 : 3,
        pkBattleApprovedAt: isApprove ? now : null,
        pkBattleApprovedBy: isApprove ? (adminInfo?.id ?? "super_admin") : null,
        pkBattleRejectionReason: !isApprove ? (typeof body.reason === "string" ? body.reason : null) : null,
      })
      .where(eq(users.id, userId));

    auditFromRequest(
      req,
      isApprove ? "pk_battle_approve" : "pk_battle_reject",
      userId,
      "user",
      { reason: body.reason, userName: user.name }
    );

    req.log.info({ userId, action, adminId: adminInfo?.id }, "PK Battle request reviewed");
    res.json({
      success: true,
      action,
      status: isApprove ? "approved" : "rejected",
      message: isApprove
        ? "User approved to host PK Battles."
        : "User request rejected.",
    });
  } catch (err) {
    req.log.error({ err }, "PK Battle approval failed");
    res.status(500).json({ success: false, error: "Failed to process approval" });
  }
});

export default router;
