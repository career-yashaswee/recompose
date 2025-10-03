'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Clock, CheckCircle, Circle, Loader2 } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import {
  useRecentCompositions,
  type RecentComposition,
} from '@/hooks/api/use-compositions';

interface RecentCompositionsProps {
  className?: string;
}

/**
 * Utility function to format time ago
 */
function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks === 1 ? '' : 's'} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths} month${diffInMonths === 1 ? '' : 's'} ago`;
}

export function RecentCompositions({
  className,
}: RecentCompositionsProps): React.ReactElement {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Fetch recent compositions from API
  const { data, isLoading, error } = useRecentCompositions();

  const filteredCompositions = useMemo(() => {
    if (!data?.data) return [];

    return data.data.filter(composition => {
      const matchesSearch =
        composition.title
          .toLowerCase()
          .includes(debouncedSearchQuery.toLowerCase()) ||
        composition.tags.some(tag =>
          tag.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
        );

      const matchesStatus =
        statusFilter === 'all' || composition.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [data?.data, debouncedSearchQuery, statusFilter]);

  const getStatusIcon = (status: RecentComposition['status']) => {
    switch (status) {
      case 'SOLVED':
        return <CheckCircle className='w-4 h-4 text-green-600' />;
      case 'ATTEMPTING':
        return <Clock className='w-4 h-4 text-yellow-600' />;
      default:
        return <Circle className='w-4 h-4 text-gray-400' />;
    }
  };

  const getStatusBadgeColor = (status: RecentComposition['status']) => {
    switch (status) {
      case 'SOLVED':
        return 'bg-green-100 text-green-800';
      case 'ATTEMPTING':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyBadgeColor = (
    difficulty: RecentComposition['difficulty']
  ) => {
    switch (difficulty) {
      case 'EASY':
        return 'bg-blue-100 text-blue-800';
      case 'MEDIUM':
        return 'bg-orange-100 text-orange-800';
      case 'HARD':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle>Recent Compositions</CardTitle>
          <div className='flex items-center gap-2'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
              <Input
                placeholder='Search compositions, tags...'
                className='pl-10 w-64'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className='px-4 py-2.5 border rounded-md text-sm'
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value='all'>All Status</option>
              <option value='SOLVED'>Solved</option>
              <option value='ATTEMPTING'>Attempting</option>
            </select>
            {/* <Button className='bg-blue-500 hover:bg-blue-600'>View All</Button> */}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className='space-y-4'>
          {isLoading ? (
            <div className='flex items-center justify-center py-8'>
              <Loader2 className='w-6 h-6 animate-spin text-gray-400' />
              <span className='ml-2 text-gray-500'>
                Loading compositions...
              </span>
            </div>
          ) : error ? (
            <div className='text-center py-8 text-red-500'>
              Failed to load compositions. Please try again.
            </div>
          ) : filteredCompositions.length === 0 ? (
            <div className='text-center py-8 text-gray-500'>
              {data?.data?.length === 0
                ? "You haven't completed any compositions yet."
                : 'No compositions found matching your criteria.'}
            </div>
          ) : (
            filteredCompositions.map(composition => (
              <div
                key={composition.id}
                className='flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors'
              >
                <div className='flex-shrink-0'>
                  <div className='w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center'>
                    {getStatusIcon(composition.status)}
                  </div>
                </div>
                <div className='flex-1'>
                  <div className='flex items-center justify-between mb-2'>
                    <h3 className='font-semibold text-lg'>
                      {composition.title}
                    </h3>
                    <div className='flex items-center gap-2'>
                      <Badge
                        variant='secondary'
                        className={getStatusBadgeColor(composition.status)}
                      >
                        {composition.status}
                      </Badge>
                      <Badge
                        variant='outline'
                        className={getDifficultyBadgeColor(
                          composition.difficulty
                        )}
                      >
                        {composition.difficulty}
                      </Badge>
                    </div>
                  </div>
                  <div className='flex items-center gap-4 text-sm text-gray-600'>
                    <span className='flex items-center gap-1'>
                      <Clock className='w-3 h-3' />
                      {formatTimeAgo(new Date(composition.completedAt))}
                    </span>
                    <div className='flex items-center gap-1'>
                      {composition.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant='outline'
                          className='text-xs'
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
