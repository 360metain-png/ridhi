import { createServer } from "http";
import { WebSocketServer } from "ws";
import app from "./app";
import { logger } from "./lib/logger";
import { handleCallSocket } from "./routes/calls";
import { verifyToken } from "./lib/auth";

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
