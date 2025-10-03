'use client';

import { Badge } from '@/hooks/api/use-badges';
import { BadgeCard } from './badge-card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface BadgeGridProps {
  badges: Badge[];
  isLoading?: boolean;
  className?: string;
}

export function BadgeGrid({ badges, isLoading, className }: BadgeGridProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
          className
        )}
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className='h-64 w-full' />
        ))}
      </div>
    );
  }

  if (badges.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <div className='text-gray-500 text-lg mb-2'>No badges available</div>
        <p className='text-gray-400 text-sm'>
          Badges will appear here as you complete activities on the platform.
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
        className
      )}
    >
      {badges.map(badge => (
        <BadgeCard key={badge.id} badge={badge} />
      ))}
    </div>
  );
}
