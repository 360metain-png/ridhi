import { Router } from "express";
import { WebSocket } from "ws";
import { logger } from "../lib/logger";
import {
  joinQueue,
  removeFromQueue,
  startCallWithDeduct,
  finalizeCall,
  getQueueStats,
  getCallByUser,
  getCategories,
  tickAndChargeCoins,
  type MatchUser,
  type CallGender,
  type CallCategory,
} from "../lib/matchEngine";
import { requireUser, type AuthenticatedRequest, getUserId } from "../lib/auth";

const router = Router();

// Map of socketId → WebSocket connection
const sockets = new Map<string, WebSocket>();

// ── GET /api/calls/stats ───────────────────────────────────────────────────
router.get("/calls/stats", (_req, res) => {
  res.json(getQueueStats());
});

// ── GET /api/calls/categories ───────────────────────────────────────
router.get("/calls/categories", (_req, res) => {
  res.json(getCategories());
});

// ── GET /api/calls/active/:userId ─────────────────────────────────
// Requires authentication; callers may only query their own active call state.
router.get("/calls/active/:userId", requireUser, (req: AuthenticatedRequest, res) => {
  const requestedUserId = req.params.userId;
  const authenticatedUserId = getUserId(req);

  if (authenticatedUserId !== requestedUserId) {
    res.status(403).json({ error: "You can only query your own active call state." });
    return;
  }

  const call = getCallByUser(requestedUserId);
  if (call) {
    // Return only the data needed by the caller; omit internal socketId values
    res.json({
      active: true,
      call: {
        callId: call.callId,
        startedAt: call.startedAt,
        coinRate: call.coinRate,
        type: call.type,
        category: call.category,
        peer: call.userA.id === requestedUserId
          ? { id: call.userB.id, name: call.userB.name, gender: call.userB.gender, language: call.userB.language, avatar: call.userB.avatar, city: call.userB.city, age: call.userB.age }
          : { id: call.userA.id, name: call.userA.name, gender: call.userA.gender, language: call.userA.language, avatar: call.userA.avatar, city: call.userA.city, age: call.userA.age },
      },
    });
  } else {
    res.json({ active: false });
  }
});

// ── WebSocket message handler ────────────────────────────────────────────────
// authenticatedUserId is derived from the verified JWT at connection time in index.ts
export function handleCallSocket(ws: WebSocket, socketId: string, authenticatedUserId: string) {
  sockets.set(socketId, ws);

  ws.on("message", async (raw) => {
    let msg: any;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }

    switch (msg.type) {
      case "join": {
        // NOTE: coinRate is intentionally NOT destructured from the payload.
        // The coin rate is always resolved server-side by resolveCoinRate(callType)
        // in matchEngine.ts; any client-supplied coinRate is silently dropped here.
        const payload = msg.payload as Record<string, unknown>;
        const name = typeof payload["name"] === "string" ? payload["name"] : "";
        const gender = (["male", "female", "other"].includes(payload["gender"] as string)
          ? payload["gender"] : "other") as CallGender;
        const language = typeof payload["language"] === "string" ? payload["language"] : "Any";
        const category = (["any","art","dance","songs","romantic","technology","comedy","poetry","gaming","food","travel"].includes(payload["category"] as string)
          ? payload["category"] : "any") as CallCategory;
        const avatar = typeof payload["avatar"] === "string" ? payload["avatar"] : undefined;
        const city   = typeof payload["city"]   === "string" ? payload["city"]   : undefined;
        const age    = typeof payload["age"]    === "number" ? payload["age"]    : undefined;
        const bio    = typeof payload["bio"]    === "string" ? payload["bio"]    : undefined;
        const preferGender = (["Any","Male","Female"].includes(payload["preferGender"] as string)
          ? payload["preferGender"] : "Any") as "Any" | "Male" | "Female";
        const acceptAudio = payload["acceptAudio"] !== false;
        const acceptVideo = payload["acceptVideo"] !== false;
        // Validate callType server-side: only "audio" or "video" are accepted;
        // any other value is treated as "audio" (the cheaper default, not exploitable
        // because the rate is resolved by the server, not trusted from the client).
        const callType: "audio" | "video" = payload["callType"] === "video" ? "video" : "audio";

        // Always use the server-authenticated identity, never the client-supplied userId
        const userId = authenticatedUserId;

        const match = joinQueue({
          id: userId,
          name,
          gender,
          language,
          category,
          avatar,
          city,
          age,
          bio,
          preferGender,
          acceptAudio,
          acceptVideo,
          socketId,
        }, callType);

        if (match) {
          // We found a match! Server-authoritative billing: deduct upfront before starting call.
          // coinRate is resolved inside startCallWithDeduct → resolveCoinRate(callType);
          // the client-supplied value is never used.
          const callId = `call_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
          const deductResult = await startCallWithDeduct(
            callId,
            match,
            {
              id: userId,
              name,
              gender,
              language,
              category,
              avatar,
              city,
              socketId,
              joinedAt: Date.now(),
            },
            callType,
          );
          if (!deductResult.ok) {
            // One or both users couldn't pay ↔ notify both and end
            sendTo(match.socketId, {
              type: "call_ended",
              payload: { reason: "insufficient_coins", message: "Call cancelled: insufficient coins" },
            });
            sendTo(socketId, {
              type: "call_ended",
              payload: { reason: "insufficient_coins", message: "Call cancelled: insufficient coins" },
            });
            return;
          }
          const call = deductResult.call;

          // Send peer info back to both users. Only expose fields they chose to share.
          const aliasA = match.name?.trim() ? match.name : `Ridhi ${Math.floor(Math.random() * 1000) + 1}`;
          const aliasB = name?.trim() ? name : `Ridhi ${Math.floor(Math.random() * 1000) + 1}`;

          sendTo(match.socketId, {
            type: "matched",
            payload: {
              callId,
              peer: {
                id: userId,
                name: aliasB,
                gender,
                language,
                category,
                avatar: avatar || undefined,
                city: city || undefined,
                age: msg.payload.age || undefined,
                bio: msg.payload.bio || undefined,
              },
              callType: call.type,
              coinRate: call.coinRate,
            },
          });

          sendTo(socketId, {
            type: "matched",
            payload: {
              callId,
              peer: {
                id: match.id,
                name: aliasA,
                gender: match.gender,
                language: match.language,
                category: match.category,
                avatar: match.avatar || undefined,
                city: match.city || undefined,
                age: match.age || undefined,
                bio: match.bio || undefined,
              },
              callType: call.type,
              coinRate: call.coinRate,
            },
          });
        } else {
          sendTo(socketId, { type: "waiting", payload: { position: 1 } });
        }
        break;
      }

      case "accept": {
        const { callId } = msg.payload as { callId: string };
        // Verify the authenticated user is actually a participant in this call
        const call = getCallByUser(authenticatedUserId);
        if (call && call.callId === callId) {
          sendTo(call.userA.socketId, { type: "call_starting", payload: { callId } });
          sendTo(call.userB.socketId, { type: "call_starting", payload: { callId } });
        }
        break;
      }

      case "connected": {
        const { callId } = msg.payload as { callId: string };
        // Verify the authenticated user is actually a participant in this call
        const call = getCallByUser(authenticatedUserId);
        if (call && call.callId === callId) {
          sendTo(call.userA.socketId, { type: "call_connected", payload: { callId, startedAt: call.startedAt } });
          sendTo(call.userB.socketId, { type: "call_connected", payload: { callId, startedAt: call.startedAt } });
        }
        break;
      }

      case "disconnect": {
        const { callId } = msg.payload as { callId: string };
        const call = getCallByUser(authenticatedUserId);
        if (call && call.callId === callId) {
          // Idempotent finalize: settle -> end. Guards against double-settle
          // if the socket also closes immediately after disconnect.
          const ended = await finalizeCall(callId, authenticatedUserId);
          if (ended) {
            sendTo(ended.userA.socketId, {
              type: "call_ended",
              payload: {
                reason: "user_disconnected",
                endedBy: authenticatedUserId,
                durationSec: Math.floor((Date.now() - ended.startedAt) / 1000),
                coinsSpent: ended.userACoinsSpent,
              },
            });
            sendTo(ended.userB.socketId, {
              type: "call_ended",
              payload: {
                reason: "user_disconnected",
                endedBy: authenticatedUserId,
                durationSec: Math.floor((Date.now() - ended.startedAt) / 1000),
                coinsSpent: ended.userBCoinsSpent,
              },
            });
          }
        }
        break;
      }

      case "heartbeat": {
        sendTo(socketId, { type: "pong" });
        break;
      }
    }
  });

  ws.on("close", () => {
    sockets.delete(socketId);
    // End any active call that this authenticated user is part of
    for (const [callId, call] of getActiveCalls()) {
      if (call.userA.socketId === socketId || call.userB.socketId === socketId) {
        const endedBy = call.userA.socketId === socketId ? call.userA.id : call.userB.id;
        // Idempotent finalize: if a disconnect message already finalized, this is a no-op.
        finalizeCall(callId, endedBy).then((ended) => {
          if (ended) {
            const otherSocketId = call.userA.socketId === socketId ? call.userB.socketId : call.userA.socketId;
            sendTo(otherSocketId, {
              type: "call_ended",
              payload: { reason: "peer_disconnected", endedBy },
            });
          }
        });
      }
    }
  });
}

// ── Helpers ─────────────────────────────────────────────────────────────────────
function sendTo(socketId: string, msg: any) {
  const ws = sockets.get(socketId);
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(msg));
  }
}

function getActiveCalls() {
  const { activeCalls } = require("../lib/matchEngine");
  return activeCalls as Map<string, any>;
}

// Coin tick loop (every 30 seconds) — deducts real wallet coins; terminates on low balance
setInterval(() => {
  tickAndChargeCoins().then(({ updates, terminated }) => {
    // Send UI ticker to ongoing calls
    for (const up of updates) {
      const call = getCallByUser(up.userAId);
      if (call) {
        sendTo(call.userA.socketId, {
          type: "coin_tick",
          payload: { coinsSpent: up.userASpent },
        });
        sendTo(call.userB.socketId, {
          type: "coin_tick",
          payload: { coinsSpent: up.userBSpent },
        });
      }
    }
    // Notify both users of calls terminated by insufficient balance
    for (const t of terminated) {
      logger.warn({ callId: t.callId, userAId: t.userAId, userBId: t.userBId }, "call terminated: insufficient_balance");
      sendTo(t.userASocketId, {
        type: "call_ended",
        payload: { reason: "insufficient_balance", endedBy: "system" },
      });
      sendTo(t.userBSocketId, {
        type: "call_ended",
        payload: { reason: "insufficient_balance", endedBy: "system" },
      });
    }
  }).catch((err: unknown) => {
    logger.error({ err }, "coin tick billing error");
  });
}, 30000);

export default router;
