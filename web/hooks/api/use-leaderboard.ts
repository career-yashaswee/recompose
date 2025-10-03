import { useQuery } from '@tanstack/react-query';
import { LeaderboardTimeFilter } from '@/app/api/leaderboard/route';

export interface LeaderboardUser {
  id: string;
  name: string | null;
  image: string | null;
  rank: number;
  totalPoints: number;
  compositionsCompleted: number;
  currentStreak: number;
  badges: Array<{
    id: string;
    name: string;
    icon: string | null;
    tier: string;
  }>;
}

export interface LeaderboardResponse {
  leaderboard: LeaderboardUser[];
  currentUserRank: number;
  motivationalData: {
    message: string;
    pointsToNext: number;
    showMotivation: boolean;
  };
  timeFilter: LeaderboardTimeFilter;
}

export interface UseLeaderboardOptions {
  timeFilter?: LeaderboardTimeFilter;
  enabled?: boolean;
}

/**
 * Hook to fetch leaderboard data with time filtering
 */
export function useLeaderboard(options: UseLeaderboardOptions = {}) {
  const { timeFilter = 'all', enabled = true } = options;

  return useQuery<LeaderboardResponse>({
    queryKey: ['leaderboard', timeFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (timeFilter !== 'all') {
        params.set('time', timeFilter);
      }

      const response = await fetch(`/api/leaderboard?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard data');
      }

      return response.json();
    },
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook to get top 3 users for the leaderboard cards
 */
export function useLeaderboardTopThree(options: UseLeaderboardOptions = {}) {
  const { data, ...rest } = useLeaderboard(options);

  return {
    ...rest,
    data: data
      ? {
          topThree: data.leaderboard.slice(0, 3),
          remaining: data.leaderboard.slice(3),
          currentUserRank: data.currentUserRank,
          motivationalData: data.motivationalData,
          timeFilter: data.timeFilter,
        }
      : undefined,
  };
}

/**
 * Hook to get leaderboard table data (excluding top 3)
 */
export function useLeaderboardTable(options: UseLeaderboardOptions = {}) {
  const { data, ...rest } = useLeaderboard(options);

  return {
    ...rest,
    data: data
      ? {
          tableData: data.leaderboard.slice(3),
          currentUserRank: data.currentUserRank,
          timeFilter: data.timeFilter,
        }
      : undefined,
  };
}
