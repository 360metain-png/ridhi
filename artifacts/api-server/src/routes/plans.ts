import { Router } from "express";
import { db } from "@workspace/db";
import { users } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireUser, type AuthenticatedRequest, getUserId } from "../lib/auth";
import { apiRateLimit } from "../lib/rateLimit";
import { logger } from "../lib/logger";

const router = Router();

// The JWT sub is the phone number (not UUID), so all lookups go by users.phone.
function userBySub(sub: string) {
  return eq(users.phone, sub);
}

// ── POST /api/plan/cancel ─────────────────────────────────────────────────
router.post("/plan/cancel", requireUser, apiRateLimit, async (req: AuthenticatedRequest, res) => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  try {
    await db.update(users).set({ plan: "free" }).where(userBySub(userId));
    logger.info({ userId }, "plan cancelled");
    res.json({ success: true, plan: "free" });
  } catch (err: any) {
    logger.error({ err: err.message }, "plan cancel error");
    res.status(500).json({ error: "Failed to cancel plan" });
  }
});

export default router;
