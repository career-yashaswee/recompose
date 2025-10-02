'use client';

import React from 'react';
import { useCompositionHeatmap } from '@/hooks/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface HeatmapProps {
  className?: string;
}

/**
 * GitHub-style heatmap showing daily composition completions
 */
export default function CompositionHeatmap({
  className,
}: HeatmapProps): React.ReactElement {
  const { data, isLoading, error } = useCompositionHeatmap();

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Composition Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-sm text-slate-500'>Loading heatmap...</div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Composition Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-sm text-red-500'>Failed to load heatmap</div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Composition Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className='text-sm text-slate-500'>No data available</div>
        </CardContent>
      </Card>
    );
  }

  // Generate the past year's dates
  const generateYearDates = () => {
    const dates: Date[] = [];
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    // Start from the beginning of the week containing one year ago
    const startDate = new Date(oneYearAgo);
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);

    const currentDate = new Date(startDate);
    while (currentDate <= today) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  };

  const dates = generateYearDates();
  const weeks: Date[][] = [];

  // Group dates into weeks
  for (let i = 0; i < dates.length; i += 7) {
    weeks.push(dates.slice(i, i + 7));
  }

  const getIntensity = (count: number): string => {
    if (count === 0) return 'bg-slate-100 dark:bg-slate-800';
    if (count === 1) return 'bg-green-200 dark:bg-green-900';
    if (count === 2) return 'bg-green-300 dark:bg-green-800';
    if (count === 3) return 'bg-green-400 dark:bg-green-700';
    if (count === 4) return 'bg-green-500 dark:bg-green-600';
    return 'bg-green-600 dark:bg-green-500';
  };

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const getDateKey = (date: Date): string => {
    return formatDate(date);
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isFuture = (date: Date): boolean => {
    const today = new Date();
    return date > today;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle>
            {data.totalCompletions} submissions in the past one year
          </CardTitle>
          <div className='flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400'>
            <span>Total active days: {data.activeDays}</span>
            <span>Max streak: {data.maxStreak}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className='space-y-3'>
          {/* Heatmap Grid */}
          <div className='flex gap-1 overflow-x-auto pb-2'>
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className='flex flex-col gap-1'>
                {week.map((date, dayIndex) => {
                  const dateKey = getDateKey(date);
                  const count = data.dailyCompletions[dateKey] || 0;
                  const intensity = getIntensity(count);
                  const future = isFuture(date);
                  const today = isToday(date);

                  const tooltipText = future
                    ? `${formatDate(date)}: No activity`
                    : `${formatDate(date)}: ${count} submission${count !== 1 ? 's' : ''}`;

                  return (
                    <div key={dayIndex} className='relative group'>
                      <div
                        className={`
                          w-3 h-3 rounded-sm border border-slate-200 dark:border-slate-700
                          ${future ? 'bg-slate-50 dark:bg-slate-900' : intensity}
                          ${today ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                          hover:ring-2 hover:ring-slate-400 hover:ring-offset-1
                          transition-all duration-150 cursor-pointer
                        `}
                      />
                      {/* Tooltip */}
                      <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10'>
                        {tooltipText}
                        <div className='absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900 dark:border-t-slate-100'></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className='flex items-center justify-between text-xs text-slate-500 dark:text-slate-400'>
            <span>Less</span>
            <div className='flex gap-1'>
              <div className='w-3 h-3 rounded-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700' />
              <div className='w-3 h-3 rounded-sm bg-green-200 dark:bg-green-900 border border-slate-200 dark:border-slate-700' />
              <div className='w-3 h-3 rounded-sm bg-green-300 dark:bg-green-800 border border-slate-200 dark:border-slate-700' />
              <div className='w-3 h-3 rounded-sm bg-green-400 dark:bg-green-700 border border-slate-200 dark:border-slate-700' />
              <div className='w-3 h-3 rounded-sm bg-green-500 dark:bg-green-600 border border-slate-200 dark:border-slate-700' />
              <div className='w-3 h-3 rounded-sm bg-green-600 dark:bg-green-500 border border-slate-200 dark:border-slate-700' />
            </div>
            <span>More</span>
          </div>

          {/* Month Labels */}
          <div className='flex gap-1 text-xs text-slate-500 dark:text-slate-400'>
            {weeks.map((week, weekIndex) => {
              const firstDay = week[0];
              if (!firstDay) return null;

              // Only show month label for the first week of each month
              const isFirstWeekOfMonth = firstDay.getDate() <= 7;
              if (!isFirstWeekOfMonth)
                return <div key={weekIndex} className='w-3' />;

              const monthNames = [
                'Jan',
                'Feb',
                'Mar',
                'Apr',
                'May',
                'Jun',
                'Jul',
                'Aug',
                'Sep',
                'Oct',
                'Nov',
                'Dec',
              ];
              return (
                <div key={weekIndex} className='w-3 text-center'>
                  {monthNames[firstDay.getMonth()]}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
