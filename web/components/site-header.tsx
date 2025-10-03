'use client';

import { SidebarIcon } from 'lucide-react';
import { Fragment } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useSidebar } from '@/components/ui/sidebar';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import ModeToggle from '@/components/ui/mode-toggle';
import { NotificationShade } from '@/components/ui/notification-shade';
import { PointsStreakDisplay } from '@/components/ui/points-streak-display';
import { useBreadcrumbs } from '@/hooks/use-breadcrumbs';

export function SiteHeader() {
  const { toggleSidebar } = useSidebar();
  const { items } = useBreadcrumbs();

  return (
    <header className='bg-background sticky top-0 z-50 flex w-full items-center border-b'>
      <div className='flex h-(--header-height) w-full items-center gap-2 px-4'>
        <Button
          className='h-8 w-8'
          variant='ghost'
          size='icon'
          onClick={toggleSidebar}
        >
          <SidebarIcon />
        </Button>
        <Separator orientation='vertical' className='mr-2 h-4' />
        <Breadcrumb className='hidden sm:block'>
          <BreadcrumbList>
            {items.map((item, index) => {
              const isLast = index === items.length - 1;
              return (
                <Fragment key={item.href}>
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>{item.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={item.href}>
                        {item.label}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator />}
                </Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
        {/* <SearchForm className='w-full sm:ml-auto sm:w-auto' /> */}
        <div className='w-full sm:ml-auto sm:w-auto' />
        <PointsStreakDisplay />
        <NotificationShade />
        <LanguageSwitcher />
        <ModeToggle />
      </div>
    </header>
  );
}
