import { Router } from "express";
import { db } from "@workspace/db";
import { users, follows, posts } from "@workspace/db";
import { eq, and, desc, sql, count } from "drizzle-orm";
import { requireUser, getUserId, type AuthenticatedRequest } from "../lib/auth";
import { searchRateLimit } from "../lib/rateLimit";

const router = Router();

// ── GET /api/users/:id — get user profile ──
router.get("/users/:id", async (req: AuthenticatedRequest, res) => {
  const userId = req.params.id as string;
  const currentUserId = getUserId(req);

  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId));

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Count followers and following
    const [{ followers }] = await db
      .select({ followers: count() })
      .from(follows)
      .where(eq(follows.followingId, userId));

    const [{ following }] = await db
      .select({ following: count() })
      .from(follows)
      .where(eq(follows.followerId, userId));

    const [{ postsCount }] = await db
      .select({ postsCount: count() })
      .from(posts)
      .where(eq(posts.userId, userId));

    // Check if current user follows this user
    let isFollowing = false;
    if (currentUserId) {
      const existing = await db
        .select()
        .from(follows)
        .where(and(eq(follows.followerId, currentUserId), eq(follows.followingId, userId)));
      isFollowing = existing.length > 0;
    }

    res.json({
      ...user,
      followers,
      following,
      postsCount,
      isFollowing,
    });
  } catch (err: any) {
    req.log.error(err, "get user error");
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// ── POST /api/users/:id/follow — toggle follow ──
router.post("/users/:id/follow", requireUser, async (req: AuthenticatedRequest, res) => {
  const currentUserId = getUserId(req) as string;
  const targetUserId = req.params.id as string;

  if (!currentUserId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  if (currentUserId === targetUserId) {
    res.status(400).json({ error: "Cannot follow yourself" });
    return;
  }

  try {
    const existing = await db
      .select()
      .from(follows)
      .where(and(eq(follows.followerId, currentUserId), eq(follows.followingId, targetUserId)));

    if (existing.length > 0) {
      // Unfollow
      await db
        .delete(follows)
        .where(and(eq(follows.followerId, currentUserId), eq(follows.followingId, targetUserId)));
      res.json({ following: false });
    } else {
      // Follow
      await db
        .insert(follows)
        .values({ followerId: currentUserId, followingId: targetUserId });
      res.json({ following: true });
    }
  } catch (err: any) {
    req.log.error(err, "follow error");
    res.status(500).json({ error: "Failed to toggle follow" });
  }
});

// ── GET /api/users/:id/posts — get user's posts ──
router.get("/users/:id/posts", async (req: AuthenticatedRequest, res) => {
  const userId = req.params.id as string;
  const limit = Math.min(parseInt(req.query.limit as string || "20"), 50);
  const offset = parseInt(req.query.offset as string || "0");

  try {
    const userPosts = await db
      .select()
      .from(posts)
      .where(eq(posts.userId, userId))
      .orderBy(desc(posts.createdAt))
      .limit(limit)
      .offset(offset);

    res.json({ posts: userPosts });
  } catch (err: any) {
    req.log.error(err, "get user posts error");
    res.status(500).json({ error: "Failed to fetch posts" });
  }
});

// ── GET /api/users/search?q= — search users ──
router.get("/users", searchRateLimit, async (req: AuthenticatedRequest, res) => {
  const q = (req.query.q as string || "").trim();
  const limit = Math.min(parseInt(req.query.limit as string || "20"), 50);

  if (!q || q.length < 2) {
    res.status(400).json({ error: "Query must be at least 2 characters" });
    return;
  }

  try {
    const results = await db
      .select({
        id: users.id,
        name: users.name,
        avatar: users.avatar,
        city: users.city,
        bio: users.bio,
      })
      .from(users)
      .where(sql`${users.name} ILIKE ${"%" + q + "%"}`)
      .limit(limit);

    res.json({ users: results });
  } catch (err: any) {
    req.log.error(err, "search users error");
    res.status(500).json({ error: "Failed to search users" });
  }
});

export default router;
