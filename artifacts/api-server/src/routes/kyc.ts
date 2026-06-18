import { Router } from "express";
import { db } from "@workspace/db";
import { kycRecords } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireUser, requireAdmin, type AuthenticatedRequest } from "../lib/auth";
import { encryptKycFields, decryptKycFields } from "../lib/encryption";
import { auditFromRequest } from "../lib/audit";
import { adminRateLimit } from "../lib/rateLimit";

const router = Router();

// Simple validation helpers (no external libs)
const VALID_ROLES = new Set(["host", "agent", "creator"]);
function isValidRoles(val: unknown): val is ("host" | "agent" | "creator")[] {
  return Array.isArray(val) && val.every((v) => typeof v === "string" && VALID_ROLES.has(v));
}
function isValidAadhaar(v: unknown): v is string {
  return typeof v === "string" && /^\d{4}\s\d{4}\s\d{4}$/.test(v);
}
function isValidPan(v: unknown): v is string {
  return typeof v === "string" && /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(v);
}
function isValidIfsc(v: unknown): v is string {
  return typeof v === "string" && /^[A-Z]{4}[0-9]{7}$/.test(v);
}

// ── POST /api/kyc/submit — user submits KYC ─────────────────────────────────────────────
router.post("/kyc/submit", requireUser, async (req: AuthenticatedRequest, res) => {
  const body = req.body as any;
  if (!body?.userId || typeof body.userId !== "string") {
    res.status(400).json({ success: false, error: "userId is required" });
    return;
  }
  if (!isValidRoles(body.roles) || body.roles.length === 0) {
    res.status(400).json({ success: false, error: "Select at least one role (host/agent/creator)" });
    return;
  }
  // Agent and Host are mutually exclusive (conflict of interest)
  if (body.roles.includes("host") && body.roles.includes("agent")) {
    res.status(400).json({ success: false, error: "Host and Agent cannot be selected together" });
    return;
  }

  try {
    const existing = await db.select().from(kycRecords).where(eq(kycRecords.userId, body.userId)).limit(1);

    // Roles are permanently locked on first submission. Changing roles requires deleting the account.
    if (existing.length > 0 && existing[0].roles?.length > 0) {
      const submittedRoles = existing[0].roles;
      const rolesMatch = body.roles.length === submittedRoles.length && body.roles.every((r: string) => submittedRoles.includes(r));
      if (!rolesMatch) {
        res.status(400).json({
          success: false,
          error: "Roles are permanently locked. Delete your account in Settings to choose different roles."
        });
        return;
      }
    }

    const now = new Date();
    // Encrypt sensitive fields before storage
    const encrypted = encryptKycFields({
      aadhaarNumber: isValidAadhaar(body.aadhaarNumber) ? body.aadhaarNumber : undefined,
      panNumber: isValidPan(body.panNumber) ? body.panNumber : undefined,
      bankAccountNumber: typeof body.bankAccountNumber === "string" ? body.bankAccountNumber : undefined,
      bankIfsc: isValidIfsc(body.bankIfsc) ? body.bankIfsc : undefined,
      bankName: typeof body.bankName === "string" ? body.bankName : undefined,
      bankHolderName: typeof body.bankHolderName === "string" ? body.bankHolderName : undefined,
    });
    const record: any = {
      userId: body.userId,
      roles: body.roles,
      aadhaarFrontImage: body.aadhaarFrontImage || undefined,
      aadhaarBackImage: body.aadhaarBackImage || undefined,
      panImage: body.panImage || undefined,
      bankProofImage: body.bankProofImage || undefined,
      ...encrypted,
      status: "pending" as const,
      reviewStatus: "pending" as const,
      submittedAt: now,
      updatedAt: now,
    };

    if (existing.length > 0) {
      await db.update(kycRecords).set(record).where(eq(kycRecords.userId, body.userId));
    } else {
      await db.insert(kycRecords).values(record);
    }

    req.log.info({ userId: body.userId, roles: body.roles }, "KYC submitted for review");
    res.json({
      success: true,
      status: "pending",
      reviewStatus: "pending",
      message: "KYC documents submitted successfully. Awaiting admin review.",
    });
  } catch (err) {
    req.log.error({ err }, "KYC submit failed");
    res.status(500).json({ success: false, message: "Failed to save KYC record" });
  }
});

// ── GET /api/kyc/status/:userId ──────────────────────────────────────────────
router.get("/kyc/status/:userId", requireUser, async (req: AuthenticatedRequest, res) => {
  const userId = req.params.userId as string;
  try {
    const rows = await db.select().from(kycRecords).where(eq(kycRecords.userId, userId)).limit(1);
    if (rows.length === 0) {
      res.json({
        success: true,
        kyc: {
          status: "not_started",
          reviewStatus: "pending",
          roles: [],
          aadhaarVerified: false,
          panVerified: false,
          bankVerified: false,
        },
      });
      return;
    }
    const k = rows[0];
    // Decrypt sensitive fields before returning
    const decrypted = decryptKycFields(k);
    res.json({
      success: true,
      kyc: {
        status: k.status,
        reviewStatus: k.reviewStatus,
        roles: k.roles,
        aadhaarNumber: decrypted.aadhaarNumber,
        aadhaarVerified: k.aadhaarVerified,
        panNumber: decrypted.panNumber,
        panVerified: k.panVerified,
        bankName: decrypted.bankName,
        bankIfsc: decrypted.bankIfsc,
        bankVerified: k.bankVerified,
        submittedAt: k.submittedAt,
        reviewedAt: k.reviewedAt,
        reviewedBy: k.reviewedBy,
        adminComment: k.adminComment,
        rejectionReason: k.rejectionReason,
      },
    });
  } catch (err) {
    req.log.error({ err }, "KYC status fetch failed");
    res.status(500).json({ success: false, message: "Failed to fetch KYC status" });
  }
});

// ── GET /api/kyc/documents/:userId ───────────────────────────────────────────
router.get("/kyc/documents/:userId", requireAdmin, async (req: AuthenticatedRequest, res) => {
  const userId = req.params.userId as string;
  try {
    const rows = await db.select().from(kycRecords).where(eq(kycRecords.userId, userId)).limit(1);
    if (rows.length === 0) {
      res.status(404).json({ success: false, message: "KYC record not found" });
      return;
    }
    const k = rows[0];
    res.json({
      success: true,
      documents: {
        aadhaarFrontImage: k.aadhaarFrontImage,
        aadhaarBackImage: k.aadhaarBackImage,
        panImage: k.panImage,
        bankProofImage: k.bankProofImage,
      },
    });
  } catch (err) {
    req.log.error({ err }, "KYC documents fetch failed");
    res.status(500).json({ success: false, message: "Failed to fetch documents" });
  }
});

// ── GET /api/kyc/queue ──────────────────────────────────────────────────────
router.get("/kyc/queue", requireAdmin, adminRateLimit, async (req: AuthenticatedRequest, res) => {
  const { status, reviewStatus, role } = req.query as Record<string, string>;
  try {
    let query: any = db.select().from(kycRecords);
    if (status) {
      query = query.where(eq(kycRecords.status, status));
    }
    const rows = await query.orderBy(desc(kycRecords.submittedAt));

    let filtered = rows;
    if (role) {
      filtered = rows.filter((r: any) => r.roles.includes(role));
    }
    if (reviewStatus) {
      filtered = filtered.filter((r: any) => r.reviewStatus === reviewStatus);
    }

    res.json({
      success: true,
      total: filtered.length,
      submissions: filtered.map((k: any) => ({
        id: k.id,
        userId: k.userId,
        roles: k.roles,
        status: k.status,
        reviewStatus: k.reviewStatus,
        aadhaarNumber: k.aadhaarNumber,
        panNumber: k.panNumber,
        bankName: k.bankName,
        bankAccountNumber: k.bankAccountNumber,
        submittedAt: k.submittedAt,
        reviewedAt: k.reviewedAt,
        reviewedBy: k.reviewedBy,
        adminComment: k.adminComment,
        rejectionReason: k.rejectionReason,
        hasAadhaarFront: !!k.aadhaarFrontImage,
        hasAadhaarBack: !!k.aadhaarBackImage,
        hasPanImage: !!k.panImage,
        hasBankProof: !!k.bankProofImage,
      })),
    });
  } catch (err) {
    req.log.error({ err }, "KYC queue fetch failed");
    res.status(500).json({ success: false, message: "Failed to fetch KYC queue" });
  }
});

// ── POST /api/kyc/review/:userId ────────────────────────────────────────────
router.post("/kyc/review/:userId", requireAdmin, adminRateLimit, async (req: AuthenticatedRequest, res) => {
  const userId = req.params.userId as string;
  const body = req.body as any;
  const action = body?.action;
  if (!action || !["approve", "reject"].includes(action)) {
    res.status(400).json({ success: false, error: "action must be 'approve' or 'reject'" });
    return;
  }
  if (!body?.reviewedBy || typeof body.reviewedBy !== "string") {
    res.status(400).json({ success: false, error: "reviewedBy is required" });
    return;
  }

  try {
    const existing = await db.select().from(kycRecords).where(eq(kycRecords.userId, userId)).limit(1);
    if (existing.length === 0) {
      res.status(404).json({ success: false, message: "KYC record not found" });
      return;
    }

    const now = new Date();
    const isApprove = action === "approve";
    const update: any = {
      reviewStatus: isApprove ? "approved" : "rejected",
      status: isApprove ? "approved" : "rejected",
      reviewedBy: body.reviewedBy,
      reviewedAt: now,
      updatedAt: now,
      adminComment: typeof body.adminComment === "string" ? body.adminComment : null,
      rejectionReason: !isApprove ? (typeof body.rejectionReason === "string" ? body.rejectionReason : null) : null,
      aadhaarVerified: isApprove ? true : existing[0].aadhaarVerified,
      panVerified: isApprove ? true : existing[0].panVerified,
      bankVerified: isApprove ? true : existing[0].bankVerified,
      aadhaarVerifiedAt: isApprove ? now : existing[0].aadhaarVerifiedAt,
      panVerifiedAt: isApprove ? now : existing[0].panVerifiedAt,
      bankVerifiedAt: isApprove ? now : existing[0].bankVerifiedAt,
    };

    await db.update(kycRecords).set(update).where(eq(kycRecords.userId, userId));

    auditFromRequest(req, action === "approve" ? "kyc_approve" : "kyc_reject", userId, "user", {
      reviewedBy: body.reviewedBy,
      adminComment: body.adminComment,
      rejectionReason: body.rejectionReason,
    });
    req.log.info({ userId, action, reviewedBy: body.reviewedBy }, "KYC reviewed");
    res.json({
      success: true,
      action,
      reviewStatus: update.reviewStatus,
      message: isApprove
        ? "KYC approved. User can now start earning."
        : "KYC rejected. User must resubmit.",
    });
  } catch (err) {
    req.log.error({ err }, "KYC review failed");
    res.status(500).json({ success: false, message: "Failed to process review" });
  }
});

export default router;
