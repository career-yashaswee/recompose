import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  gender: string | null;
  location: string | null;
  birthday: Date | null;
  summary: string | null;
  website: string | null;
  github: string | null;
  linkedin: string | null;
  twitter: string | null;
  leetcodeId: string | null;
  work: string | null;
  education: string | null;
  technicalSkills: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateProfileData {
  name: string;
  gender?: string;
  location?: string;
  birthday?: string;
  summary?: string;
  website?: string;
  github?: string;
  linkedin?: string;
  twitter?: string;
  leetcodeId?: string;
  work?: string;
  education?: string;
  technicalSkills?: string[];
}

/**
 * Fetch user profile data
 */
export function useProfile() {
  return useQuery<UserProfile>({
    queryKey: ['profile'],
    queryFn: async (): Promise<UserProfile> => {
      const response = await fetch('/api/profile');

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized');
        }
        throw new Error('Failed to fetch profile');
      }

      const data = await response.json();

      // Convert date strings to Date objects
      if (data.birthday) {
        data.birthday = new Date(data.birthday);
      }
      data.createdAt = new Date(data.createdAt);
      data.updatedAt = new Date(data.updatedAt);

      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message === 'Unauthorized') {
        return false;
      }
      return failureCount < 3;
    },
  });
}

/**
 * Update user profile data
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfileData): Promise<UserProfile> => {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const result = await response.json();

      // Convert date strings to Date objects
      if (result.birthday) {
        result.birthday = new Date(result.birthday);
      }
      result.createdAt = new Date(result.createdAt);
      result.updatedAt = new Date(result.updatedAt);

      return result;
    },
    onSuccess: data => {
      // Update the profile cache
      queryClient.setQueryData(['profile'], data);

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['profile'] });

      toast.success('Profile updated successfully!');
    },
    onError: (error: Error) => {
      console.error('Profile update error:', error);
      toast.error(error.message || 'Failed to update profile');
    },
  });
}
