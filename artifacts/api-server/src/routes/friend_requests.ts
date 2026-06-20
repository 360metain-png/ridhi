import { Router } from "express";
import { db } from "@workspace/db";
import { friendRequests, users, conversations } from "@workspace/db";
import { eq, and, or, desc, sql, count } from "drizzle-orm";
import { requireUser, getUserId, type AuthenticatedRequest } from "../lib/auth";

const router = Router();

// ── POST /api/friend-requests/send — send a friend request ──
router.post("/friend-requests/send", requireUser, async (req: AuthenticatedRequest, res) => {
  const senderId = getUserId(req) as string;
  const { receiverId } = req.body;

  if (!receiverId) {
    res.status(400).json({ error: "receiverId is required" });
    return;
  }
  if (senderId === receiverId) {
    res.status(400).json({ error: "Cannot send friend request to yourself" });
    return;
  }

  try {
    // Check if receiver exists
    const [receiver] = await db.select().from(users).where(eq(users.id, receiverId));
    if (!receiver) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    // Check if request already exists
    const existing = await db
      .select()
      .from(friendRequests)
      .where(
        or(
          and(eq(friendRequests.senderId, senderId), eq(friendRequests.receiverId, receiverId)),
          and(eq(friendRequests.senderId, receiverId), eq(friendRequests.receiverId, senderId))
        )
      );

    if (existing.length > 0) {
      const req = existing[0];
      if (req.status === "pending") {
        res.status(409).json({ error: "Friend request already pending" });
        return;
      }
      if (req.status === "accepted") {
        res.status(409).json({ error: "Already friends" });
        return;
      }
      // If rejected, allow resend
    }

    // Insert new request
    const [result] = await db
      .insert(friendRequests)
      .values({ senderId, receiverId, status: "pending" })
      .returning();

    res.status(201).json({ id: result.id, status: "pending" });
  } catch (err: any) {
    req.log.error(err, "send friend request error");
    res.status(500).json({ error: "Failed to send friend request" });
  }
});

// ── POST /api/friend-requests/:id/accept — accept a friend request ──
router.post("/friend-requests/:id/accept", requireUser, async (req: AuthenticatedRequest, res) => {
  const currentUserId = getUserId(req) as string;
  const requestId = req.params.id as string;

  try {
    const [request] = await db.select().from(friendRequests).where(eq(friendRequests.id, requestId));
    if (!request) {
      res.status(404).json({ error: "Friend request not found" });
      return;
    }
    if (request.receiverId !== currentUserId) {
      res.status(403).json({ error: "Only the receiver can accept this request" });
      return;
    }
    if (request.status !== "pending") {
      res.status(400).json({ error: "Request is not pending" });
      return;
    }

    // Update request status
    await db
      .update(friendRequests)
      .set({ status: "accepted" })
      .where(eq(friendRequests.id, requestId));

    // Create a conversation for the two friends
    const [conv] = await db
      .insert(conversations)
      .values({
        participantIds: [request.senderId, request.receiverId],
      })
      .returning();

    res.json({ status: "accepted", conversationId: conv.id });
  } catch (err: any) {
    req.log.error(err, "accept friend request error");
    res.status(500).json({ error: "Failed to accept friend request" });
  }
});

// ── POST /api/friend-requests/:id/reject — reject a friend request ──
router.post("/friend-requests/:id/reject", requireUser, async (req: AuthenticatedRequest, res) => {
  const currentUserId = getUserId(req) as string;
  const requestId = req.params.id as string;

  try {
    const [request] = await db.select().from(friendRequests).where(eq(friendRequests.id, requestId));
    if (!request) {
      res.status(404).json({ error: "Friend request not found" });
      return;
    }
    if (request.receiverId !== currentUserId) {
      res.status(403).json({ error: "Only the receiver can reject this request" });
      return;
    }
    if (request.status !== "pending") {
      res.status(400).json({ error: "Request is not pending" });
      return;
    }

    await db
      .update(friendRequests)
      .set({ status: "rejected" })
      .where(eq(friendRequests.id, requestId));

    res.json({ status: "rejected" });
  } catch (err: any) {
    req.log.error(err, "reject friend request error");
    res.status(500).json({ error: "Failed to reject friend request" });
  }
});

// ── POST /api/friend-requests/:id/cancel — cancel a sent friend request ──
router.post("/friend-requests/:id/cancel", requireUser, async (req: AuthenticatedRequest, res) => {
  const currentUserId = getUserId(req) as string;
  const requestId = req.params.id as string;

  try {
    const [request] = await db.select().from(friendRequests).where(eq(friendRequests.id, requestId));
    if (!request) {
      res.status(404).json({ error: "Friend request not found" });
      return;
    }
    if (request.senderId !== currentUserId) {
      res.status(403).json({ error: "Only the sender can cancel this request" });
      return;
    }
    if (request.status !== "pending") {
      res.status(400).json({ error: "Request is not pending" });
      return;
    }

    await db
      .update(friendRequests)
      .set({ status: "cancelled" })
      .where(eq(friendRequests.id, requestId));

    res.json({ status: "cancelled" });
  } catch (err: any) {
    req.log.error(err, "cancel friend request error");
    res.status(500).json({ error: "Failed to cancel friend request" });
  }
});

// ── GET /api/friend-requests/pending — get pending requests for current user ──
router.get("/friend-requests/pending", requireUser, async (req: AuthenticatedRequest, res) => {
  const currentUserId = getUserId(req) as string;

  try {
    const requests = await db
      .select({
        id: friendRequests.id,
        senderId: friendRequests.senderId,
        receiverId: friendRequests.receiverId,
        status: friendRequests.status,
        createdAt: friendRequests.createdAt,
      })
      .from(friendRequests)
      .where(and(eq(friendRequests.receiverId, currentUserId), eq(friendRequests.status, "pending")))
      .orderBy(desc(friendRequests.createdAt));

    // Enrich with sender info
    const enriched = await Promise.all(
      requests.map(async (r) => {
        const [sender] = await db
          .select({
            id: users.id,
            name: users.name,
            avatar: users.avatar,
            city: users.city,
          })
          .from(users)
          .where(eq(users.id, r.senderId));
        return { ...r, sender };
      })
    );

    res.json({ requests: enriched });
  } catch (err: any) {
    req.log.error(err, "get pending requests error");
    res.status(500).json({ error: "Failed to fetch pending requests" });
  }
});

// ── GET /api/friend-requests/sent — get sent requests by current user ──
router.get("/friend-requests/sent", requireUser, async (req: AuthenticatedRequest, res) => {
  const currentUserId = getUserId(req) as string;

  try {
    const requests = await db
      .select({
        id: friendRequests.id,
        senderId: friendRequests.senderId,
        receiverId: friendRequests.receiverId,
        status: friendRequests.status,
        createdAt: friendRequests.createdAt,
      })
      .from(friendRequests)
      .where(and(eq(friendRequests.senderId, currentUserId), eq(friendRequests.status, "pending")))
      .orderBy(desc(friendRequests.createdAt));

    // Enrich with receiver info
    const enriched = await Promise.all(
      requests.map(async (r) => {
        const [receiver] = await db
          .select({
            id: users.id,
            name: users.name,
            avatar: users.avatar,
            city: users.city,
          })
          .from(users)
          .where(eq(users.id, r.receiverId));
        return { ...r, receiver };
      })
    );

    res.json({ requests: enriched });
  } catch (err: any) {
    req.log.error(err, "get sent requests error");
    res.status(500).json({ error: "Failed to fetch sent requests" });
  }
});

// ── GET /api/friends — get all friends of current user ──
router.get("/friends", requireUser, async (req: AuthenticatedRequest, res) => {
  const currentUserId = getUserId(req) as string;

  try {
    const accepted = await db
      .select({
        id: friendRequests.id,
        senderId: friendRequests.senderId,
        receiverId: friendRequests.receiverId,
        createdAt: friendRequests.createdAt,
      })
      .from(friendRequests)
      .where(
        and(
          eq(friendRequests.status, "accepted"),
          or(
            eq(friendRequests.senderId, currentUserId),
            eq(friendRequests.receiverId, currentUserId)
          )
        )
      )
      .orderBy(desc(friendRequests.createdAt));

    // Enrich with friend info
    const enriched = await Promise.all(
      accepted.map(async (r) => {
        const friendId = r.senderId === currentUserId ? r.receiverId : r.senderId;
        const [friend] = await db
          .select({
            id: users.id,
            name: users.name,
            avatar: users.avatar,
            city: users.city,
            bio: users.bio,
          })
          .from(users)
          .where(eq(users.id, friendId));
        return { ...r, friend };
      })
    );

    res.json({ friends: enriched });
  } catch (err: any) {
    req.log.error(err, "get friends error");
    res.status(500).json({ error: "Failed to fetch friends" });
  }
});

// ── GET /api/friends/check/:userId — check if user is a friend ──
router.get("/friends/check/:userId", requireUser, async (req: AuthenticatedRequest, res) => {
  const currentUserId = getUserId(req) as string;
  const otherUserId = req.params.id as string;

  try {
    const existing = await db
      .select()
      .from(friendRequests)
      .where(
        and(
          eq(friendRequests.status, "accepted"),
          or(
            and(eq(friendRequests.senderId, currentUserId), eq(friendRequests.receiverId, otherUserId)),
            and(eq(friendRequests.senderId, otherUserId), eq(friendRequests.receiverId, currentUserId))
          )
        )
      );

    const pending = await db
      .select()
      .from(friendRequests)
      .where(
        and(
          eq(friendRequests.status, "pending"),
          or(
            and(eq(friendRequests.senderId, currentUserId), eq(friendRequests.receiverId, otherUserId)),
            and(eq(friendRequests.senderId, otherUserId), eq(friendRequests.receiverId, currentUserId))
          )
        )
      );

    res.json({
      isFriend: existing.length > 0,
      hasPending: pending.length > 0,
      pendingStatus: pending[0]?.status ?? null,
      sentByMe: pending[0]?.senderId === currentUserId,
    });
  } catch (err: any) {
    req.log.error(err, "check friend status error");
    res.status(500).json({ error: "Failed to check friend status" });
  }
});

// ── POST /api/friends/:userId/remove — remove a friend ──
router.post("/friends/:userId/remove", requireUser, async (req: AuthenticatedRequest, res) => {
  const currentUserId = getUserId(req) as string;
  const friendUserId = req.params.userId as string;

  try {
    const existing = await db
      .select()
      .from(friendRequests)
      .where(
        and(
          eq(friendRequests.status, "accepted"),
          or(
            and(eq(friendRequests.senderId, currentUserId), eq(friendRequests.receiverId, friendUserId)),
            and(eq(friendRequests.senderId, friendUserId), eq(friendRequests.receiverId, currentUserId))
          )
        )
      );

    if (existing.length === 0) {
      res.status(404).json({ error: "Friend relationship not found" });
      return;
    }

    await db
      .delete(friendRequests)
      .where(eq(friendRequests.id, existing[0].id));

    res.json({ removed: true });
  } catch (err: any) {
    req.log.error(err, "remove friend error");
    res.status(500).json({ error: "Failed to remove friend" });
  }
});

export default router;
