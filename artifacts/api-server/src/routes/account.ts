import { Router } from "express";
import { db } from "@workspace/db";
import { kycRecords } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

// DELETE /api/account — wipe user data and KYC record for fresh start
router.delete("/account", async (req, res) => {
  const body = req.body as any;
  if (!body?.userId || typeof body.userId !== "string") {
    res.status(400).json({ success: false, error: "userId is required" });
    return;
  }

  try {
    // Remove KYC record so the user can choose different roles on re-registration
    await db.delete(kycRecords).where(eq(kycRecords.userId, body.userId));

    req.log.info({ userId: body.userId }, "Account deletion requested — KYC record wiped");
    res.json({
      success: true,
      message: "Account data cleared. You may now register fresh with new roles."
    });
  } catch (err) {
    req.log.error({ err, userId: body.userId }, "Account deletion failed");
    res.status(500).json({ success: false, message: "Failed to delete account data" });
  }
});

export default router;
