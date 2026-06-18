import { Router } from "express";
import { db } from "@workspace/db";
import { conversations, messages, users } from "@workspace/db";
import { eq, desc, sql, and, inArray } from "drizzle-orm";
import { requireUser, getUserId, type AuthenticatedRequest } from "../lib/auth";

const router = Router();

// ── GET /api/chat — list conversations for current user ──
router.get("/chat", requireUser, async (req: AuthenticatedRequest, res) => {
  const userId = getUserId(req) as string;

  try {
    const convList = await db
      .select()
      .from(conversations)
      .where(sql`${conversations.participantIds} @> ${JSON.stringify([userId])}`)
      .orderBy(desc(conversations.lastMessageAt || conversations.createdAt));

    // Enrich with other participant info
    const enriched = await Promise.all(
      convList.map(async (conv) => {
        const otherId = conv.participantIds.find(id => id !== userId);
        let otherUser: any = null;
        if (otherId) {
          const [u] = await db
            .select({ id: users.id, name: users.name, avatar: users.avatar, city: users.city })
            .from(users)
            .where(eq(users.id, otherId));
          otherUser = u;
        }

        return {
          id: conv.id,
          lastMessage: conv.lastMessage,
          lastMessageAt: conv.lastMessageAt,
          createdAt: conv.createdAt,
          otherUser,
        };
      })
    );

    res.json({ conversations: enriched });
  } catch (err: any) {
    req.log.error(err, "get conversations error");
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

// ── POST /api/chat — create or get conversation ──
router.post("/chat", requireUser, async (req: AuthenticatedRequest, res) => {
  const userId = getUserId(req) as string;
  const { otherUserId } = req.body;
  if (!otherUserId) {
    res.status(400).json({ error: "otherUserId is required" });
    return;
  }

  try {
    // Check if conversation already exists
    const existing = await db
      .select()
      .from(conversations)
      .where(
        sql`${conversations.participantIds} @> ${JSON.stringify([userId, otherUserId])}`
      );

    if (existing.length > 0) {
      res.json({ success: true, conversation: existing[0] });
      return;
    }

    // Create new conversation
    const [conv] = await db
      .insert(conversations)
      .values({ participantIds: [userId, otherUserId] })
      .returning();

    res.status(201).json({ success: true, conversation: conv });
  } catch (err: any) {
    req.log.error(err, "create conversation error");
    res.status(500).json({ error: "Failed to create conversation" });
  }
});

// ── GET /api/chat/:id/messages ──
router.get("/chat/:id/messages", requireUser, async (req: AuthenticatedRequest, res) => {
  const userId = getUserId(req) as string;
  const conversationId = req.params.id as string;

  try {
    // Verify user is part of this conversation
    const [conv] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId));

    if (!conv || !conv.participantIds.includes(userId)) {
      res.status(403).json({ error: "Not authorized for this conversation" });
      return;
    }

    const msgList = await db
      .select({
        id: messages.id,
        content: messages.content,
        type: messages.type,
        createdAt: messages.createdAt,
        senderId: messages.senderId,
        senderName: users.name,
        senderAvatar: users.avatar,
      })
      .from(messages)
      .leftJoin(users, eq(messages.senderId, users.id))
      .where(eq(messages.conversationId, conversationId))
      .orderBy(desc(messages.createdAt))
      .limit(50);

    res.json({ messages: msgList.reverse() });
  } catch (err: any) {
    req.log.error(err, "get messages error");
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// ── POST /api/chat/:id/messages ──
router.post("/chat/:id/messages", requireUser, async (req: AuthenticatedRequest, res) => {
  const userId = getUserId(req) as string;
  const conversationId = req.params.id as string;
  const { content, type = "text" } = req.body;
  if (!content || content.trim().length === 0) {
    res.status(400).json({ error: "Content is required" });
    return;
  }

  try {
    // Verify user is part of this conversation
    const [conv] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, conversationId));

    if (!conv || !conv.participantIds.includes(userId)) {
      res.status(403).json({ error: "Not authorized for this conversation" });
      return;
    }

    const [msg] = await db
      .insert(messages)
      .values({
        conversationId,
        senderId: userId,
        content: content.trim(),
        type,
      })
      .returning();

    // Update conversation last message
    await db
      .update(conversations)
      .set({
        lastMessage: content.trim(),
        lastMessageAt: new Date(),
      })
      .where(eq(conversations.id, conversationId));

    res.status(201).json({ success: true, message: msg });
  } catch (err: any) {
    req.log.error(err, "send message error");
    res.status(500).json({ error: "Failed to send message" });
  }
});

export default router;
