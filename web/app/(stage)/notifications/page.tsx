'use client';

import {
  Bell,
  Check,
  MoreHorizontal,
  Search,
  RefreshCw,
} from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useNotifications } from '@/context/notification-context';
import {
  useNotifications as useNotificationsQuery,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
  type NotificationData as APINotificationData,
} from '@/hooks/api/use-notifications';
import { type NotificationData as ContextNotificationData } from '@/lib/notification-socket';

// Unified notification type that handles both API and context notifications
type UnifiedNotification = APINotificationData | ContextNotificationData;

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  systemNotifications: boolean;
  compositionNotifications: boolean;
}

export default function NotificationsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<
    'all' | 'unread' | 'system' | 'composition'
  >('all');
  const [settings, setSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    systemNotifications: true,
    compositionNotifications: true,
  });

  // Use notification context for real-time updates
  const {
    notifications: contextNotifications,
    unreadCount: contextUnreadCount,
    markAsRead: contextMarkAsRead,
    markAllAsRead: contextMarkAllAsRead,
    deleteNotification: contextDeleteNotification,
    fetchNotifications,
  } = useNotifications();

  // Use API hooks for data fetching with filters
  const {
    data: notificationsData,
    isLoading,
    error,
    refetch,
  } = useNotificationsQuery({
    category:
      activeTab === 'system'
        ? 'system'
        : activeTab === 'composition'
          ? 'composition'
          : undefined,
    isRead: activeTab === 'unread' ? false : undefined,
  });

  // Mutation hooks
  const markAsReadMutation = useMarkNotificationAsRead();
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();
  const deleteNotificationMutation = useDeleteNotification();

  // Use context notifications as fallback if API data is not available
  const notifications =
    notificationsData?.notifications || contextNotifications;
  const unreadCount = notificationsData?.unreadCount || contextUnreadCount;
  const systemCount = notifications.filter(n => n.category === 'system').length;
  const compositionCount = notifications.filter(
    n => n.category === 'composition'
  ).length;

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === 'unread') return !notification.isRead;
    if (activeTab === 'system') return notification.category === 'system';
    if (activeTab === 'composition')
      return notification.category === 'composition';
    return true;
  });

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markAsReadMutation.mutateAsync(notificationId);
      // Also update context for real-time updates
      contextMarkAsRead(notificationId);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsReadMutation.mutateAsync();
      // Also update context for real-time updates
      contextMarkAllAsRead();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await deleteNotificationMutation.mutateAsync(notificationId);
      // Also update context for real-time updates
      contextDeleteNotification(notificationId);
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleRefresh = () => {
    refetch();
    fetchNotifications();
  };

  const getNotificationIcon = (type: UnifiedNotification['type']) => {
    switch (type) {
      case 'success':
        return <Check className='h-4 w-4 text-green-600' />;
      case 'warning':
        return (
          <div className='h-4 w-4 rounded-full bg-yellow-500 flex items-center justify-center text-white text-xs font-bold'>
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

  const getCategoryColor = (category: UnifiedNotification['category']) => {
    switch (category) {
      case 'system':
        return 'bg-blue-100 text-blue-800';
      case 'composition':
        return 'bg-green-100 text-green-800';
      case 'user':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className='container p-2'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-3xl font-bold'>Notifications</h1>
          <p className='text-muted-foreground'>
            Stay updated with your composition progress and system updates
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
          {/* <Button variant='outline' size='sm'>
            <Settings className='h-4 w-4 mr-2' />
            Settings
          </Button> */}
          {unreadCount > 0 && (
            <Button
              onClick={handleMarkAllAsRead}
              size='sm'
              disabled={markAllAsReadMutation.isPending}
            >
              <Check className='h-4 w-4 mr-2' />
              {markAllAsReadMutation.isPending
                ? 'Marking...'
                : 'Mark all as read'}
            </Button>
          )}
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
        {/* Main Content */}
        <div className='lg:col-span-3'>
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle>Your Notifications</CardTitle>
                  <CardDescription>
                    {filteredNotifications.length} notification
                    {filteredNotifications.length !== 1 ? 's' : ''}
                  </CardDescription>
                </div>
                <div className='flex items-center gap-2'>
                  <div className='relative'>
                    <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                    <Input
                      placeholder='Search notifications...'
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className='pl-10 w-64'
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
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
                    {notifications.length > 0 && (
                      <Badge
                        variant='secondary'
                        className='ml-2 h-5 px-1.5 text-xs'
                      >
                        {notifications.length}
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
                      <Badge
                        variant='secondary'
                        className='ml-2 h-5 px-1.5 text-xs'
                      >
                        {systemCount}
                      </Badge>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('composition')}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${
                      activeTab === 'composition'
                        ? 'text-foreground border-b-2 border-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Compositions
                    {compositionCount > 0 && (
                      <Badge
                        variant='secondary'
                        className='ml-2 h-5 px-1.5 text-xs'
                      >
                        {compositionCount}
                      </Badge>
                    )}
                  </button>
                </div>

                <div className='mt-6'>
                  {error && (
                    <div className='mb-4 p-4 bg-red-50 border border-red-200 rounded-lg'>
                      <p className='text-red-800 text-sm'>
                        Failed to load notifications. Please try refreshing.
                      </p>
                    </div>
                  )}

                  <div className='space-y-4'>
                    {isLoading ? (
                      <div className='text-center py-12'>
                        <RefreshCw className='h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50 animate-spin' />
                        <h3 className='text-lg font-medium mb-2'>
                          Loading notifications...
                        </h3>
                        <p className='text-muted-foreground'>
                          Please wait while we fetch your notifications.
                        </p>
                      </div>
                    ) : filteredNotifications.length === 0 ? (
                      <div className='text-center py-12'>
                        <Bell className='h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50' />
                        <h3 className='text-lg font-medium mb-2'>
                          No notifications
                        </h3>
                        <p className='text-muted-foreground'>
                          {searchQuery
                            ? 'No notifications match your search.'
                            : "You're all caught up!"}
                        </p>
                      </div>
                    ) : (
                      filteredNotifications.map(notification => (
                        <div
                          key={notification.id}
                          className={`p-4 rounded-lg border transition-colors ${
                            !notification.isRead
                              ? 'bg-muted/50 border-primary/20'
                              : 'bg-background hover:bg-muted/30'
                          }`}
                        >
                          <div className='flex items-start gap-3'>
                            <div className='flex-shrink-0 mt-1'>
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className='flex-1 min-w-0'>
                              <div className='flex items-start justify-between'>
                                <div className='flex-1'>
                                  <div className='flex items-center gap-2 mb-1'>
                                    <h4 className='text-sm font-medium'>
                                      {notification.title}
                                    </h4>
                                    <Badge
                                      variant='secondary'
                                      className={`text-xs ${getCategoryColor(notification.category)}`}
                                    >
                                      {notification.category}
                                    </Badge>
                                  </div>
                                  <p className='text-sm text-muted-foreground mb-2'>
                                    {notification.message}
                                  </p>
                                  <div className='flex items-center gap-4 text-xs text-muted-foreground'>
                                    <span>
                                      {'createdAt' in notification
                                        ? new Date(
                                            notification.createdAt
                                          ).toLocaleString()
                                        : notification.timestamp || 'Unknown'}
                                    </span>
                                    {!notification.isRead && (
                                      <span className='text-primary font-medium'>
                                        Unread
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className='flex items-center gap-1'>
                                  {!notification.isRead && (
                                    <Button
                                      variant='ghost'
                                      size='sm'
                                      onClick={() =>
                                        handleMarkAsRead(notification.id)
                                      }
                                      className='h-8 px-2 text-xs'
                                      disabled={markAsReadMutation.isPending}
                                    >
                                      {markAsReadMutation.isPending
                                        ? 'Marking...'
                                        : 'Mark as read'}
                                    </Button>
                                  )}
                                  <Button
                                    variant='ghost'
                                    size='icon'
                                    onClick={() =>
                                      handleDeleteNotification(notification.id)
                                    }
                                    className='h-8 w-8'
                                    disabled={
                                      deleteNotificationMutation.isPending
                                    }
                                  >
                                    <MoreHorizontal className='h-4 w-4' />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Sidebar */}
        <div className='lg:col-span-1'>
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Notification Settings</CardTitle>
              <CardDescription>
                Manage your notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium'>Email Notifications</p>
                  <p className='text-xs text-muted-foreground'>
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={checked =>
                    setSettings(prev => ({
                      ...prev,
                      emailNotifications: checked,
                    }))
                  }
                />
              </div>
              <Separator />
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium'>Push Notifications</p>
                  <p className='text-xs text-muted-foreground'>
                    Browser push notifications
                  </p>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={checked =>
                    setSettings(prev => ({
                      ...prev,
                      pushNotifications: checked,
                    }))
                  }
                />
              </div>
              <Separator />
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium'>System Notifications</p>
                  <p className='text-xs text-muted-foreground'>
                    Login, updates, reminders
                  </p>
                </div>
                <Switch
                  checked={settings.systemNotifications}
                  onCheckedChange={checked =>
                    setSettings(prev => ({
                      ...prev,
                      systemNotifications: checked,
                    }))
                  }
                />
              </div>
              <Separator />
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium'>
                    Composition Notifications
                  </p>
                  <p className='text-xs text-muted-foreground'>
                    Completion, progress updates
                  </p>
                </div>
                <Switch
                  checked={settings.compositionNotifications}
                  onCheckedChange={checked =>
                    setSettings(prev => ({
                      ...prev,
                      compositionNotifications: checked,
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
