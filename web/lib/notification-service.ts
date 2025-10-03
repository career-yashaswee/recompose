import prisma from '@/lib/prisma';
import { NotificationType, NotificationCategory } from '@prisma/client';

export interface CreateNotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  category: NotificationCategory;
  metadata?: Record<string, unknown>;
}

export interface NotificationFilters {
  category?: NotificationCategory;
  isRead?: boolean;
  limit?: number;
  offset?: number;
}

export class NotificationService {
  /**
   * Create a new notification
   */
  static async createNotification(data: CreateNotificationData) {
    try {
      const notification = await prisma.notification.create({
        data: {
          userId: data.userId,
          type: data.type,
          title: data.title,
          message: data.message,
          category: data.category,
          metadata: data.metadata
            ? JSON.parse(JSON.stringify(data.metadata))
            : undefined,
        },
      });

      // Emit WebSocket event
      await this.emitNotificationEvent(data.userId, notification);

      return notification;
    } catch (error) {
      console.error('Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Get notifications for a user with optional filtering
   */
  static async getUserNotifications(
    userId: string,
    filters: NotificationFilters = {}
  ) {
    try {
      const where: Record<string, unknown> = {
        userId,
      };

      if (filters.category) {
        where.category = filters.category;
      }

      if (filters.isRead !== undefined) {
        where.isRead = filters.isRead;
      }

      const notifications = await prisma.notification.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        take: filters.limit || 50,
        skip: filters.offset || 0,
      });

      const total = await prisma.notification.count({ where });
      const unreadCount = await prisma.notification.count({
        where: {
          userId,
          isRead: false,
        },
      });

      return {
        notifications,
        total,
        unreadCount,
      };
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      throw error;
    }
  }

  /**
   * Mark a notification as read
   */
  static async markAsRead(userId: string, notificationId: string) {
    try {
      const notification = await prisma.notification.findFirst({
        where: {
          id: notificationId,
          userId,
        },
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      const updatedNotification = await prisma.notification.update({
        where: {
          id: notificationId,
        },
        data: {
          isRead: true,
        },
      });

      // Emit WebSocket event
      await this.emitNotificationUpdateEvent(userId, updatedNotification);

      return updatedNotification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: string) {
    try {
      const result = await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });

      // Emit WebSocket event
      await this.emitMarkAllReadEvent(userId);

      return result;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(userId: string, notificationId: string) {
    try {
      const notification = await prisma.notification.findFirst({
        where: {
          id: notificationId,
          userId,
        },
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      await prisma.notification.delete({
        where: {
          id: notificationId,
        },
      });

      // Emit WebSocket event
      await this.emitNotificationDeleteEvent(userId, notificationId);

      return { success: true };
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  /**
   * Get unread count for a user
   */
  static async getUnreadCount(userId: string) {
    try {
      return await prisma.notification.count({
        where: {
          userId,
          isRead: false,
        },
      });
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }

  // Helper methods for common notification types
  static async notifyUserLogin(userId: string, userName: string) {
    return this.createNotification({
      userId,
      type: NotificationType.SUCCESS,
      title: 'Welcome Back!',
      message: `You logged in successfully. Ready to continue your writing journey?`,
      category: NotificationCategory.SYSTEM,
      metadata: { userName, loginTime: new Date().toISOString() },
    });
  }

  static async notifyCompositionCompleted(
    userId: string,
    compositionTitle: string,
    compositionId: string
  ) {
    return this.createNotification({
      userId,
      type: NotificationType.SUCCESS,
      title: 'Composition Completed',
      message: `You successfully completed '${compositionTitle}' composition.`,
      category: NotificationCategory.COMPOSITION,
      metadata: { compositionId, compositionTitle },
    });
  }

  static async notifyStreakMilestone(userId: string, streakDays: number) {
    return this.createNotification({
      userId,
      type: NotificationType.SUCCESS,
      title: 'Streak Milestone',
      message: `Congratulations! You've maintained a ${streakDays}-day writing streak.`,
      category: NotificationCategory.USER,
      metadata: { streakDays },
    });
  }

  static async notifyStreakReminder(userId: string) {
    return this.createNotification({
      userId,
      type: NotificationType.WARNING,
      title: 'Streak Reminder',
      message:
        "Don't forget to complete today's writing practice to maintain your streak.",
      category: NotificationCategory.SYSTEM,
    });
  }

  static async notifySystemUpdate(userId: string, updateMessage: string) {
    return this.createNotification({
      userId,
      type: NotificationType.INFO,
      title: 'System Update',
      message: updateMessage,
      category: NotificationCategory.SYSTEM,
    });
  }

  // WebSocket event emitters
  private static async emitNotificationEvent(
    userId: string,
    notification: Record<string, unknown>
  ) {
    try {
      const wsServerUrl =
        process.env.WEBSOCKET_SERVER_URL || 'http://localhost:3001';

      try {
        const response = await fetch(`${wsServerUrl}/emit-notification`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            notification,
          }),
        });

        if (!response.ok) {
          console.error('Failed to emit notification:', response.status);
        }
      } catch (fetchError) {
        console.error('Error calling WebSocket server:', fetchError);
      }
    } catch (error) {
      console.error('Error emitting notification event:', error);
    }
  }

  private static async emitNotificationUpdateEvent(
    userId: string,
    notification: Record<string, unknown>
  ) {
    try {
      const server = await import('../scripts/websocket-server');
      await server.default.emitNotification(userId, notification);
    } catch (error) {
      console.error('Error emitting notification update event:', error);
    }
  }

  private static async emitNotificationDeleteEvent(
    userId: string,
    notificationId: string
  ) {
    try {
      const server = await import('../scripts/websocket-server');
      await server.default.sendToUser(userId, {
        type: 'delete',
        data: { notificationId },
      });
    } catch (error) {
      console.error('Error emitting notification delete event:', error);
    }
  }

  private static async emitMarkAllReadEvent(userId: string) {
    try {
      const server = await import('../scripts/websocket-server');
      await server.default.sendToUser(userId, {
        type: 'mark_all_read',
        data: { userId },
      });
    } catch (error) {
      console.error('Error emitting mark all read event:', error);
    }
  }
}
