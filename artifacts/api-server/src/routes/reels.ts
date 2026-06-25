import { Router } from "express";
import { db } from "@workspace/db";
import { reels, users } from "@workspace/db";
import { eq, desc, sql, and } from "drizzle-orm";
import { requireUser, getUserId, type AuthenticatedRequest } from "../lib/auth";
import { logger } from "../lib/logger";

const router = Router();

// ── GET /api/reels — list all reels (public) ──
router.get("/reels", async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit as string || "20"), 50);
  const offset = parseInt(req.query.offset as string || "0");

  try {
    const reelList = await db
      .select({
        id: reels.id,
        userId: reels.userId,
        caption: reels.caption,
        gradient: reels.gradient,
        emoji: reels.emoji,
        likesCount: reels.likesCount,
        commentsCount: reels.commentsCount,
        sharesCount: reels.sharesCount,
        allowDuet: reels.allowDuet,
        createdAt: reels.createdAt,
        userName: users.name,
        userCity: users.city,
      })
      .from(reels)
      .leftJoin(users, eq(reels.userId, users.id))
      .orderBy(desc(reels.createdAt))
      .limit(limit)
      .offset(offset);

    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(reels);

    return res.json({
      reels: reelList,
      total: totalResult[0]?.count ?? 0,
      limit,
      offset,
    });
  } catch (err) {
    logger.error({ err }, "Failed to fetch reels");
    return res.status(500).json({ error: "Failed to fetch reels" });
  }
});

// ── POST /api/reels — create a reel (auth required) ──
router.post("/reels", requireUser, async (req: AuthenticatedRequest, res) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const { caption, gradient, emoji, allowDuet } = req.body;
  if (!caption || typeof caption !== "string" || caption.trim().length === 0) {
    return res.status(400).json({ error: "Caption is required" });
  }

  try {
    const [reel] = await db
      .insert(reels)
      .values({
        userId,
        caption: caption.trim(),
        gradient: (Array.isArray(gradient) && gradient.length === 2 ? gradient : ["#FF6B35", "#E91E8C"]) as [string, string],
        emoji: typeof emoji === "string" && emoji.length > 0 ? emoji : "🔥",
        allowDuet: typeof allowDuet === "boolean" ? allowDuet : true,
      })
      .returning();

    return res.status(201).json({ reel });
  } catch (err) {
    logger.error({ err, userId }, "Failed to create reel");
    return res.status(500).json({ error: "Failed to create reel" });
  }
});

// ── POST /api/reels/:id/like — like/unlike a reel ──
router.post("/reels/:id/like", requireUser, async (req: AuthenticatedRequest, res) => {
  const userId = getUserId(req);
  const reelId = req.params.id;

  if (!userId) return res.status(401).json({ error: "Authentication required" });

  try {
    // Simple increment for now (no per-user like tracking table yet)
    await db
      .update(reels)
      .set({ likesCount: sql`${reels.likesCount} + 1` })
      .where(eq(reels.id, reelId as string));

    return res.json({ success: true });
  } catch (err) {
    logger.error({ err, reelId }, "Failed to like reel");
    return res.status(500).json({ error: "Failed to like reel" });
  }
});

// ── PATCH /api/reels/:id/duet — toggle allowDuet (creator only) ──
router.patch("/reels/:id/duet", requireUser, async (req: AuthenticatedRequest, res) => {
  const userId = getUserId(req);
  const reelId = req.params.id;
  const { allowDuet } = req.body;

  if (!userId) return res.status(401).json({ error: "Authentication required" });
  if (typeof allowDuet !== "boolean") {
    return res.status(400).json({ error: "allowDuet boolean is required" });
  }

  try {
    // Verify ownership
    const [existing] = await db
      .select({ userId: reels.userId })
      .from(reels)
      .where(eq(reels.id, reelId as string))
      .limit(1);

    if (!existing) return res.status(404).json({ error: "Reel not found" });
    if (existing.userId !== userId) {
      return res.status(403).json({ error: "Only the creator can change duet settings" });
    }

    await db
      .update(reels)
      .set({ allowDuet })
      .where(eq(reels.id, reelId as string));

    return res.json({ success: true, allowDuet });
  } catch (err) {
    logger.error({ err, reelId }, "Failed to toggle duet setting");
    return res.status(500).json({ error: "Failed to toggle duet setting" });
  }
});

export default router;
