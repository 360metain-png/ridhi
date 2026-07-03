import { Router } from "express";
import { db } from "@workspace/db";
import { users, coinTransactions, coinEconomyConfig } from "@workspace/db";
import { eq, and, gte, sql, lte, count, sum, desc } from "drizzle-orm";
import { requireUser, requireAdmin, type AuthenticatedRequest, getUserId } from "../lib/auth";
import { apiRateLimit } from "../lib/rateLimit";
import { logger } from "../lib/logger";

const router = Router();

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function userBySub(sub: string) {
  // New tokens: sub is UUID; old tokens: sub is phone number
  return UUID_RE.test(sub) ? eq(users.id, sub) : eq(users.phone, sub);
}

// ── GET /api/wallet ─────────────────────────────────────────────────
// Returns dual-coin balances (free + paid) plus legacy total
router.get("/wallet", requireUser, async (req: AuthenticatedRequest, res) => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  try {
    const [user] = await db.select({
      coins: users.coins,
      freeCoins: users.freeCoins,
      paidCoins: users.paidCoins,
      plan: users.plan,
    }).from(users).where(userBySub(userId));
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({
      coins: user.coins,               // legacy total
      freeCoins: user.freeCoins,
      paidCoins: user.paidCoins,
      plan: user.plan,
    });
  } catch (err: any) {
    logger.error({ err: err.message }, "wallet get error");
    res.status(500).json({ error: "Failed to fetch wallet" });
  }
});

// ── POST /api/wallet/coins/deduct ──────────────────────────────────────────────
// Deducts coins: free coins first, then paid coins. Server-side atomic.
router.post("/wallet/coins/deduct", requireUser, apiRateLimit, async (req: AuthenticatedRequest, res) => {
  const userId = getUserId(req);
  const amount = typeof req.body?.amount === "number" ? Math.max(0, Math.floor(req.body.amount)) : 0;
  const reason = typeof req.body?.reason === "string" ? req.body.reason : "spend";
  const requirePaid = req.body?.requirePaid === true; // calls pass this to enforce paid-coin-only

  if (!userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  if (amount <= 0) {
    res.status(400).json({ error: "Invalid amount" });
    return;
  }

  try {
    // 1. Fetch current balances
    const [user] = await db.select({
      id: users.id,
      coins: users.coins,
      freeCoins: users.freeCoins,
      paidCoins: users.paidCoins,
    }).from(users).where(userBySub(userId));
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    let result;
    let deductFromFree = 0;
    let deductFromPaid = 0;
    let newFreeCoins = user.freeCoins;
    let newPaidCoins = user.paidCoins;

    if (requirePaid) {
      // Calls and other paid-only features: only paid coins accepted
      if (user.paidCoins < amount) {
        res.status(402).json({ error: "Insufficient paid coins", coins: user.coins, freeCoins: user.freeCoins, paidCoins: user.paidCoins });
        return;
      }
      deductFromPaid = amount;
      newPaidCoins = user.paidCoins - amount;
      const newCoins = user.freeCoins + newPaidCoins;
      result = await db.update(users)
        .set({
          coins: newCoins,
          paidCoins: newPaidCoins,
        })
        .where(and(userBySub(userId), gte(users.paidCoins, amount)))
        .returning({
          coins: users.coins,
          freeCoins: users.freeCoins,
          paidCoins: users.paidCoins,
        });
    } else {
      // General spends: free coins first, then paid coins
      if (user.coins < amount) {
        res.status(402).json({ error: "Insufficient coins", coins: user.coins, freeCoins: user.freeCoins, paidCoins: user.paidCoins });
        return;
      }
      deductFromFree = Math.min(user.freeCoins, amount);
      deductFromPaid = amount - deductFromFree;
      newFreeCoins = user.freeCoins - deductFromFree;
      newPaidCoins = user.paidCoins - deductFromPaid;
      const newCoins = newFreeCoins + newPaidCoins;
      result = await db.update(users)
        .set({
          coins: newCoins,
          freeCoins: newFreeCoins,
          paidCoins: newPaidCoins,
        })
        .where(and(userBySub(userId), gte(users.coins, amount)))
        .returning({
          coins: users.coins,
          freeCoins: users.freeCoins,
          paidCoins: users.paidCoins,
        });
    }

    if (result.length === 0) {
      // Race condition: balance changed between read and write
      const [latest] = await db.select({
        coins: users.coins,
        freeCoins: users.freeCoins,
        paidCoins: users.paidCoins,
      }).from(users).where(userBySub(userId));
      res.status(402).json({
        error: requirePaid ? "Insufficient paid coins" : "Insufficient coins",
        coins: latest?.coins ?? 0,
        freeCoins: latest?.freeCoins ?? 0,
        paidCoins: latest?.paidCoins ?? 0,
      });
      return;
    }

    // 4. Record transaction
    await db.insert(coinTransactions).values({
      userId: user.id,
      type: requirePaid ? "paid_spend" : "spend",
      direction: "debit",
      amount: amount,
      freeAmount: deductFromFree,
      paidAmount: deductFromPaid,
      balanceFree: newFreeCoins,
      balancePaid: newPaidCoins,
      source: requirePaid ? "paid_call" : "spend",
      description: reason,
    });

    logger.info({ userId, amount, requirePaid, freeDeduct: deductFromFree, paidDeduct: deductFromPaid, newBalance: result[0].coins }, "coins deducted (dual-coin)");
    res.json({
      success: true,
      coins: result[0].coins,
      freeCoins: result[0].freeCoins,
      paidCoins: result[0].paidCoins,
    });
  } catch (err: any) {
    logger.error({ err: err.message }, "coins deduct error");
    res.status(500).json({ error: "Failed to deduct coins" });
  }
});

// ── POST /api/wallet/coins/credit ──────────────────────────────────────────────
// Credits coins with free/paid tracking. Used by payment fulfillment, free earn, admin adjustment.
router.post("/wallet/coins/credit", requireUser, apiRateLimit, async (req: AuthenticatedRequest, res) => {
  const userId = getUserId(req);
  const amount = typeof req.body?.amount === "number" ? Math.max(0, Math.floor(req.body.amount)) : 0;
  const reason = typeof req.body?.reason === "string" ? req.body.reason : "credit";
  const source = typeof req.body?.source === "string" ? req.body.source : "other";
  const isPaid = req.body?.isPaid === true;

  if (!userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  if (amount <= 0) {
    res.status(400).json({ error: "Invalid amount" });
    return;
  }

  try {
    const [user] = await db.select({
      id: users.id,
      coins: users.coins,
      freeCoins: users.freeCoins,
      paidCoins: users.paidCoins,
    }).from(users).where(userBySub(userId));
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const freeAmount = isPaid ? 0 : amount;
    const paidAmount = isPaid ? amount : 0;
    const newFreeCoins = user.freeCoins + freeAmount;
    const newPaidCoins = user.paidCoins + paidAmount;
    const newCoins = newFreeCoins + newPaidCoins;

    const result = await db.update(users)
      .set({
        coins: newCoins,
        freeCoins: newFreeCoins,
        paidCoins: newPaidCoins,
      })
      .where(userBySub(userId))
      .returning({
        coins: users.coins,
        freeCoins: users.freeCoins,
        paidCoins: users.paidCoins,
      });
    if (result.length === 0) {
      res.status(500).json({ error: "Failed to credit coins" });
      return;
    }

    // Record transaction
    await db.insert(coinTransactions).values({
      userId: user.id,
      type: isPaid ? "paid_recharge" : "free_earn",
      direction: "credit",
      amount: amount,
      freeAmount: freeAmount,
      paidAmount: paidAmount,
      balanceFree: newFreeCoins,
      balancePaid: newPaidCoins,
      source: source,
      description: reason,
      freeCoinsExpireAt: isPaid ? undefined : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days expiry
    });

    logger.info({ userId, amount, isPaid, source, newBalance: result[0].coins }, "coins credited (dual-coin)");
    res.json({
      success: true,
      coins: result[0].coins,
      freeCoins: result[0].freeCoins,
      paidCoins: result[0].paidCoins,
    });
  } catch (err: any) {
    logger.error({ err: err.message }, "coins credit error");
    res.status(500).json({ error: "Failed to credit coins" });
  }
});

// ── GET /api/wallet/transactions ──────────────────────────────────────────────
// Returns paginated transaction history for the authenticated user
router.get("/wallet/transactions", requireUser, async (req: AuthenticatedRequest, res) => {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  try {
    const [user] = await db.select({ id: users.id }).from(users).where(userBySub(userId));
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    const txns = await db.select().from(coinTransactions)
      .where(eq(coinTransactions.userId, user.id))
      .orderBy(desc(coinTransactions.createdAt))
      .limit(100);
    res.json({ transactions: txns });
  } catch (err: any) {
    logger.error({ err: err.message }, "wallet transactions error");
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// ── GET /api/wallet/economy ──────────────────────────────────────────────
// Admin-only: coin economy health metrics (free vs paid ratio, burn rate)
router.get("/wallet/economy", requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get all free coin credits today
    const freeCreditsToday = await db.select({
      total: sql<number>`COALESCE(SUM(${coinTransactions.amount}), 0)`,
      count: count(),
    }).from(coinTransactions).where(
      and(
        eq(coinTransactions.direction, "credit"),
        eq(coinTransactions.type, "free_earn"),
        gte(coinTransactions.createdAt, today)
      )
    );

    // Get all paid coin credits today (recharges)
    const paidCreditsToday = await db.select({
      total: sql<number>`COALESCE(SUM(${coinTransactions.amount}), 0)`,
      count: count(),
    }).from(coinTransactions).where(
      and(
        eq(coinTransactions.direction, "credit"),
        eq(coinTransactions.type, "paid_recharge"),
        gte(coinTransactions.createdAt, today)
      )
    );

    // Get all coin debits today
    const debitsToday = await db.select({
      total: sql<number>`COALESCE(SUM(${coinTransactions.amount}), 0)`,
      count: count(),
    }).from(coinTransactions).where(
      and(
        eq(coinTransactions.direction, "debit"),
        gte(coinTransactions.createdAt, today)
      )
    );

    // Total circulating: sum of all free + paid coins across users
    const circulating = await db.select({
      total: sql<number>`COALESCE(SUM(${users.coins}), 0)`,
      freeTotal: sql<number>`COALESCE(SUM(${users.freeCoins}), 0)`,
      paidTotal: sql<number>`COALESCE(SUM(${users.paidCoins}), 0)`,
    }).from(users);

    // Fetch config
    const [config] = await db.select().from(coinEconomyConfig).limit(1);

    const freeOut = freeCreditsToday[0]?.total ?? 0;
    const paidIn = paidCreditsToday[0]?.total ?? 0;
    const freeToPaidRatio = paidIn > 0 ? (freeOut / paidIn) * 100 : 0;

    res.json({
      freeCoinsIssuedToday: freeOut,
      paidCoinsReceivedToday: paidIn,
      coinsSpentToday: debitsToday[0]?.total ?? 0,
      freeToPaidRatio: Math.round(freeToPaidRatio * 100) / 100,
      totalCirculating: circulating[0]?.total ?? 0,
      totalFreeCirculating: circulating[0]?.freeTotal ?? 0,
      totalPaidCirculating: circulating[0]?.paidTotal ?? 0,
      dailyFreeCoinBudget: config?.dailyFreeCoinBudget ?? 50000,
      dailyBudgetUsedPercent: config?.dailyFreeCoinBudget ? Math.round((freeOut / config.dailyFreeCoinBudget) * 100) : 0,
      freeCoinEarningEnabled: config?.freeCoinEarningEnabled === 1,
      autoPauseOnBudgetExhaust: config?.autoPauseOnBudgetExhaust === 1,
      alertThreshold: config?.freeToPaidRatioAlert ?? 30,
    });
  } catch (err: any) {
    logger.error({ err: err.message }, "wallet economy error");
    res.status(500).json({ error: "Failed to fetch economy metrics" });
  }
});

export default router;
