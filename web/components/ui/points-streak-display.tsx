'use client';

import { Coins, Flame } from 'lucide-react';
import { usePoints } from '@/hooks/api';

export function PointsStreakDisplay() {
  const { data, isLoading } = usePoints();

  if (isLoading) {
    return (
      <div className='flex items-center gap-2'>
        <div className='flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md'>
          <Flame className='h-4 w-4 text-orange-500' />
          <span className='text-sm text-slate-600 dark:text-slate-400'>-</span>
        </div>
        <div className='flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-md'>
          <Coins className='h-4 w-4 text-yellow-500' />
          <span className='text-sm text-slate-600 dark:text-slate-400'>-</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className='flex items-center gap-3'>
      {/* Current Streak */}
      <div className='flex items-center gap-1 px-2 py-1 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800 rounded-md'>
        <Flame className='h-4 w-4 text-orange-500' />
        <span className='text-sm font-medium text-orange-700 dark:text-orange-300'>
          {data.currentStreak}
        </span>
      </div>

      {/* Total Points */}
      <div className='flex items-center gap-1 px-2 py-1 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-md'>
        <Coins className='h-4 w-4 text-yellow-500' />
        <span className='text-sm font-medium text-yellow-700 dark:text-yellow-300'>
          {data.totalPoints.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
