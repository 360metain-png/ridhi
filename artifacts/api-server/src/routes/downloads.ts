import { Router } from "express";
import { db } from "@workspace/db";
import { users } from "@workspace/db";
import { eq, and, gte, sql } from "drizzle-orm";
import { requireUser, type AuthenticatedRequest, getUserId } from "../lib/auth";
import { apiRateLimit } from "../lib/rateLimit";
import { logger } from "../lib/logger";

const router = Router();

// The JWT sub may be UUID (new tokens) or phone number (old tokens).
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function userBySub(sub: string) {
  return UUID_RE.test(sub) ? eq(users.id, sub) : eq(users.phone, sub);
}

// ── Canonical download pricing (server-side truth; never trust client price) ───────
const CANONICAL_DOWNLOAD_PRICES: Record<string, number> = {
  reel: 5,
  post: 10,
  story: 3,
  live: 20,
  audio: 8,
  post_download: 10,
};

function getDownloadPrice(contentType: string): number {
  return CANONICAL_DOWNLOAD_PRICES[contentType] || 0;
}

// ── POST /api/downloads ──────────────────────────────────────────────
router.post(
  "/downloads",
  apiRateLimit,
  requireUser,
  async (req: AuthenticatedRequest, res) => {
    const body = req.body;
    const contentId = typeof body?.contentId === "string" ? body.contentId : "";
    const contentType = ["reel", "post", "story", "live", "audio", "post_download"].includes(body?.contentType) ? body.contentType : "";

    if (!contentId || !contentType) {
      res.status(400).json({ success: false, error: "Invalid download payload" });
      return;
    }

    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    // Server-side canonical price lookup (never trust client-provided price)
    const price = getDownloadPrice(contentType);
    if (price <= 0) {
      res.status(400).json({ success: false, error: "Unsupported content type for download" });
      return;
    }

    try {
      // Server-side dual-coin deduction: free coins first, then paid coins.
      // Downloads (unlike calls/withdrawals) accept both free and paid coins.
      const [userRow] = await db.select({
        freeCoins: users.freeCoins,
        paidCoins: users.paidCoins,
        coins: users.coins,
      }).from(users).where(userBySub(userId));

      if (!userRow) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const free = userRow.freeCoins ?? 0;
      const paid = userRow.paidCoins ?? 0;
      const total = free + paid;

      if (total < price) {
        res.status(402).json({ error: "Insufficient coins", freeCoins: free, paidCoins: paid, total });
        return;
      }

      // Deduct from free first, remainder from paid
      const deductFromFree = Math.min(free, price);
      const deductFromPaid = price - deductFromFree;

      const newFree = free - deductFromFree;
      const newPaid = paid - deductFromPaid;
      const newTotal = newFree + newPaid;

      await db.update(users)
        .set({
          freeCoins: newFree,
          paidCoins: newPaid,
          coins: newTotal,
        })
        .where(userBySub(userId));

      const creatorShare = Math.floor(price * 0.6);
      const platformShare = price - creatorShare;

      logger.info(
        { userId, contentId, contentType, price, creatorShare, platformShare, newFree, newPaid },
        "Download transaction"
      );

      res.status(200).json({
        success: true,
        data: {
          transactionId: `dl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          contentId,
          contentType,
          price,
          creatorShare,
          platformShare,
          coins: newTotal,
          freeCoins: newFree,
          paidCoins: newPaid,
          downloadedAt: new Date().toISOString(),
        },
      });
    } catch (err: any) {
      logger.error({ err: err.message }, "download transaction error");
      res.status(500).json({ error: "Failed to process download" });
    }
  }
);

// ── GET /api/downloads/history ──────────────────────────────────────────────
router.get(
  "/downloads/history",
  apiRateLimit,
  requireUser,
  async (req: AuthenticatedRequest, res) => {
    const userId = getUserId(req);
    const limit = Math.min(Number(req.query.limit) || 20, 100);

    res.status(200).json({
      success: true,
      data: {
        downloads: [],
        total: 0,
        limit,
      },
    });
  }
);

export default router;
