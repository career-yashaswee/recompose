'use client';

import * as React from 'react';
import { Command, SquareTerminal, Trophy, BarChart3 } from 'lucide-react';

import { NavMain } from '@/components/nav-main';
import { NavProjects } from '@/components/nav-projects';
import { NavSecondary } from '@/components/nav-secondary';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { authClient } from '@/lib/auth-client';
import { UserDisplayData } from '@/lib/types';
import { Premium } from './common/premium';

const data = {
  navMain: [
    {
      title: 'Learn',
      url: '#',
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: 'Compositions',
          url: 'compositions',
        },
        {
          title: 'Kanban',
          url: 'kanban',
        },
      ],
    },
    {
      title: 'Badges',
      url: 'badges',
      icon: Trophy,
      isActive: false,
    },
    {
      title: 'Leaderboard',
      url: 'leaderboard',
      icon: BarChart3,
      isActive: false,
    },
  ],
  navSecondary: [],
  projects: [],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = authClient.useSession();

  return (
    <Sidebar
      className='top-(--header-height) h-[calc(100svh-var(--header-height))]!'
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size='lg' asChild>
              <a href='#'>
                <div className='bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg'>
                  <Command className='size-4' />
                </div>
                <div className='grid flex-1 text-left text-sm leading-tight'>
                  <span className='truncate font-medium'>Recompose</span>
                  <span className='truncate text-xs'>Stage</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className='mt-auto' />
      </SidebarContent>
      <SidebarFooter>
        <div className='p-1'>
          <Premium />
        </div>
        {session?.user && (
          <NavUser
            user={
              {
                name: session.user.name || 'User',
                email: session.user.email || '',
                avatar:
                  session.user.image || 'https://ui.shadcn.com/placeholder.svg',
              } as UserDisplayData
            }
          />
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
