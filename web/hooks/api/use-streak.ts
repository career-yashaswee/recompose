'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
export interface CalendarResponse {
  year: number;
  month: number;
  completedDays: number[];
  missedDays: number[];
  currentStreak: number;
  longestStreak: number;
}

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  totalCompleted: number;
  completionRate: number;
}

export interface MarkStreakCompleteRequest {
  date?: string; // ISO date string, defaults to today
}

export interface MarkStreakCompleteResponse {
  success: boolean;
  message: string;
  currentStreak: number;
  longestStreak: number;
}

// Query Keys
export const streakKeys = {
  all: ['streak'] as const,
  calendar: (year: number, month: number) =>
    [...streakKeys.all, 'calendar', { year, month }] as const,
  stats: () => [...streakKeys.all, 'stats'] as const,
};

// API Functions
const fetchStreakCalendar = async (
  year: number,
  month: number
): Promise<CalendarResponse> => {
  const response = await fetch(
    `/api/streak/calendar?year=${year}&month=${month}`
  );
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication required');
    }
    throw new Error('Failed to fetch streak calendar');
  }
  return response.json();
};

const fetchStreakStats = async (): Promise<StreakStats> => {
  const response = await fetch('/api/streak/stats');
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication required');
    }
    throw new Error('Failed to fetch streak stats');
  }
  return response.json();
};

const markStreakComplete = async (
  data: MarkStreakCompleteRequest
): Promise<MarkStreakCompleteResponse> => {
  const response = await fetch('/api/streak/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication required');
    }
    throw new Error('Failed to mark streak complete');
  }
  return response.json();
};

// Hooks
export const useStreakCalendar = (year: number, month: number) => {
  return useQuery({
    queryKey: streakKeys.calendar(year, month),
    queryFn: () => fetchStreakCalendar(year, month),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useStreakStats = () => {
  return useQuery({
    queryKey: streakKeys.stats(),
    queryFn: fetchStreakStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Mutations
export const useMarkStreakComplete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markStreakComplete,
    onMutate: async ({ date }) => {
      const targetDate = date ? new Date(date) : new Date();
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth() + 1;
      const day = targetDate.getDate();

      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: streakKeys.calendar(year, month),
      });
      await queryClient.cancelQueries({ queryKey: streakKeys.stats() });

      // Snapshot previous values
      const previousCalendar = queryClient.getQueryData<CalendarResponse>(
        streakKeys.calendar(year, month)
      );
      const previousStats = queryClient.getQueryData<StreakStats>(
        streakKeys.stats()
      );

      // Optimistically update calendar
      if (previousCalendar) {
        const updatedCalendar = {
          ...previousCalendar,
          completedDays: [...previousCalendar.completedDays, day].sort(
            (a, b) => a - b
          ),
          missedDays: previousCalendar.missedDays.filter(d => d !== day),
        };
        queryClient.setQueryData(
          streakKeys.calendar(year, month),
          updatedCalendar
        );
      }

      // Optimistically update stats
      if (previousStats) {
        const updatedStats = {
          ...previousStats,
          currentStreak: previousStats.currentStreak + 1,
          longestStreak: Math.max(
            previousStats.longestStreak,
            previousStats.currentStreak + 1
          ),
          totalCompleted: previousStats.totalCompleted + 1,
        };
        queryClient.setQueryData(streakKeys.stats(), updatedStats);
      }

      return { previousCalendar, previousStats, year, month, day };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousCalendar) {
        queryClient.setQueryData(
          streakKeys.calendar(context.year, context.month),
          context.previousCalendar
        );
      }
      if (context?.previousStats) {
        queryClient.setQueryData(streakKeys.stats(), context.previousStats);
      }
    },
    onSettled: (data, error, variables) => {
      const targetDate = variables.date ? new Date(variables.date) : new Date();
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth() + 1;

      // Invalidate and refetch
      queryClient.invalidateQueries({
        queryKey: streakKeys.calendar(year, month),
      });
      queryClient.invalidateQueries({ queryKey: streakKeys.stats() });
    },
  });
};
