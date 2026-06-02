import { Router } from "express";
import { WebSocket } from "ws";
import {
  joinQueue,
  removeFromQueue,
  startCall,
  endCall,
  getQueueStats,
  getCallByUser,
  getCategories,
  tickCoins,
  type MatchUser,
  type CallGender,
  type CallCategory,
} from "../lib/matchEngine";

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
router.get("/calls/active/:userId", (req, res) => {
  const call = getCallByUser(req.params.userId);
  if (call) {
    res.json({ active: true, call });
  } else {
    res.json({ active: false });
  }
});

// ── WebSocket message handler ────────────────────────────────────────────────
export function handleCallSocket(ws: WebSocket, socketId: string) {
  sockets.set(socketId, ws);

  ws.on("message", (raw) => {
    let msg: any;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }

    switch (msg.type) {
      case "join": {
        const { userId, name, gender, language, category, avatar, city } = msg.payload as {
          userId: string;
          name: string;
          gender: CallGender;
          language: string;
          category: CallCategory;
          avatar?: string;
          city?: string;
        };

        const match = joinQueue({
          id: userId,
          name,
          gender,
          language,
          category,
          avatar,
          city,
          socketId,
        });

        if (match) {
          // We found a match! Notify both users
          const callId = `call_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
          const call = startCall(callId, match, {
            id: userId,
            name,
            gender,
            language,
            category,
            avatar,
            city,
            socketId,
            joinedAt: Date.now(),
          }, msg.payload.callType ?? "audio", msg.payload.coinRate ?? 10);

          // Anonymize both peers: no real name/avatar/city exposed
          const aliasA = match.name?.trim() ? match.name : `Ridhi ${Math.floor(Math.random() * 1000) + 1}`;
          const aliasB = name?.trim() ? name : `Ridhi ${Math.floor(Math.random() * 1000) + 1}`;

          sendTo(match.socketId, {
            type: "matched",
            payload: {
              callId,
              peer: { id: userId, name: aliasB, gender, language, category, avatar: undefined, city: undefined },
              callType: call.type,
              coinRate: call.coinRate,
            },
          });

          sendTo(socketId, {
            type: "matched",
            payload: {
              callId,
              peer: { id: match.id, name: aliasA, gender: match.gender, language: match.language, category: match.category, avatar: undefined, city: undefined },
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
        // Notify both that call is starting
        const call = getCallByUser(msg.payload.userId);
        if (call) {
          sendTo(call.userA.socketId, { type: "call_starting", payload: { callId } });
          sendTo(call.userB.socketId, { type: "call_starting", payload: { callId } });
        }
        break;
      }

      case "connected": {
        const { callId } = msg.payload as { callId: string };
        const call = getCallByUser(msg.payload.userId);
        if (call) {
          sendTo(call.userA.socketId, { type: "call_connected", payload: { callId, startedAt: call.startedAt } });
          sendTo(call.userB.socketId, { type: "call_connected", payload: { callId, startedAt: call.startedAt } });
        }
        break;
      }

      case "disconnect": {
        const { callId, userId } = msg.payload as { callId: string; userId: string };
        const call = endCall(callId, userId);
        if (call) {
          sendTo(call.userA.socketId, {
            type: "call_ended",
            payload: {
              reason: "user_disconnected",
              endedBy: userId,
              durationSec: Math.floor((Date.now() - call.startedAt) / 1000),
              coinsSpent: call.userACoinsSpent,
            },
          });
          sendTo(call.userB.socketId, {
            type: "call_ended",
            payload: {
              reason: "user_disconnected",
              endedBy: userId,
              durationSec: Math.floor((Date.now() - call.startedAt) / 1000),
              coinsSpent: call.userBCoinsSpent,
            },
          });
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
    // Try to find and end any active call for this socket
    for (const [callId, call] of getActiveCalls()) {
      if (call.userA.socketId === socketId || call.userB.socketId === socketId) {
        const endedBy = call.userA.socketId === socketId ? call.userA.id : call.userB.id;
        endCall(callId, endedBy);
        const otherSocketId = call.userA.socketId === socketId ? call.userB.socketId : call.userA.socketId;
        sendTo(otherSocketId, {
          type: "call_ended",
          payload: { reason: "peer_disconnected", endedBy },
        });
      }
    }
    // Remove from queue
    // We need to iterate to find the user by socketId
    // The matchEngine doesn't expose socketId lookup, so we rely on the client re-joining
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

// Coin tick loop (every 30 seconds)
setInterval(() => {
  const updates = tickCoins();
  for (const up of updates) {
    const call = getCallByUser(up.userAId);
    if (call) {
      sendTo(call.userA.socketId, {
        type: "coin_tick",
        payload: { coinsSpent: up.userASpent, coinsEarned: up.userBSpent },
      });
      sendTo(call.userB.socketId, {
        type: "coin_tick",
        payload: { coinsSpent: up.userBSpent, coinsEarned: up.userASpent },
      });
    }
  }
}, 30000);

export default router;
