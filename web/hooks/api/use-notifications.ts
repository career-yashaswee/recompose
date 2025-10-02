'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: string;
  category: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  notifications: NotificationData[];
  total: number;
  unreadCount: number;
}

export interface MarkNotificationReadRequest {
  notificationId: string;
}

export interface MarkAllNotificationsReadResponse {
  success: boolean;
  updatedCount: number;
}

// Query Keys
export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...notificationKeys.lists(), filters] as const,
  unreadCount: () => [...notificationKeys.all, 'unreadCount'] as const,
};

// API Functions
const fetchNotifications = async (filters?: {
  category?: string;
  isRead?: boolean;
  limit?: number;
  offset?: number;
}): Promise<NotificationsResponse> => {
  const params = new URLSearchParams();
  if (filters?.category) params.set('category', filters.category);
  if (filters?.isRead !== undefined)
    params.set('isRead', String(filters.isRead));
  if (filters?.limit) params.set('limit', String(filters.limit));
  if (filters?.offset) params.set('offset', String(filters.offset));

  const response = await fetch(`/api/notifications?${params.toString()}`);
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication required');
    }
    throw new Error('Failed to fetch notifications');
  }
  return response.json();
};

const markNotificationAsRead = async (
  notificationId: string
): Promise<{ success: boolean }> => {
  const response = await fetch(`/api/notifications/${notificationId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isRead: true }),
  });
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication required');
    }
    throw new Error('Failed to mark notification as read');
  }
  return response.json();
};

const markAllNotificationsAsRead =
  async (): Promise<MarkAllNotificationsReadResponse> => {
    const response = await fetch('/api/notifications/mark-all-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required');
      }
      throw new Error('Failed to mark all notifications as read');
    }
    return response.json();
  };

const deleteNotification = async (
  notificationId: string
): Promise<{ success: boolean }> => {
  const response = await fetch(`/api/notifications/${notificationId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication required');
    }
    throw new Error('Failed to delete notification');
  }
  return response.json();
};

// Hooks
export const useNotifications = (filters?: {
  category?: string;
  isRead?: boolean;
  limit?: number;
  offset?: number;
}) => {
  return useQuery({
    queryKey: notificationKeys.list(filters || {}),
    queryFn: () => fetchNotifications(filters),
    staleTime: 1000 * 60 * 1, // 1 minute
    refetchInterval: 1000 * 30, // Refetch every 30 seconds for real-time updates
  });
};

export const useUnreadNotificationCount = () => {
  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () =>
      fetchNotifications({ isRead: false, limit: 1 }).then(res => ({
        count: res.unreadCount,
      })),
    staleTime: 1000 * 30, // 30 seconds
    refetchInterval: 1000 * 30, // Refetch every 30 seconds
  });
};

// Mutations
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationAsRead,
    onMutate: async (notificationId: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: notificationKeys.lists() });

      // Get all notification queries
      const previousQueries = queryClient.getQueriesData<NotificationsResponse>(
        {
          queryKey: notificationKeys.lists(),
        }
      );

      // Optimistically update all notification lists
      previousQueries.forEach(([queryKey, data]) => {
        if (data) {
          const updatedData = {
            ...data,
            notifications: data.notifications.map(notification =>
              notification.id === notificationId
                ? { ...notification, isRead: true }
                : notification
            ),
            unreadCount: Math.max(0, data.unreadCount - 1),
          };
          queryClient.setQueryData(queryKey, updatedData);
        }
      });

      // Update unread count
      queryClient.setQueryData(
        notificationKeys.unreadCount(),
        (old: unknown) => ({
          count: Math.max(0, ((old as { count?: number })?.count || 0) - 1),
        })
      );

      return { previousQueries, notificationId };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      context?.previousQueries.forEach(([queryKey, data]) => {
        if (data) {
          queryClient.setQueryData(queryKey, data);
        }
      });
    },
    onSettled: () => {
      // Invalidate all notification queries
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: notificationKeys.unreadCount(),
      });
    },
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: notificationKeys.lists() });

      // Get all notification queries
      const previousQueries = queryClient.getQueriesData<NotificationsResponse>(
        {
          queryKey: notificationKeys.lists(),
        }
      );

      // Optimistically update all notification lists
      previousQueries.forEach(([queryKey, data]) => {
        if (data) {
          const updatedData = {
            ...data,
            notifications: data.notifications.map(notification => ({
              ...notification,
              isRead: true,
            })),
            unreadCount: 0,
          };
          queryClient.setQueryData(queryKey, updatedData);
        }
      });

      // Update unread count
      queryClient.setQueryData(notificationKeys.unreadCount(), { count: 0 });

      return { previousQueries };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      context?.previousQueries.forEach(([queryKey, data]) => {
        if (data) {
          queryClient.setQueryData(queryKey, data);
        }
      });
    },
    onSettled: () => {
      // Invalidate all notification queries
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: notificationKeys.unreadCount(),
      });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNotification,
    onMutate: async (notificationId: string) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: notificationKeys.lists() });

      // Get all notification queries
      const previousQueries = queryClient.getQueriesData<NotificationsResponse>(
        {
          queryKey: notificationKeys.lists(),
        }
      );

      // Optimistically update all notification lists
      previousQueries.forEach(([queryKey, data]) => {
        if (data) {
          const notification = data.notifications.find(
            n => n.id === notificationId
          );
          const wasUnread = notification && !notification.isRead;

          const updatedData = {
            ...data,
            notifications: data.notifications.filter(
              n => n.id !== notificationId
            ),
            unreadCount: wasUnread
              ? Math.max(0, data.unreadCount - 1)
              : data.unreadCount,
          };
          queryClient.setQueryData(queryKey, updatedData);
        }
      });

      // Update unread count if the deleted notification was unread
      const allNotifications = queryClient.getQueryData<NotificationsResponse>(
        notificationKeys.list({})
      );
      const deletedNotification = allNotifications?.notifications.find(
        n => n.id === notificationId
      );
      if (deletedNotification && !deletedNotification.isRead) {
        queryClient.setQueryData(
          notificationKeys.unreadCount(),
          (old: unknown) => ({
            count: Math.max(0, ((old as { count?: number })?.count || 0) - 1),
          })
        );
      }

      return { previousQueries, notificationId };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      context?.previousQueries.forEach(([queryKey, data]) => {
        if (data) {
          queryClient.setQueryData(queryKey, data);
        }
      });
    },
    onSettled: () => {
      // Invalidate all notification queries
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: notificationKeys.unreadCount(),
      });
    },
  });
};
