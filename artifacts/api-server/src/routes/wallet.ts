import { Router } from "express";
import { db } from "@workspace/db";
import { users } from "@workspace/db";
import { eq, and, gte, sql } from "drizzle-orm";
import { requireUser, type AuthenticatedRequest, getUserId } from "../lib/auth";
import { apiRateLimit } from "../lib/rateLimit";
import { logger } from "../lib/logger";

const router = Router();

// The JWT sub is the phone number (not UUID), so all lookups go by users.phone.
function userBySub(sub: string) {
  return eq(users.phone, sub);
}

// ── GET /api/wallet ─────────────────────────────────────────────────
router.get("/wallet", requireUser, async (req: AuthenticatedRequest, res) => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  try {
    const [user] = await db.select({ coins: users.coins, plan: users.plan })
      .from(users).where(userBySub(userId));
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({ coins: user.coins, plan: user.plan });
  } catch (err: any) {
    logger.error({ err: err.message }, "wallet get error");
    res.status(500).json({ error: "Failed to fetch wallet" });
  }
});

// ── POST /api/wallet/coins/deduct ──────────────────────────────────────────────
router.post("/wallet/coins/deduct", requireUser, apiRateLimit, async (req: AuthenticatedRequest, res) => {
  const userId = getUserId(req);
  const amount = typeof req.body?.amount === "number" ? Math.max(0, Math.floor(req.body.amount)) : 0;
  const reason = typeof req.body?.reason === "string" ? req.body.reason : "";

  if (!userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  if (amount <= 0) {
    res.status(400).json({ error: "Invalid amount" });
    return;
  }

  try {
    // Atomic conditional update: deduct only if balance >= amount
    const result = await db.update(users)
      .set({ coins: sql`${users.coins} - ${amount}` })
      .where(and(userBySub(userId), gte(users.coins, amount)))
      .returning({ coins: users.coins });
    if (result.length === 0) {
      // Either user not found or insufficient coins
      const [user] = await db.select({ coins: users.coins }).from(users).where(userBySub(userId));
      if (!user) {
        res.status(404).json({ error: "User not found" });
      } else {
        res.status(402).json({ error: "Insufficient coins", coins: user.coins });
      }
      return;
    }
    logger.info({ userId, amount, reason, newBalance: result[0].coins }, "coins deducted");
    res.json({ success: true, coins: result[0].coins });
  } catch (err: any) {
    logger.error({ err: err.message }, "coins deduct error");
    res.status(500).json({ error: "Failed to deduct coins" });
  }
});

export default router;
