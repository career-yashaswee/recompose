'use client';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { SiteHeader } from '@/components/site-header';
import { BreadcrumbsProvider } from '@/hooks/use-breadcrumbs';
import { useNotifications } from '@/context/notification-context';
import { authClient } from '@/lib/auth-client';
import { useEffect } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { notifyUserLogin } = useNotifications();

  useEffect(() => {
    const checkLoginStatus = async () => {
      const session = await authClient.getSession();
      if (session?.data?.user) {
        // Check if this is a recent login (within last 5 minutes)
        const lastLoginTime = localStorage.getItem('lastLoginTime');
        const now = Date.now();
        const fiveMinutesAgo = now - 5 * 60 * 1000;

        if (!lastLoginTime || parseInt(lastLoginTime) < fiveMinutesAgo) {
          // This is a new login, trigger notification
          notifyUserLogin(
            session.data.user.name || session.data.user.email || 'User'
          );
          localStorage.setItem('lastLoginTime', now.toString());
        }
      }
    };

    checkLoginStatus();
  }, [notifyUserLogin]);

  return (
    <div className='[--header-height:calc(--spacing(14))]'>
      <SidebarProvider className='flex flex-col'>
        <BreadcrumbsProvider>
          <SiteHeader />
          <div className='flex flex-1'>
            <AppSidebar />
            <SidebarInset>
              <div className='flex flex-1 flex-col gap-4 p-4'>{children}</div>
            </SidebarInset>
          </div>
        </BreadcrumbsProvider>
      </SidebarProvider>
    </div>
  );
}
