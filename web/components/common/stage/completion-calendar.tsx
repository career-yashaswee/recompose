'use client';

import { useMemo, useState, useEffect } from 'react';
import Calendar from '@/components/ui/calendar';
import { todayDateKeyIST } from '@/lib/utils';
import { Check, Calendar as CalendarIcon } from 'lucide-react';
import { useStreakCalendar, useStreakStats } from '@/hooks/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';

function getMonthKey(date: Date): { year: number; month0: number } {
  return { year: date.getFullYear(), month0: date.getMonth() };
}

// Fetch today's daily composition
const fetchDailyComposition = async () => {
  const response = await fetch('/api/daily-composition');
  if (!response.ok) {
    if (response.status === 404) {
      return null; // No daily composition assigned
    }
    throw new Error('Failed to fetch daily composition');
  }
  return response.json();
};

/**
 * CompletionCalendar: LeetCode-style daily composition streak calendar.
 * - Shows month calendar with ticks for completed daily compositions
 * - Red dots for missed daily compositions (only past dates)
 * - Disables future days
 * - Limits navigation to last 3 months up to current month
 * - Includes current and longest streak counters
 * - Shows today's daily composition and completion status
 * - Automatically detects completion based on user progress
 * - Shows missed days count for the entire month
 */
export default function CompletionCalendar(): React.ReactElement {
  const [cursor, setCursor] = useState<Date>(new Date());

  const todayKey = todayDateKeyIST();

  const fromMonth = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() - 3, 1);
  }, []);

  const toMonth = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }, []);

  const { year, month0 } = getMonthKey(cursor);
  const { data: calendarData } = useStreakCalendar(year, month0 + 1);
  const { data: stats } = useStreakStats();
  const queryClient = useQueryClient();

  // Fetch today's daily composition
  const { data: dailyComposition, isLoading: isLoadingDaily } = useQuery({
    queryKey: ['daily-composition'],
    queryFn: fetchDailyComposition,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 30000, // Refetch every 30 seconds to check for updates
  });

  // Auto-refresh calendar data when daily composition status changes
  useEffect(() => {
    if (dailyComposition?.userProgress === 'SOLVED') {
      // Invalidate streak calendar and stats to refresh data
      queryClient.invalidateQueries({ queryKey: ['streak'] });
    }
  }, [dailyComposition?.userProgress, queryClient]);

  const todayDay = parseInt(todayKey.split('-')[2]);
  const isTodayCompleted =
    calendarData?.completedDays?.includes(todayDay) ?? false;

  // Calculate missed days for the month
  const missedDaysCount = calendarData?.missedDays?.length ?? 0;
  const completedDaysCount = calendarData?.completedDays?.length ?? 0;
  const totalDaysInMonth = new Date(year, month0 + 1, 0).getDate();

  return (
    <div className='space-y-4'>
      {/* Today's Daily Composition */}
      {isLoadingDaily ? (
        <div className='p-4 border rounded-lg'>
          <div className='animate-pulse'>
            <div className='h-4 bg-gray-200 rounded w-3/4 mb-2'></div>
            <div className='h-3 bg-gray-200 rounded w-1/2'></div>
          </div>
        </div>
      ) : dailyComposition ? (
        <div className='p-4 border rounded-lg bg-blue-50 dark:bg-blue-950'>
          <div className='flex items-center gap-2 mb-2'>
            <CalendarIcon className='size-4 text-blue-600' />
            <span className='text-sm font-medium text-blue-900 dark:text-blue-100'>
              Today&apos;s Daily Composition
            </span>
          </div>
          <div className='space-y-1'>
            <h3 className='font-medium text-blue-900 dark:text-blue-100'>
              {dailyComposition.composition.title}
            </h3>
            <div className='flex items-center gap-2 text-sm'>
              <span
                className={`px-2 py-1 rounded text-xs font-medium ${
                  dailyComposition.composition.difficulty === 'EASY'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : dailyComposition.composition.difficulty === 'MEDIUM'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}
              >
                {dailyComposition.composition.difficulty}
              </span>
              <span className='text-blue-700 dark:text-blue-300'>
                Status: {dailyComposition.userProgress}
              </span>
              {isTodayCompleted && (
                <span className='text-green-700 dark:text-green-300 font-medium'>
                  ✓ Completed
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className='p-4 border rounded-lg bg-gray-50 dark:bg-gray-900'>
          <div className='text-center text-gray-600 dark:text-gray-400'>
            <CalendarIcon className='size-8 mx-auto mb-2 opacity-50' />
            <p className='text-sm'>No daily composition assigned for today</p>
          </div>
        </div>
      )}

      {/* Calendar */}
      <Calendar
        month={cursor}
        onMonthChange={setCursor}
        fromMonth={fromMonth}
        toMonth={toMonth}
        modifiers={{ disabled: [{ after: new Date() }] }}
        components={{
          DayContent: ({ date, displayMonth }) => {
            if (date.getMonth() !== displayMonth.getMonth()) return <span />;
            const key = `${date.getFullYear()}-${String(
              date.getMonth() + 1
            ).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            const isFuture = key > todayKey;
            const isDone =
              calendarData?.completedDays?.includes(date.getDate()) ?? false;
            const isMissed =
              calendarData?.missedDays?.includes(date.getDate()) ?? false;

            if (isFuture) {
              return <span className='text-muted-foreground'></span>;
            }

            if (isDone) {
              return (
                <span className='text-green-600 text-xl'>
                  <Check className='size-4' />
                </span>
              );
            }

            if (isMissed) {
              return (
                <span className='relative text-sm'>
                  {date.getDate()}
                  <span className='absolute -bottom-1 left-1/2 -translate-x-1/2 size-1.5 rounded-full bg-red-500' />
                </span>
              );
            }

            return <span className='text-sm'>{date.getDate()}</span>;
          },
        }}
      />

      {/* Streak Stats */}
      {/* <div className='space-y-3'>
        <div className='flex items-center gap-4 text-sm'>
          <div>
            Current streak:{' '}
            <span className='font-medium text-green-600'>
              {stats?.currentStreak ?? 0}
            </span>
          </div>
          <div>
            Longest streak:{' '}
            <span className='font-medium text-blue-600'>
              {stats?.longestStreak ?? 0}
            </span>
          </div>
          {stats?.completionRate !== undefined && (
            <div>
              Completion rate:{' '}
              <span className='font-medium text-purple-600'>
                {stats.completionRate}%
              </span>
            </div>
          )}
        </div> */}

      {/* Monthly Stats */}
      {/* <div className='p-3 bg-gray-50 dark:bg-gray-900 rounded-lg'>
          <div className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
            This Month (
            {new Date(year, month0).toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric',
            })}
            )
          </div>
          <div className='flex items-center gap-4 text-sm'>
            <div className='flex items-center gap-1'>
              <Check className='size-3 text-green-600' />
              <span className='text-gray-600 dark:text-gray-400'>
                Completed:
              </span>
              <span className='font-medium text-green-600'>
                {completedDaysCount}
              </span>
            </div>
            <div className='flex items-center gap-1'>
              <div className='size-3 rounded-full bg-red-500'></div>
              <span className='text-gray-600 dark:text-gray-400'>Missed:</span>
              <span className='font-medium text-red-600'>
                {missedDaysCount}
              </span>
            </div>
            <div className='text-gray-600 dark:text-gray-400'>
              Total: <span className='font-medium'>{totalDaysInMonth}</span>
            </div>
          </div>
        </div> */}
      {/* </div> */}

      {/* Status Message */}
      {/* {dailyComposition && (
        <div className='text-center text-sm'>
          {isTodayCompleted ? (
            <span className='text-green-600 dark:text-green-400 font-medium'>
              ✓ Today&apos;s daily composition completed!
            </span>
          ) : dailyComposition.userProgress === 'SOLVED' ? (
            <span className='text-green-600 dark:text-green-400 font-medium'>
              ✓ Daily composition solved! Calendar will update automatically.
            </span>
          ) : dailyComposition.userProgress === 'ATTEMPTING' ? (
            <span className='text-yellow-600 dark:text-yellow-400'>
              🔄 Working on today&apos;s daily composition...
            </span>
          ) : (
            <span className='text-gray-600 dark:text-gray-400'>
              Complete today&apos;s daily composition to maintain your streak
            </span>
          )}
        </div>
      )} */}
    </div>
  );
}
