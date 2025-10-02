'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
export interface UserPoint {
  id: string;
  points: number;
  reason: string;
  category: 'COMPOSITION_COMPLETE' | 'DAILY_STREAK' | 'WEEKLY_STREAK' | 'MONTHLY_STREAK' | 'FIRST_COMPLETION' | 'DIFFICULTY_BONUS' | 'ACHIEVEMENT';
  metadata?: any;
  createdAt: string;
}

export interface PointsData {
  totalPoints: number;
  currentStreak: number;
  recentPoints: UserPoint[];
}

// API functions
const getPoints = async (): Promise<PointsData> => {
  const response = await fetch('/api/points');
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication required');
    }
    throw new Error('Failed to get points data');
  }
  return response.json();
};

const createPoint = async (data: {
  points: number;
  reason: string;
  category: string;
  metadata?: any;
}): Promise<{ success: boolean; point: UserPoint }> => {
  const response = await fetch('/api/points', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication required');
    }
    throw new Error('Failed to create point');
  }
  return response.json();
};

// Query keys
export const pointsKeys = {
  all: ['points'] as const,
  user: () => [...pointsKeys.all, 'user'] as const,
};

// Hooks
export const usePoints = () => {
  return useQuery({
    queryKey: pointsKeys.user(),
    queryFn: getPoints,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: false,
  });
};

export const useCreatePoint = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPoint,
    onSuccess: () => {
      // Invalidate points query to refetch
      queryClient.invalidateQueries({ queryKey: pointsKeys.user() });
    },
  });
};
