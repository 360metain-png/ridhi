import { createServer } from "http";
import { WebSocketServer } from "ws";
import app from "./app";
import { logger } from "./lib/logger";
import { handleCallSocket } from "./routes/calls";
import { verifyToken } from "./lib/auth";
import { pool } from "@workspace/db";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const server = createServer(app);
const wss = new WebSocketServer({ server, path: "/ws/calls" });

wss.on("connection", (ws, req) => {
  const url = new URL(req.url || "/", `http://${req.headers.host}`);
  const token = url.searchParams.get("token");

  if (!token) {
    logger.warn("WebSocket connection rejected: no token provided");
    ws.close(4001, "Authentication required");
    return;
  }

  const payload = verifyToken(token);
  if (!payload || payload.type !== "user") {
    logger.warn("WebSocket connection rejected: invalid token");
    ws.close(4001, "Invalid or expired token");
    return;
  }

  const socketId = url.searchParams.get("id") || `ws_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  logger.info({ socketId, userId: payload.sub }, "WebSocket call connection");
  handleCallSocket(ws, socketId, payload.sub);
});

server.listen(port, () => {
  logger.info({ port }, "Server listening with WebSocket calls");
});

// ── Graceful shutdown ───────────────────────────────────────────────────────
async function gracefulShutdown(signal: string) {
  logger.info({ signal }, "Shutting down gracefully");
  server.close(() => {
    logger.info("HTTP server closed");
  });
  wss.close(() => {
    logger.info("WebSocket server closed");
  });
  try {
    await pool.end();
    logger.info("Database pool drained");
  } catch {
    /* ignore */
  }
  process.exit(0);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("uncaughtException", (err) => {
  logger.fatal({ err: err.message, stack: err.stack }, "Uncaught exception");
  // Give logger time to flush before exiting
  setTimeout(() => process.exit(1), 500);
});

process.on("unhandledRejection", (reason) => {
  const message = reason instanceof Error ? reason.message : String(reason);
  logger.error({ reason: message }, "Unhandled promise rejection");
});
