import { createServer } from "http";
import { WebSocketServer } from "ws";
import app from "./app";
import { logger } from "./lib/logger";
import { handleCallSocket } from "./routes/calls";

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
  const socketId = url.searchParams.get("id") || `ws_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  logger.info({ socketId }, "WebSocket call connection");
  handleCallSocket(ws, socketId);
});

server.listen(port, () => {
  logger.info({ port }, "Server listening with WebSocket calls");
});
