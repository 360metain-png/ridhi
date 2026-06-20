import { Router } from "express";
import { requireUser, type AuthenticatedRequest, getUserId } from "../lib/auth";
import { apiRateLimit } from "../lib/rateLimit";
import { logger } from "../lib/logger";

const router = Router();

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

    // Revenue split: 60% creator, 40% platform
    const creatorShare = Math.floor(price * 0.6);
    const platformShare = price - creatorShare;

    logger.info(
      { userId, contentId, contentType, price, creatorShare, platformShare },
      "Download transaction"
    );

    // In production: persist to database, update creator wallet, verify coins
    // For now: return success with split details
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
        downloadedAt: new Date().toISOString(),
      },
    });
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
