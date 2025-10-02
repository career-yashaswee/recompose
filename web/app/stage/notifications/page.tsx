'use client';

import { Bell, Check, MoreHorizontal, Search, Settings } from 'lucide-react';
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

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  category: 'system' | 'user' | 'composition';
  metadata?: Record<string, unknown>;
}

interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  systemNotifications: boolean;
  compositionNotifications: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'success',
    title: 'Composition Completed',
    message: "You successfully completed 'Daily Writing Practice' composition.",
    timestamp: '2h ago',
    isRead: false,
    category: 'composition',
    metadata: {
      compositionId: 'comp-123',
      compositionTitle: 'Daily Writing Practice',
    },
  },
  {
    id: '2',
    type: 'info',
    title: 'Welcome Back!',
    message:
      'You logged in successfully. Ready to continue your writing journey?',
    timestamp: '4h ago',
    isRead: true,
    category: 'system',
    metadata: { loginTime: '2024-01-15T10:30:00Z' },
  },
  {
    id: '3',
    type: 'success',
    title: 'Streak Milestone',
    message: "Congratulations! You've maintained a 7-day writing streak.",
    timestamp: '1d ago',
    isRead: true,
    category: 'user',
    metadata: { streakDays: 7 },
  },
  {
    id: '4',
    type: 'warning',
    title: 'Reminder',
    message:
      "Don't forget to complete today's writing practice to maintain your streak.",
    timestamp: '2d ago',
    isRead: true,
    category: 'system',
  },
  {
    id: '5',
    type: 'info',
    title: 'New Feature Available',
    message: 'Check out the new difficulty levels for compositions.',
    timestamp: '3d ago',
    isRead: true,
    category: 'system',
  },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);
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

  const unreadCount = notifications.filter(n => !n.isRead).length;
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

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleDeleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const getNotificationIcon = (type: Notification['type']) => {
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

  const getCategoryColor = (category: Notification['category']) => {
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
    <div className='container mx-auto p-6 max-w-4xl'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h1 className='text-3xl font-bold'>Notifications</h1>
          <p className='text-muted-foreground'>
            Stay updated with your writing progress and system updates
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='outline' size='sm'>
            <Settings className='h-4 w-4 mr-2' />
            Settings
          </Button>
          {unreadCount > 0 && (
            <Button onClick={handleMarkAllAsRead} size='sm'>
              <Check className='h-4 w-4 mr-2' />
              Mark all as read
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
                  <div className='space-y-4'>
                    {filteredNotifications.length === 0 ? (
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
                                    <span>{notification.timestamp}</span>
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
                                    >
                                      Mark as read
                                    </Button>
                                  )}
                                  <Button
                                    variant='ghost'
                                    size='icon'
                                    onClick={() =>
                                      handleDeleteNotification(notification.id)
                                    }
                                    className='h-8 w-8'
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
