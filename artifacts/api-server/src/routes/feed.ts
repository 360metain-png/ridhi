import { Router } from "express";
import { db } from "@workspace/db";
import { posts, postLikes, postComments, follows, users } from "@workspace/db";
import { eq, desc, sql, and, inArray, isNull } from "drizzle-orm";
import { requireUser, getUserId, type AuthenticatedRequest } from "../lib/auth";

const router = Router();

// ── GET /api/feed — posts from followed users + trending ──
router.get("/feed", async (req: AuthenticatedRequest, res) => {
  const userId = getUserId(req);
  const trending = req.query.trending === "true";
  const limit = Math.min(parseInt(req.query.limit as string || "20"), 50);
  const offset = parseInt(req.query.offset as string || "0");

  try {
    let postList: any[] = [];
    let total = 0;

    if (userId && !trending) {
      // Get posts from followed users
      const followed = await db
        .select({ followingId: follows.followingId })
        .from(follows)
        .where(eq(follows.followerId, userId));

      const followingIds = followed.map(f => f.followingId);
      followingIds.push(userId); // include own posts

      postList = await db
        .select({
          id: posts.id,
          content: posts.content,
          images: posts.images,
          likesCount: posts.likesCount,
          commentsCount: posts.commentsCount,
          sharesCount: posts.sharesCount,
          city: posts.city,
          language: posts.language,
          createdAt: posts.createdAt,
          userId: posts.userId,
          userName: users.name,
          userAvatar: users.avatar,
          userCity: users.city,
        })
        .from(posts)
        .leftJoin(users, eq(posts.userId, users.id))
        .where(inArray(posts.userId, followingIds))
        .orderBy(desc(posts.createdAt))
        .limit(limit)
        .offset(offset);

      totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(posts)
        .where(inArray(posts.userId, followingIds));
      total = totalResult[0]?.count ?? 0;
    } else {
      // Trending: all posts, sorted by engagement
      postList = await db
        .select({
          id: posts.id,
          content: posts.content,
          images: posts.images,
          likesCount: posts.likesCount,
          commentsCount: posts.commentsCount,
          sharesCount: posts.sharesCount,
          city: posts.city,
          language: posts.language,
          createdAt: posts.createdAt,
          userId: posts.userId,
          userName: users.name,
          userAvatar: users.avatar,
          userCity: users.city,
        })
        .from(posts)
        .leftJoin(users, eq(posts.userId, users.id))
        .orderBy(desc(sql`${posts.likesCount} + ${posts.commentsCount} + ${posts.sharesCount}`))
        .limit(limit)
        .offset(offset);

      totalResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(posts);
      total = totalResult[0]?.count ?? 0;
    }

    // Check if current user liked each post
    let likedPostIds: string[] = [];
    if (userId) {
      const likes = await db
        .select({ postId: postLikes.postId })
        .from(postLikes)
        .where(eq(postLikes.userId, userId));
      likedPostIds = likes.map(l => l.postId);
    }

    const formatted = postList.map(p => ({
      ...p,
      isLiked: likedPostIds.includes(p.id),
      timeAgo: formatTimeAgo(p.createdAt),
    }));

    res.json({ posts: formatted, total, limit, offset });
  } catch (err: any) {
    req.log.error(err, "feed error");
    res.status(500).json({ error: "Failed to fetch feed" });
  }
});

let totalResult: any[];

// ── POST /api/posts — create a new post ──
router.post("/posts", requireUser, async (req: AuthenticatedRequest, res) => {
  const userId = getUserId(req) as string;

  const { content, images, city, language } = req.body;
  if (!content || content.trim().length === 0) {
    res.status(400).json({ error: "Content is required" });
    return;
  }

  try {
    const [post] = await db
      .insert(posts)
      .values({
        userId,
        content: content.trim(),
        images: images || [],
        city: city || null,
        language: language || null,
      })
      .returning();

    res.status(201).json({ success: true, post });
  } catch (err: any) {
    req.log.error(err, "create post error");
    res.status(500).json({ error: "Failed to create post" });
  }
});

// ── POST /api/posts/:id/like — toggle like ──
router.post("/posts/:id/like", requireUser, async (req: AuthenticatedRequest, res) => {
  const userId = getUserId(req) as string;
  const postId = req.params.id as string;
  // Accept non-UUID user IDs for demo/test mode
  const effectiveUserId = userId.startsWith("test") || userId.length < 36
    ? "00000000-0000-0000-0000-000000000000"
    : userId;

  try {
    // Check if already liked
    const existing = await db
      .select()
      .from(postLikes)
      .where(and(eq(postLikes.userId, effectiveUserId), eq(postLikes.postId, postId)));

    if (existing.length > 0) {
      // Unlike
      await db
        .delete(postLikes)
        .where(and(eq(postLikes.userId, effectiveUserId), eq(postLikes.postId, postId)));

      await db
        .update(posts)
        .set({ likesCount: sql`${posts.likesCount} - 1` })
        .where(eq(posts.id, postId));

      res.json({ liked: false });
    } else {
      // Like
      await db.insert(postLikes).values({ userId: effectiveUserId, postId });

      await db
        .update(posts)
        .set({ likesCount: sql`${posts.likesCount} + 1` })
        .where(eq(posts.id, postId));

      res.json({ liked: true });
    }
  } catch (err: any) {
    req.log.error(err, "like post error");
    res.status(500).json({ error: "Failed to toggle like" });
  }
});

// ── POST /api/posts/:id/comment — add comment ──
router.post("/posts/:id/comment", requireUser, async (req: AuthenticatedRequest, res) => {
  const userId = getUserId(req) as string;
  const postId = req.params.id as string;
  const { content } = req.body;
  if (!content || content.trim().length === 0) {
    res.status(400).json({ error: "Comment content is required" });
    return;
  }

  try {
    const [comment] = await db
      .insert(postComments)
      .values({ userId, postId, content: content.trim() })
      .returning();

    await db
      .update(posts)
      .set({ commentsCount: sql`${posts.commentsCount} + 1` })
      .where(eq(posts.id, postId));

    res.status(201).json({ success: true, comment });
  } catch (err: any) {
    req.log.error(err, "comment post error");
    res.status(500).json({ error: "Failed to add comment" });
  }
});

// ── GET /api/posts/:id/comments ──
router.get("/posts/:id/comments", async (req, res) => {
  const postId = req.params.id;
  const limit = Math.min(parseInt(req.query.limit as string || "20"), 50);

  try {
    const comments = await db
      .select({
        id: postComments.id,
        content: postComments.content,
        createdAt: postComments.createdAt,
        userId: postComments.userId,
        userName: users.name,
        userAvatar: users.avatar,
      })
      .from(postComments)
      .leftJoin(users, eq(postComments.userId, users.id))
      .where(eq(postComments.postId, postId))
      .orderBy(desc(postComments.createdAt))
      .limit(limit);

    res.json({ comments });
  } catch (err: any) {
    req.log.error(err, "get comments error");
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

function formatTimeAgo(date: Date | string | null): string {
  if (!date) return "";
  const d = new Date(date);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffSec < 60) return "Just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default router;
