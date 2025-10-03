'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query';
import { pointsKeys } from './use-points';

// Types
export interface Composition {
  id: string;
  title: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isFavorite: boolean;
  status: 'SOLVED' | 'ATTEMPTING' | 'UNSOLVED' | null;
  likes: number;
  userReaction: 'LIKE' | 'DISLIKE' | null;
}

export interface CompositionsResponse {
  total: number;
  page: number;
  pageSize: number;
  data: Composition[];
}

export interface CompositionStats {
  easy: { solved: number; total: number };
  medium: { solved: number; total: number };
  hard: { solved: number; total: number };
  attempting: number;
}

export interface CompositionProgress {
  status: 'SOLVED' | 'ATTEMPTING' | 'UNSOLVED' | null;
}

export interface CompositionReaction {
  likes: number;
  dislikes: number;
  userReaction: 'LIKE' | 'DISLIKE' | null;
}

// Query Keys
export const compositionKeys = {
  all: ['compositions'] as const,
  lists: () => [...compositionKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...compositionKeys.lists(), filters] as const,
  details: () => [...compositionKeys.all, 'detail'] as const,
  detail: (id: string) => [...compositionKeys.details(), id] as const,
  stats: () => [...compositionKeys.all, 'stats'] as const,
  progress: (id: string) => [...compositionKeys.all, 'progress', id] as const,
  reaction: (id: string) => [...compositionKeys.all, 'reaction', id] as const,
};

// API Functions
const fetchCompositions = async (
  params: URLSearchParams
): Promise<CompositionsResponse> => {
  const response = await fetch(`/api/compositions?${params.toString()}`);
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication required');
    }
    throw new Error('Failed to fetch compositions');
  }
  return response.json();
};

const fetchCompositionStats = async (): Promise<CompositionStats> => {
  const response = await fetch('/api/compositions/stats', {
    cache: 'no-store',
  });
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication required');
    }
    throw new Error('Failed to fetch composition stats');
  }
  return response.json();
};

const fetchCompositionProgress = async (
  compositionId: string
): Promise<CompositionProgress> => {
  const response = await fetch(
    `/api/compositions/progress?compositionId=${compositionId}`
  );
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication required');
    }
    throw new Error('Failed to fetch composition progress');
  }
  return response.json();
};

const fetchCompositionReaction = async (
  compositionId: string
): Promise<CompositionReaction> => {
  const response = await fetch(
    `/api/compositions/reaction?compositionId=${compositionId}`
  );
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication required');
    }
    throw new Error('Failed to fetch composition reaction');
  }
  return response.json();
};

const updateCompositionProgress = async (data: {
  compositionId: string;
  status: 'SOLVED' | 'ATTEMPTING' | 'UNSOLVED';
}): Promise<{ success: boolean }> => {
  const response = await fetch('/api/compositions/progress', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication required');
    }
    throw new Error('Failed to update composition progress');
  }
  return response.json();
};

const getCompositionFavorite = async (
  compositionId: string
): Promise<{ isFavorite: boolean }> => {
  const response = await fetch(
    `/api/compositions/favorite?compositionId=${compositionId}`
  );
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication required');
    }
    throw new Error('Failed to get favorite status');
  }
  return response.json();
};

const toggleCompositionFavorite = async (data: {
  compositionId: string;
  favorite: boolean;
}): Promise<{ success: boolean }> => {
  const response = await fetch('/api/compositions/favorite', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication required');
    }
    throw new Error('Failed to toggle favorite');
  }
  return response.json();
};

const updateCompositionReaction = async (data: {
  compositionId: string;
  value: 'LIKE' | 'DISLIKE' | null;
}): Promise<{ ok: boolean; likes: number; dislikes: number }> => {
  const response = await fetch('/api/compositions/reaction', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication required');
    }
    throw new Error('Failed to update reaction');
  }
  return response.json();
};

const getCompositionHeatmap = async (): Promise<{
  totalCompletions: number;
  activeDays: number;
  maxStreak: number;
  dailyCompletions: Record<string, number>;
}> => {
  const response = await fetch('/api/compositions/heatmap');
  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Authentication required');
    }
    throw new Error('Failed to get heatmap data');
  }
  return response.json();
};

// Hooks
export const useCompositions = (filters: {
  q?: string;
  favoriteOnly?: boolean;
  difficulty?: string;
  status?: string;
  tags?: string[];
  pageIndex?: number;
  pageSize?: number;
  sort?: { id: string; desc: boolean };
}) => {
  return useQuery({
    queryKey: compositionKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.q) params.set('q', filters.q);
      if (filters.favoriteOnly) params.set('favoriteOnly', 'true');
      if (filters.difficulty) params.set('difficulty', filters.difficulty);
      if (filters.status) params.set('status', filters.status);
      if (filters.tags && filters.tags.length > 0)
        params.set('tags', filters.tags.join(','));
      params.set('page', String((filters.pageIndex || 0) + 1));
      params.set('pageSize', String(filters.pageSize || 10));
      if (filters.sort) {
        params.set('sortKey', filters.sort.id);
        params.set('sortOrder', filters.sort.desc ? 'desc' : 'asc');
      }
      return fetchCompositions(params);
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: false, // Prevent refetch on window focus
    placeholderData: keepPreviousData, // Keep previous data while loading new data
  });
};

export const useCompositionStats = () => {
  return useQuery({
    queryKey: compositionKeys.stats(),
    queryFn: fetchCompositionStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCompositionProgress = (compositionId: string) => {
  return useQuery({
    queryKey: compositionKeys.progress(compositionId),
    queryFn: () => fetchCompositionProgress(compositionId),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

export const useCompositionReaction = (compositionId: string) => {
  return useQuery({
    queryKey: compositionKeys.reaction(compositionId),
    queryFn: () => fetchCompositionReaction(compositionId),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Mutations
export const useUpdateCompositionProgress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCompositionProgress,
    onMutate: async ({ compositionId, status }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: compositionKeys.progress(compositionId),
      });

      // Snapshot previous value
      const previousProgress = queryClient.getQueryData<CompositionProgress>(
        compositionKeys.progress(compositionId)
      );

      // Optimistically update
      queryClient.setQueryData<CompositionProgress>(
        compositionKeys.progress(compositionId),
        { status }
      );

      // Return context with previous value
      return { previousProgress, compositionId };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousProgress) {
        queryClient.setQueryData(
          compositionKeys.progress(context.compositionId),
          context.previousProgress
        );
      }
    },
    onSettled: (data, error, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({
        queryKey: compositionKeys.progress(variables.compositionId),
      });
      queryClient.invalidateQueries({ queryKey: compositionKeys.stats() });
      queryClient.invalidateQueries({ queryKey: compositionKeys.lists() });
      // Invalidate points data when composition progress changes
      queryClient.invalidateQueries({ queryKey: pointsKeys.user() });
    },
  });
};

export const useCompositionFavorite = (compositionId: string) => {
  return useQuery({
    queryKey: ['composition-favorite', compositionId],
    queryFn: () => getCompositionFavorite(compositionId),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useCompositionHeatmap = () => {
  return useQuery({
    queryKey: ['composition-heatmap'],
    queryFn: getCompositionHeatmap,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });
};

// Recent Compositions Hook
export interface RecentComposition {
  id: string;
  title: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  status: 'SOLVED' | 'ATTEMPTING';
  completedAt: string;
  tags: string[];
}

export interface RecentCompositionsResponse {
  data: RecentComposition[];
}

const fetchRecentCompositions =
  async (): Promise<RecentCompositionsResponse> => {
    const response = await fetch('/api/compositions/recent');
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication required');
      }
      throw new Error('Failed to fetch recent compositions');
    }
    return response.json();
  };

export const useRecentCompositions = () => {
  return useQuery({
    queryKey: ['recent-compositions'],
    queryFn: fetchRecentCompositions,
    staleTime: 1000 * 60 * 2, // 2 minutes
    refetchOnWindowFocus: false,
  });
};

export const useToggleCompositionFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleCompositionFavorite,
    onMutate: async ({ compositionId, favorite }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: compositionKeys.lists() });
      await queryClient.cancelQueries({
        queryKey: ['composition-favorite', compositionId],
      });

      // Get all composition lists
      const previousQueries = queryClient.getQueriesData<CompositionsResponse>({
        queryKey: compositionKeys.lists(),
      });

      // Get previous favorite state
      const previousFavorite = queryClient.getQueryData<{
        isFavorite: boolean;
      }>(['composition-favorite', compositionId]);

      // Optimistically update all lists
      previousQueries.forEach(([queryKey, data]) => {
        if (data) {
          const updatedData = {
            ...data,
            data: data.data.map(comp =>
              comp.id === compositionId
                ? { ...comp, isFavorite: favorite }
                : comp
            ),
          };
          queryClient.setQueryData(queryKey, updatedData);
        }
      });

      // Optimistically update single favorite state
      queryClient.setQueryData(['composition-favorite', compositionId], {
        isFavorite: favorite,
      });

      return { previousQueries, previousFavorite };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      context?.previousQueries.forEach(([queryKey, data]) => {
        if (data) {
          queryClient.setQueryData(queryKey, data);
        }
      });

      // Rollback favorite state
      if (context?.previousFavorite) {
        queryClient.setQueryData(
          ['composition-favorite', variables.compositionId],
          context.previousFavorite
        );
      }
    },
    onSettled: () => {
      // Invalidate all composition lists
      queryClient.invalidateQueries({ queryKey: compositionKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: ['composition-favorite'],
      });
      // Invalidate points data when composition progress changes
      queryClient.invalidateQueries({ queryKey: pointsKeys.user() });
    },
  });
};

export const useUpdateCompositionReaction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCompositionReaction,
    onMutate: async ({ compositionId, value }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: compositionKeys.reaction(compositionId),
      });

      // Snapshot previous value
      const previousReaction = queryClient.getQueryData<CompositionReaction>(
        compositionKeys.reaction(compositionId)
      );

      // Calculate optimistic update
      if (previousReaction) {
        const currentUserReaction = previousReaction.userReaction;
        let newLikes = previousReaction.likes;
        let newDislikes = previousReaction.dislikes;
        let newUserReaction = value;

        // Handle like toggle
        if (value === 'LIKE') {
          if (currentUserReaction === 'LIKE') {
            newLikes = Math.max(0, newLikes - 1);
            newUserReaction = null;
          } else {
            if (currentUserReaction === 'DISLIKE') {
              newDislikes = Math.max(0, newDislikes - 1);
            }
            newLikes += 1;
          }
        }
        // Handle dislike toggle
        else if (value === 'DISLIKE') {
          if (currentUserReaction === 'DISLIKE') {
            newDislikes = Math.max(0, newDislikes - 1);
            newUserReaction = null;
          } else {
            if (currentUserReaction === 'LIKE') {
              newLikes = Math.max(0, newLikes - 1);
            }
            newDislikes += 1;
          }
        }
        // Handle removal
        else if (value === null) {
          if (currentUserReaction === 'LIKE') {
            newLikes = Math.max(0, newLikes - 1);
          } else if (currentUserReaction === 'DISLIKE') {
            newDislikes = Math.max(0, newDislikes - 1);
          }
        }

        // Optimistically update
        queryClient.setQueryData<CompositionReaction>(
          compositionKeys.reaction(compositionId),
          {
            likes: newLikes,
            dislikes: newDislikes,
            userReaction: newUserReaction,
          }
        );
      }

      return { previousReaction, compositionId };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousReaction) {
        queryClient.setQueryData(
          compositionKeys.reaction(context.compositionId),
          context.previousReaction
        );
      }
    },
    onSettled: (data, error, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({
        queryKey: compositionKeys.reaction(variables.compositionId),
      });
      queryClient.invalidateQueries({ queryKey: compositionKeys.lists() });
    },
  });
};
