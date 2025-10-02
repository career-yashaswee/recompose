'use client';

import { useMemo, useState } from 'react';
import Calendar from '@/components/ui/calendar';
import { todayDateKeyIST } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import {
  useStreakCalendar,
  useStreakStats,
  useMarkStreakComplete,
} from '@/hooks/api';

function getMonthKey(date: Date): { year: number; month0: number } {
  return { year: date.getFullYear(), month0: date.getMonth() };
}

/**
 * CompletionCalendar: reusable streak calendar widget.
 * - Shows month calendar with ticks for completed, red dot + number for missed
 * - Disables future days
 * - Limits navigation to last 3 months up to current month
 * - Includes current and longest streak counters
 * - Includes "Mark today as done" button when not completed
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

  const markToday = useMarkStreakComplete();

  return (
    <div className='space-y-4'>
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
            if (isFuture)
              return <span className='text-muted-foreground'></span>;
            if (isDone)
              return (
                <span className='text-blue-500 text-xl'>
                  <Check className='size-4' />
                </span>
              );
            return (
              <span className='relative text-sm'>
                {date.getDate()}
                <span className='absolute -bottom-1 left-1/2 -translate-x-1/2 size-1.5 rounded-full bg-red-500' />
              </span>
            );
          },
        }}
      />

      <div className='flex items-center gap-4'>
        <div>
          Current streak:{' '}
          <span className='font-medium'>{stats?.currentStreak ?? 0}</span>
        </div>
        <div>
          Longest streak:{' '}
          <span className='font-medium'>{stats?.longestStreak ?? 0}</span>
        </div>
      </div>

      {!calendarData?.completedDays?.includes(
        parseInt(todayKey.split('-')[2])
      ) && (
        <Button
          onClick={() => markToday.mutate({})}
          disabled={markToday.isPending}
        >
          {markToday.isPending ? 'Marking...' : 'Mark today as done'}
        </Button>
      )}
    </div>
  );
}
