"use client";

import { useMemo, useState } from "react";
import Calendar from "@/components/ui/calendar";
import { todayDateKeyIST } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type Stats = { current: number; longest: number };
type CalendarResponse = { dates: string[] };

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
  const queryClient = useQueryClient();

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
  const { data: calendarData } = useQuery<CalendarResponse>({
    queryKey: ["streak", "calendar", { year, month: month0 + 1 }],
    queryFn: async () => {
      const res = await fetch(`/api/streak/calendar?year=${year}&month=${month0 + 1}`);
      if (!res.ok) throw new Error("Failed to load calendar");
      return (await res.json()) as CalendarResponse;
    },
    staleTime: 1000 * 60 * 5,
  });
  const { data: stats } = useQuery<Stats>({
    queryKey: ["streak", "stats"],
    queryFn: async () => {
      const res = await fetch(`/api/streak/stats`);
      if (!res.ok) throw new Error("Failed to load stats");
      return (await res.json()) as Stats;
    },
    staleTime: 1000 * 60 * 5,
  });

  const markToday = useMutation({
    mutationFn: async (): Promise<void> => {
      const res = await fetch(`/api/streak/complete`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to complete today");
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["streak", "calendar"] });
      const previous = queryClient.getQueriesData<CalendarResponse>({ queryKey: ["streak", "calendar"] });
      previous.forEach(([key, value]) => {
        const dates = new Set(value?.dates ?? []);
        dates.add(todayKey);
        queryClient.setQueryData(key as unknown as [string, string, Record<string, unknown>], { dates: Array.from(dates) });
      });
      const prevStats = queryClient.getQueryData<Stats>(["streak", "stats"]);
      if (prevStats) {
        queryClient.setQueryData<Stats>(["streak", "stats"], {
          current: prevStats.current + 1,
          longest: Math.max(prevStats.longest, prevStats.current + 1),
        });
      }
      return { previous, prevStats } as const;
    },
    onError: (_err, _vars, ctx) => {
      ctx?.previous.forEach(([key, value]) => {
        queryClient.setQueryData(key as unknown as [string, string, Record<string, unknown>], value);
      });
      if (ctx?.prevStats) queryClient.setQueryData(["streak", "stats"], ctx.prevStats);
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["streak", "calendar"] }),
        queryClient.invalidateQueries({ queryKey: ["streak", "stats"] }),
      ]);
    },
  });

  return (
    <div className="space-y-4">
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
            ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
            const isFuture = key > todayKey;
            const isDone = new Set(calendarData?.dates ?? []).has(key);
            if (isFuture)
              return <span className="text-muted-foreground"></span>;
            if (isDone)
              return (
                <span className="text-blue-500 text-xl">
                  <Check className="size-4" />
                </span>
              );
            return (
              <span className="relative text-sm">
                {date.getDate()}
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 size-1.5 rounded-full bg-red-500" />
              </span>
            );
          },
        }}
      />

      <div className="flex items-center gap-4">
        <div>
          Current streak: <span className="font-medium">{stats?.current ?? 0}</span>
        </div>
        <div>
          Longest streak: <span className="font-medium">{stats?.longest ?? 0}</span>
        </div>
      </div>

      {!new Set(calendarData?.dates ?? []).has(todayKey) && (
        <Button onClick={() => markToday.mutate()}>Mark today as done</Button>
      )}
    </div>
  );
}
