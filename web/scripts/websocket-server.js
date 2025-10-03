#!/usr/bin/env node

import { WebSocketServer } from "ws";
import http from "http";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

class NotificationWebSocketServer {
  constructor(port = 3001) {
    // Create HTTP server
    this.httpServer = http.createServer();

    // Create WebSocket server
    this.wss = new WebSocketServer({
      server: this.httpServer,
      path: "/notifications",
    });

    this.clients = new Map();
    this.setupEventHandlers();
    this.setupHttpRoutes();
    this.startHeartbeat();

    // Start the server
    this.httpServer.listen(port, () => {
      console.log(`🔔 WebSocket server started on port ${port}`);
      console.log(
        `📡 WebSocket endpoint: ws://localhost:${port}/notifications`
      );
      console.log(
        `📡 HTTP endpoint: http://localhost:${port}/emit-notification`
      );
    });
  }

  setupHttpRoutes() {
    this.httpServer.on("request", (req, res) => {
      // Enable CORS
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");

      if (req.method === "OPTIONS") {
        res.writeHead(200);
        res.end();
        return;
      }

      if (req.method === "POST" && req.url === "/emit-notification") {
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });

        req.on("end", () => {
          try {
            const { userId, notification } = JSON.parse(body);

            this.emitNotification(userId, notification);

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true }));
          } catch (error) {
            console.error("Error processing notification request:", error);
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Invalid request" }));
          }
        });
      } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Not found" }));
      }
    });
  }

  setupEventHandlers() {
    this.wss.on("connection", async (ws, request) => {
      try {
        // Extract token from query parameters
        const url = new URL(request.url, `http://${request.headers.host}`);
        const token = url.searchParams.get("token");

        if (!token) {
          ws.close(1008, "Authentication token required");
          return;
        }

        // Authenticate user
        const user = await prisma.user.findUnique({ where: { id: token } });
        if (!user) {
          ws.close(1008, "Invalid authentication token");
          return;
        }

        const userId = user.id;
        ws.userId = userId;
        ws.isAlive = true;

        // Add client to user's client list
        if (!this.clients.has(userId)) {
          this.clients.set(userId, []);
        }
        this.clients.get(userId).push(ws);

        // Send initial unread count
        try {
          const unreadCount = await prisma.notification.count({
            where: {
              userId: userId,
              isRead: false,
            },
          });

          this.sendToUser(userId, {
            type: "unread_count",
            data: { count: unreadCount },
          });
        } catch (error) {
          console.error("Error getting unread count:", error);
        }

        // Handle incoming messages
        ws.on("message", async (data) => {
          try {
            const message = JSON.parse(data.toString());
            await this.handleMessage(userId, message);
          } catch (error) {
            console.error("Error handling WebSocket message:", error);
          }
        });

        // Handle client disconnect
        ws.on("close", () => {
          this.removeClient(userId, ws);
        });

        // Handle pong responses
        ws.on("pong", () => {
          ws.isAlive = true;
        });
      } catch (error) {
        console.error("Error setting up WebSocket connection:", error);
        ws.close(1011, "Internal server error");
      }
    });
  }

  async handleMessage(userId, message) {
    try {
      switch (message.type) {
        case "mark_read":
          if (message.data.notificationId) {
            await prisma.notification.update({
              where: { id: message.data.notificationId },
              data: { isRead: true },
            });
          }
          break;
        case "mark_all_read":
          await prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
          });
          break;
        case "delete":
          if (message.data.notificationId) {
            await prisma.notification.delete({
              where: { id: message.data.notificationId },
            });
          }
          break;
        default:
          console.warn("Unknown message type:", message.type);
      }
    } catch (error) {
      console.error("Error handling message:", error);
    }
  }

  removeClient(userId, ws) {
    const userClients = this.clients.get(userId);
    if (userClients) {
      const index = userClients.indexOf(ws);
      if (index > -1) {
        userClients.splice(index, 1);
      }
      if (userClients.length === 0) {
        this.clients.delete(userId);
      }
    }
  }

  startHeartbeat() {
    const interval = setInterval(() => {
      this.wss.clients.forEach((ws) => {
        if (!ws.isAlive) {
          if (ws.userId) {
            this.removeClient(ws.userId, ws);
          }
          return ws.terminate();
        }

        ws.isAlive = false;
        ws.ping();
      });
    }, 30000); // 30 seconds

    this.wss.on("close", () => {
      clearInterval(interval);
    });
  }

  // Public methods for emitting events
  async emitNotification(userId, notification) {
    this.sendToUser(userId, {
      type: "notification",
      data: notification,
    });
  }

  sendToUser(userId, event) {
    const userClients = this.clients.get(userId);

    if (userClients) {
      const message = JSON.stringify(event);

      userClients.forEach((ws) => {
        if (ws.readyState === 1) {
          // WebSocket.OPEN
          ws.send(message);
        }
      });
    }
  }

  getConnectedUsers() {
    return Array.from(this.clients.keys());
  }

  getConnectionCount() {
    return Array.from(this.clients.values()).reduce(
      (total, clients) => total + clients.length,
      0
    );
  }
}

// Create and start the server
const server = new NotificationWebSocketServer(
  process.env.WEBSOCKET_PORT || 3001
);

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down WebSocket server...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n🛑 Shutting down WebSocket server...");
  process.exit(0);
});

// Export for use in other processes
export default server;
