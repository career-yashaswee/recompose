import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authClient } from '@/lib/auth-client';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon?: string;
  criteria: {
    type:
      | 'compositions_completed'
      | 'compositions_liked'
      | 'streak_days'
      | 'points_earned';
    count: number;
    difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  };
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  category: 'COMPOSITION' | 'ENGAGEMENT' | 'STREAK' | 'ACHIEVEMENT';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  userProgress: {
    id: string | null;
    userId: string;
    badgeId: string;
    isEarned: boolean;
    progress: number;
    earnedAt: string | null;
  };
}

export interface BadgeProgress {
  totalBadges: number;
  earnedBadges: number;
  inProgressBadges: number;
  badgesByCategory: Record<string, { earned: number; total: number }>;
  recentBadges: Array<{
    id: string;
    badgeId: string;
    isEarned: boolean;
    progress: number;
    earnedAt: string;
    badge: Badge;
  }>;
}

/**
 * Hook to fetch all badges with user progress
 */
export function useBadges() {
  const { data: session } = authClient.useSession();

  return useQuery({
    queryKey: ['badges'],
    queryFn: async (): Promise<{ badges: Badge[] }> => {
      const response = await fetch('/api/badges');
      if (!response.ok) {
        throw new Error('Failed to fetch badges');
      }
      return response.json();
    },
    enabled: !!session?.user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a specific badge with user progress
 */
export function useBadge(badgeId: string) {
  const { data: session } = authClient.useSession();

  return useQuery({
    queryKey: ['badge', badgeId],
    queryFn: async (): Promise<{
      badge: Badge;
      userProgress: Badge['userProgress'];
    }> => {
      const response = await fetch(`/api/badges/${badgeId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch badge');
      }
      return response.json();
    },
    enabled: !!session?.user && !!badgeId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch user's badge progress summary
 */
export function useBadgeProgress() {
  const { data: session } = authClient.useSession();

  return useQuery({
    queryKey: ['badge-progress'],
    queryFn: async (): Promise<BadgeProgress> => {
      const response = await fetch('/api/badges/user-progress');
      if (!response.ok) {
        throw new Error('Failed to fetch badge progress');
      }
      return response.json();
    },
    enabled: !!session?.user,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to create a new badge (admin only)
 */
export function useCreateBadge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (badgeData: {
      name: string;
      description: string;
      icon?: string;
      criteria: Badge['criteria'];
      tier?: Badge['tier'];
      category: Badge['category'];
    }) => {
      const response = await fetch('/api/badges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(badgeData),
      });

      if (!response.ok) {
        throw new Error('Failed to create badge');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['badges'] });
    },
  });
}

/**
 * Hook to update a badge (admin only)
 */
export function useUpdateBadge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      badgeId,
      badgeData,
    }: {
      badgeId: string;
      badgeData: Partial<Badge>;
    }) => {
      const response = await fetch(`/api/badges/${badgeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(badgeData),
      });

      if (!response.ok) {
        throw new Error('Failed to update badge');
      }

      return response.json();
    },
    onSuccess: (_, { badgeId }) => {
      queryClient.invalidateQueries({ queryKey: ['badges'] });
      queryClient.invalidateQueries({ queryKey: ['badge', badgeId] });
    },
  });
}

/**
 * Hook to delete a badge (admin only)
 */
export function useDeleteBadge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (badgeId: string) => {
      const response = await fetch(`/api/badges/${badgeId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete badge');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['badges'] });
    },
  });
}
