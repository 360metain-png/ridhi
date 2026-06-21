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

// ── POST /api/plan/subscribe ─────────────────────────────────────────────────
router.post("/plan/subscribe", requireUser, apiRateLimit, async (req: AuthenticatedRequest, res) => {
  const userId = getUserId(req);
  const plan = typeof req.body?.plan === "string" ? req.body.plan : "";
  const billing = typeof req.body?.billing === "string" ? req.body.billing : "monthly";
  const bonusCoins = typeof req.body?.bonusCoins === "number" ? Math.max(0, req.body.bonusCoins) : 0;

  const validPlans = ["free", "silver", "gold", "platinum", "diamond"];
  const validBilling = ["weekly", "monthly", "yearly"];
  const validCreator = ["creator_starter", "creator_pro", "creator_elite"];

  if (!userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  const isCreator = plan.startsWith("creator_");
  if (!isCreator && !validPlans.includes(plan)) {
    res.status(400).json({ error: "Invalid plan" });
    return;
  }
  if (isCreator && !validCreator.includes(plan)) {
    res.status(400).json({ error: "Invalid creator plan" });
    return;
  }
  if (!validBilling.includes(billing)) {
    res.status(400).json({ error: "Invalid billing period" });
    return;
  }

  const now = new Date();
  let expiresAt: Date;
  if (billing === "weekly") { expiresAt = new Date(now); expiresAt.setDate(expiresAt.getDate() + 7); }
  else if (billing === "yearly") { expiresAt = new Date(now); expiresAt.setFullYear(expiresAt.getFullYear() + 1); }
  else { expiresAt = new Date(now); expiresAt.setMonth(expiresAt.getMonth() + 1); }
  const expiresAtStr = expiresAt.toISOString();

  try {
    const [user] = await db.select({ coins: users.coins }).from(users).where(userBySub(userId));
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const newCoins = user.coins + bonusCoins;

    if (isCreator) {
      await db.update(users).set({
        plan: "creator" as any,
        coins: newCoins,
      }).where(userBySub(userId));
    } else {
      await db.update(users).set({
        plan: plan as any,
        coins: newCoins,
      }).where(userBySub(userId));
    }

    logger.info({ userId, plan, billing, bonusCoins, newCoins }, "plan subscribed");
    res.json({ success: true, plan, billing, expiresAt: expiresAtStr, coins: newCoins });
  } catch (err: any) {
    logger.error({ err: err.message }, "plan subscribe error");
    res.status(500).json({ error: "Failed to activate plan" });
  }
});

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
