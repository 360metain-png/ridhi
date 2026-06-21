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
      // Atomic conditional update: deduct only if balance >= price
      const result = await db.update(users)
        .set({ coins: sql`${users.coins} - ${price}` })
        .where(and(userBySub(userId), gte(users.coins, price)))
        .returning({ coins: users.coins });
      if (result.length === 0) {
        const [user] = await db.select({ coins: users.coins }).from(users).where(userBySub(userId));
        if (!user) {
          res.status(404).json({ error: "User not found" });
        } else {
          res.status(402).json({ error: "Insufficient coins", coins: user.coins });
        }
        return;
      }
      const newBalance = result[0].coins;
      const creatorShare = Math.floor(price * 0.6);
      const platformShare = price - creatorShare;

      logger.info(
        { userId, contentId, contentType, price, creatorShare, platformShare, newBalance },
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
          coins: newBalance,
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
