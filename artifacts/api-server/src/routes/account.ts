import { Router } from "express";
import { db } from "@workspace/db";
import { kycRecords } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { requireUser, getUserId, type AuthenticatedRequest } from "../lib/auth";
import { auditFromRequest } from "../lib/audit";

const router = Router();

// DELETE /api/account — wipe user data and KYC record for fresh start
router.delete("/account", requireUser, async (req: AuthenticatedRequest, res) => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ success: false, error: "Authentication required" });
    return;
  }

  try {
    // Remove KYC record so the user can choose different roles on re-registration
    await db.delete(kycRecords).where(eq(kycRecords.userId, userId));

    auditFromRequest(req, "user_delete", userId, "user");
    req.log.info({ userId }, "Account deletion requested — KYC record wiped");
    res.json({
      success: true,
      message: "Account data cleared. You may now register fresh with new roles."
    });
  } catch (err) {
    req.log.error({ err, userId }, "Account deletion failed");
    res.status(500).json({ success: false, message: "Failed to delete account data" });
  }
});

export default router;
