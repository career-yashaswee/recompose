'use client';

import {
  Bell,
  Check,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotifications } from '@/context/notification-context';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  category: 'system' | 'user' | 'composition';
  metadata?: Record<string, unknown>;
  isExpanded?: boolean;
  actions?: {
    label: string;
    variant: 'default' | 'outline' | 'destructive';
    onClick: () => void;
  }[];
}

interface NotificationShadeProps {
  notifications?: Notification[];
  onMarkAllAsRead?: () => void;
  onNotificationClick?: (notification: Notification) => void;
  onNotificationDismiss?: (notificationId: string) => void;
}

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return <Check className='h-4 w-4 text-green-600' />;
    case 'warning':
      return (
        <div className='h-4 w-4 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold'>
          !
        </div>
      );
    case 'error':
      return (
        <div className='h-4 w-4 rounded-full bg-red-500 flex items-center justify-center text-white text-xs font-bold'>
          !
        </div>
      );
    default:
      return (
        <div className='h-4 w-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold'>
          i
        </div>
      );
  }
};

const getNotificationBgColor = (type: Notification['type']) => {
  switch (type) {
    case 'success':
      return 'bg-green-50 border-green-200';
    case 'warning':
      return 'bg-yellow-50 border-yellow-200';
    case 'error':
      return 'bg-red-50 border-red-200';
    default:
      return 'bg-blue-50 border-blue-200';
  }
};

export function NotificationShade({
  notifications: propNotifications,
  onMarkAllAsRead,
  onNotificationClick,
  onNotificationDismiss,
}: NotificationShadeProps) {
  const router = useRouter();
  const {
    notifications: contextNotifications,
    unreadCount,
    markAsRead,
    markAllAsRead: contextMarkAllAsRead,
    deleteNotification,
    fetchNotifications,
  } = useNotifications();

  const notifications = propNotifications || contextNotifications;

  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'system'>(
    'all'
  );
  const [expandedNotifications, setExpandedNotifications] = useState<
    Set<string>
  >(new Set());

  const allCount = notifications.length;
  const systemCount = notifications.filter(n => n.category === 'system').length;

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'unread') return !notification.isRead;
    if (activeTab === 'system') return notification.category === 'system';
    return true;
  });

  const handleToggleExpanded = (notificationId: string) => {
    const newExpanded = new Set(expandedNotifications);
    if (newExpanded.has(notificationId)) {
      newExpanded.delete(notificationId);
    } else {
      newExpanded.add(notificationId);
    }
    setExpandedNotifications(newExpanded);
  };

  const handleMarkAllAsRead = () => {
    if (onMarkAllAsRead) {
      onMarkAllAsRead();
    } else {
      contextMarkAllAsRead();
    }
  };

  const handleNotificationDismiss = (notificationId: string) => {
    if (onNotificationDismiss) {
      onNotificationDismiss(notificationId);
    } else {
      deleteNotification(notificationId);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (onNotificationClick) {
      onNotificationClick(notification);
    } else {
      // Default behavior: mark as read and navigate if it's a composition
      if (!notification.isRead) {
        markAsRead(notification.id);
      }

      if (
        notification.category === 'composition' &&
        notification.metadata?.compositionId
      ) {
        router.push(`/compositions/${notification.metadata.compositionId}`);
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='icon' className='relative'>
          <Bell className='h-5 w-5' />
          {unreadCount > 0 && (
            <Badge
              variant='destructive'
              className='absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs'
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-96 p-0' sideOffset={8}>
        <div className='bg-background border rounded-lg shadow-lg'>
          {/* Header */}
          <div className='flex items-center justify-between p-4 border-b'>
            <h3 className='text-lg font-semibold'>Notifications Shade</h3>
            <div className='flex items-center gap-2'>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8'
                onClick={() => fetchNotifications()}
              >
                <RefreshCw className='h-4 w-4' />
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className='flex border-b'>
            <button
              onClick={() => setActiveTab('all')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'all'
                  ? 'text-foreground border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              All
              {allCount > 0 && (
                <Badge variant='secondary' className='ml-2 h-5 px-1.5 text-xs'>
                  {allCount}
                </Badge>
              )}
            </button>
            <button
              onClick={() => setActiveTab('unread')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'unread'
                  ? 'text-foreground border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Unread
              {unreadCount > 0 && (
                <Badge
                  variant='destructive'
                  className='ml-2 h-5 px-1.5 text-xs'
                >
                  {unreadCount}
                </Badge>
              )}
            </button>
            <button
              onClick={() => setActiveTab('system')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === 'system'
                  ? 'text-foreground border-b-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              System
              {systemCount > 0 && (
                <Badge variant='secondary' className='ml-2 h-5 px-1.5 text-xs'>
                  {systemCount}
                </Badge>
              )}
            </button>
          </div>

          {/* Notifications List */}
          <div className='max-h-96 overflow-y-auto'>
            {filteredNotifications.length === 0 ? (
              <div className='p-8 text-center text-muted-foreground'>
                <Bell className='h-12 w-12 mx-auto mb-4 opacity-50' />
                <p>No notifications</p>
              </div>
            ) : (
              filteredNotifications.map(notification => (
                <div
                  key={notification.id}
                  className={`border-b last:border-b-0 transition-colors ${
                    !notification.isRead ? 'bg-muted/30' : ''
                  }`}
                >
                  <div
                    className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${getNotificationBgColor(
                      notification.type
                    )}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className='flex items-start gap-3'>
                      <div className='flex-shrink-0 mt-0.5'>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center justify-between'>
                          <h4 className='text-sm font-medium text-foreground'>
                            {notification.title}
                          </h4>
                          <div className='flex items-center gap-2'>
                            <span className='text-xs text-muted-foreground'>
                              {notification.timestamp}
                            </span>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity'
                              onClick={e => {
                                e.stopPropagation();
                                handleNotificationDismiss(notification.id);
                              }}
                            >
                              <X className='h-3 w-3' />
                            </Button>
                          </div>
                        </div>
                        {notification.message && (
                          <div className='mt-1'>
                            <p className='text-sm text-muted-foreground line-clamp-2'>
                              {notification.message}
                            </p>
                          </div>
                        )}
                        {expandedNotifications.has(notification.id) && (
                          <div className='mt-3 flex gap-2'>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={e => {
                                e.stopPropagation();
                                handleNotificationDismiss(notification.id);
                              }}
                            >
                              Dismiss
                            </Button>
                          </div>
                        )}
                      </div>
                      {notification.message && (
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-6 w-6 flex-shrink-0'
                          onClick={e => {
                            e.stopPropagation();
                            handleToggleExpanded(notification.id);
                          }}
                        >
                          {expandedNotifications.has(notification.id) ? (
                            <ChevronUp className='h-3 w-3' />
                          ) : (
                            <ChevronDown className='h-3 w-3' />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className='flex items-center justify-between p-4 border-t bg-muted/30'>
            <Button
              variant='link'
              size='sm'
              onClick={handleMarkAllAsRead}
              className='h-auto p-0 text-sm'
            >
              <Check className='h-4 w-4 mr-1' />
              Mark all as read
            </Button>

            <Button
              variant='outline'
              size='sm'
              onClick={() => router.push('/notifications')}
            >
              View all notifications
            </Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
