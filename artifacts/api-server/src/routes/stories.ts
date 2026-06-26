import { Router } from "express";
import { db } from "@workspace/db";
import { stories, users } from "@workspace/db";
import { eq, desc, sql, gt } from "drizzle-orm";
import { requireUser, resolveUserId, type AuthenticatedRequest } from "../lib/auth";
import { logger } from "../lib/logger";

const router = Router();

// ── GET /api/stories — active stories from last 24h ──
router.get("/stories", async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit as string || "50"), 100);
  const now = new Date();

  try {
    const storyList = await db
      .select({
        id: stories.id,
        userId: stories.userId,
        content: stories.content,
        image: stories.image,
        hasUnseen: stories.hasUnseen,
        createdAt: stories.createdAt,
        expiresAt: stories.expiresAt,
        userName: users.name,
        userAvatar: users.avatar,
      })
      .from(stories)
      .leftJoin(users, eq(stories.userId, users.id))
      .where(gt(stories.expiresAt, now))
      .orderBy(desc(stories.createdAt))
      .limit(limit);

    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(stories)
      .where(gt(stories.expiresAt, now));

    return res.json({
      stories: storyList,
      total: totalResult[0]?.count ?? 0,
    });
  } catch (err) {
    logger.error({ err }, "Failed to fetch stories");
    return res.status(500).json({ error: "Failed to fetch stories" });
  }
});

// ── POST /api/stories — create a story (auth required) ──
router.post("/stories", requireUser, async (req: AuthenticatedRequest, res) => {
  const userId = await resolveUserId(req);
  if (!userId) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const { content, image } = req.body;
  if (!content || typeof content !== "string" || content.trim().length === 0) {
    return res.status(400).json({ error: "Content is required" });
  }

  try {
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const [story] = await db
      .insert(stories)
      .values({
        userId,
        content: content.trim(),
        image: typeof image === "string" ? image : null,
        expiresAt,
      })
      .returning();

    return res.status(201).json({ story });
  } catch (err) {
    logger.error({ err, userId }, "Failed to create story");
    return res.status(500).json({ error: "Failed to create story" });
  }
});

// ── POST /api/stories/:id/view — mark story as seen ──
router.post("/stories/:id/view", requireUser, async (req: AuthenticatedRequest, res) => {
  const userId = await resolveUserId(req);
  const storyId = req.params.id;

  if (!userId) return res.status(401).json({ error: "Authentication required" });

  try {
    await db
      .update(stories)
      .set({ hasUnseen: false })
      .where(eq(stories.id, storyId as string));

    return res.json({ success: true });
  } catch (err) {
    logger.error({ err, storyId }, "Failed to mark story viewed");
    return res.status(500).json({ error: "Failed to mark story viewed" });
  }
});

export default router;
