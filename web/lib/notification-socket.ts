"use client";

import { authClient } from "@/lib/auth-client";

export interface NotificationData {
  id: string;
  type: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  category: "system" | "user" | "composition";
  metadata?: Record<string, unknown>;
}

export interface NotificationSocketEvent {
  type: "notification" | "mark_read" | "mark_all_read" | "delete";
  data: NotificationData | { notificationId: string } | { userId: string };
}

class NotificationSocket {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private listeners: Map<string, Set<(data: unknown) => void>> = new Map();
  private isConnecting = false;

  constructor() {
    // Don't auto-connect, let the context handle it
  }

  public async connect(): Promise<void> {
    if (this.isConnecting || this.socket?.readyState === WebSocket.OPEN) {
      return;
    }

    this.isConnecting = true;

    try {
      const session = await authClient.getSession();

      if (!session?.data?.user?.id) {
        this.isConnecting = false;
        return;
      }

      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:3001";
      const token = session.data.user.id;
      this.socket = new WebSocket(`${wsUrl}/notifications?token=${token}`);

      this.socket.onopen = () => {
        this.reconnectAttempts = 0;
        this.isConnecting = false;
        this.emit("connected", {});
      };

      this.socket.onmessage = (event) => {
        try {
          const message: NotificationSocketEvent = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error("Error parsing socket message:", error);
        }
      };

      this.socket.onclose = (event) => {
        this.isConnecting = false;
        this.socket = null;

        if (
          !event.wasClean &&
          this.reconnectAttempts < this.maxReconnectAttempts
        ) {
          this.scheduleReconnect();
        }
      };

      this.socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        this.isConnecting = false;
      };
    } catch (error) {
      console.error("Error connecting to notification socket:", error);
      this.isConnecting = false;
    }
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

    setTimeout(() => {
      this.connect();
    }, delay);
  }

  private handleMessage(message: NotificationSocketEvent): void {
    switch (message.type) {
      case "notification":
        this.emit("notification", message.data as NotificationData);
        break;
      case "mark_read":
        this.emit("mark_read", message.data);
        break;
      case "mark_all_read":
        this.emit("mark_all_read", message.data);
        break;
      case "delete":
        this.emit("delete", message.data);
        break;
      default:
        console.warn("Unknown socket message type:", message.type);
    }
  }

  public on(event: string, callback: (data: unknown) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  public emit(event: string, data: unknown): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in socket event listener for ${event}:`, error);
        }
      });
    }
  }

  public send(event: string, data: unknown): void {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type: event, data }));
    } else {
      console.warn("Socket not connected, cannot send message:", event, data);
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.close(1000, "Client disconnect");
      this.socket = null;
    }
  }

  public isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  // Helper methods for common operations
  public markNotificationAsRead(notificationId: string): void {
    this.send("mark_read", { notificationId });
  }

  public markAllNotificationsAsRead(): void {
    this.send("mark_all_read", {});
  }

  public deleteNotification(notificationId: string): void {
    this.send("delete", { notificationId });
  }
}

// Create singleton instance
export const notificationSocket = new NotificationSocket();

// Helper function to create notification data
export const createNotification = (
  type: NotificationData["type"],
  title: string,
  message: string,
  category: NotificationData["category"],
  metadata?: Record<string, unknown>
): NotificationData => {
  return {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type,
    title,
    message,
    timestamp: new Date().toISOString(),
    isRead: false,
    category,
    metadata,
  };
};

// Common notification types for the app
export const NotificationTypes = {
  USER_LOGIN: (userName: string) =>
    createNotification(
      "success",
      "Welcome Back!",
      `You logged in successfully. Ready to continue your writing journey?`,
      "system",
      { userName, loginTime: new Date().toISOString() }
    ),

  COMPOSITION_COMPLETED: (compositionTitle: string, compositionId: string) =>
    createNotification(
      "success",
      "Composition Completed",
      `You successfully completed '${compositionTitle}' composition.`,
      "composition",
      { compositionId, compositionTitle }
    ),

  STREAK_MILESTONE: (streakDays: number) =>
    createNotification(
      "success",
      "Streak Milestone",
      `Congratulations! You've maintained a ${streakDays}-day writing streak.`,
      "user",
      { streakDays }
    ),

  STREAK_REMINDER: () =>
    createNotification(
      "warning",
      "Streak Reminder",
      "Don't forget to complete today's writing practice to maintain your streak.",
      "system"
    ),

  SYSTEM_UPDATE: (updateMessage: string) =>
    createNotification("info", "System Update", updateMessage, "system"),
} as const;
