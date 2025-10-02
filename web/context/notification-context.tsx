"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import {
  notificationSocket,
  NotificationData,
  NotificationTypes,
} from "@/lib/notification-socket";

interface NotificationContextType {
  notifications: NotificationData[];
  unreadCount: number;
  addNotification: (notification: NotificationData) => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
  fetchNotifications: () => Promise<void>;
  // Helper methods for common notifications
  notifyUserLogin: (userName: string) => void;
  notifyCompositionCompleted: (
    compositionTitle: string,
    compositionId: string
  ) => void;
  notifyStreakMilestone: (streakDays: number) => void;
  notifyStreakReminder: () => void;
  notifySystemUpdate: (updateMessage: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  // Initialize with some mock notifications for demo
  // Fetch notifications from server on mount and initialize WebSocket
  useEffect(() => {
    fetchNotifications();
    
    // Initialize WebSocket connection with delay to ensure auth is ready
    setTimeout(() => {
      notificationSocket.connect();
    }, 1000);
  }, []);

  // Socket event handlers
  useEffect(() => {
    const unsubscribeNotification = notificationSocket.on(
      "notification",
      (notification: unknown) => {
        setNotifications((prev) => [notification as NotificationData, ...prev]);
      }
    );

    const unsubscribeMarkRead = notificationSocket.on(
      "mark_read",
      (data: unknown) => {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === (data as { notificationId: string }).notificationId ? { ...n, isRead: true } : n
          )
        );
      }
    );

    const unsubscribeMarkAllRead = notificationSocket.on(
      "mark_all_read",
      () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    );

    const unsubscribeDelete = notificationSocket.on(
      "delete",
      (data: unknown) => {
        setNotifications((prev) =>
          prev.filter((n) => n.id !== (data as { notificationId: string }).notificationId)
        );
      }
    );

    return () => {
      unsubscribeNotification();
      unsubscribeMarkRead();
      unsubscribeMarkAllRead();
      unsubscribeDelete();
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const addNotification = (notification: NotificationData) => {
    setNotifications((prev) => [notification, ...prev]);
  };

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
    );
    notificationSocket.markNotificationAsRead(notificationId);
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    notificationSocket.markAllNotificationsAsRead();
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    notificationSocket.deleteNotification(notificationId);
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications");
      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }
      
      const data = await response.json();
      
      if (data.notifications) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  // Helper methods for common notifications
  const notifyUserLogin = (userName: string) => {
    const notification = NotificationTypes.USER_LOGIN(userName);
    addNotification(notification);
  };

  const notifyCompositionCompleted = (
    compositionTitle: string,
    compositionId: string
  ) => {
    const notification = NotificationTypes.COMPOSITION_COMPLETED(
      compositionTitle,
      compositionId
    );
    
    addNotification(notification);
  };

  const notifyStreakMilestone = (streakDays: number) => {
    const notification = NotificationTypes.STREAK_MILESTONE(streakDays);
    addNotification(notification);
  };

  const notifyStreakReminder = () => {
    const notification = NotificationTypes.STREAK_REMINDER();
    addNotification(notification);
  };

  const notifySystemUpdate = (updateMessage: string) => {
    const notification = NotificationTypes.SYSTEM_UPDATE(updateMessage);
    addNotification(notification);
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    fetchNotifications,
    notifyUserLogin,
    notifyCompositionCompleted,
    notifyStreakMilestone,
    notifyStreakReminder,
    notifySystemUpdate,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications(): NotificationContextType {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return context;
}
