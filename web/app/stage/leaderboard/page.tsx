'use client';

import { useState } from 'react';
import { useLeaderboard } from '@/hooks/api/use-leaderboard';
import { LeaderboardTimeFilter } from '@/app/api/leaderboard/route';
import { LeaderboardCard, LeaderboardTable, MotivationalBanner, TimeFilter } from '@/components/@leaderboard';
import { Skeleton } from '@/components/ui/skeleton';

export default function LeaderboardPage() {
  const [timeFilter, setTimeFilter] = useState<LeaderboardTimeFilter>('all');
  
  const { data, isLoading, error } = useLeaderboard({ timeFilter });

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Leaderboard</h1>
          <p className="text-red-600">Failed to load leaderboard data. Please try again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Leaderboard</h1>
        
        <TimeFilter 
          currentFilter={timeFilter} 
          onFilterChange={setTimeFilter} 
        />
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {/* Motivational Banner Skeleton */}
          <Skeleton className="h-32 w-full rounded-lg" />
          
          {/* Top 3 Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 w-full rounded-lg" />
            ))}
          </div>
          
          {/* Table Skeleton */}
          <Skeleton className="h-96 w-full rounded-lg" />
        </div>
      ) : data ? (
        <>
          {/* Motivational Banner */}
          <MotivationalBanner
            message={data.motivationalData.message}
            pointsToNext={data.motivationalData.pointsToNext}
            showMotivation={data.motivationalData.showMotivation}
          />

          {/* Top 3 Users */}
          {data.leaderboard.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {data.leaderboard.slice(0, 3).map((user, index) => (
                <LeaderboardCard
                  key={user.id}
                  user={user}
                  rank={user.rank}
                />
              ))}
            </div>
          )}

          {/* Leaderboard Table */}
          {data.leaderboard.length > 3 && (
            <LeaderboardTable
              data={data.leaderboard.slice(3)}
              currentUserRank={data.currentUserRank}
            />
          )}

          {/* Empty State */}
          {data.leaderboard.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-500 text-lg mb-4">
                No leaderboard data available for {timeFilter === 'all' ? 'all time' : `this ${timeFilter}`}.
              </div>
              <p className="text-gray-400">
                Start completing compositions to appear on the leaderboard!
              </p>
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
