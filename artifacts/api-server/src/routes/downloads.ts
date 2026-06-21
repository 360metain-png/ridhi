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

// ── POST /api/downloads — record a paid download transaction ───────────────
router.post(
  "/downloads",
  apiRateLimit,
  requireUser,
  async (req: AuthenticatedRequest, res) => {
    const body = req.body;
    const contentId = typeof body?.contentId === "string" ? body.contentId : "";
    const contentType = ["reel", "post", "story", "live", "audio"].includes(body?.contentType) ? body.contentType : "";
    const ownerId = typeof body?.ownerId === "string" ? body.ownerId : "";
    const price = typeof body?.price === "number" && body.price > 0 ? body.price : 0;

    if (!contentId || !contentType || !ownerId || price <= 0) {
      res.status(400).json({
        success: false,
        error: "Invalid download payload",
      });
      return;
    }

    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ error: "Authentication required" });
      return;
    }

    // Server-side coin balance check
    try {
      const [user] = await db.select({ coins: users.coins }).from(users).where(userBySub(userId));
      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      if (user.coins < price) {
        res.status(402).json({ error: "Insufficient coins", coins: user.coins });
        return;
      }
      // Deduct coins server-side
      const newBalance = user.coins - price;
      await db.update(users).set({ coins: newBalance }).where(userBySub(userId));

      // Revenue split: 60% creator, 40% platform
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
          ownerId,
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

// ── GET /api/downloads/history — list user's download history ────────────
router.get(
  "/downloads/history",
  apiRateLimit,
  requireUser,
  async (req: AuthenticatedRequest, res) => {
    const userId = getUserId(req);
    const limit = Math.min(Number(req.query.limit) || 20, 100);

    // In production: query from database
    // For now: return empty history
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
