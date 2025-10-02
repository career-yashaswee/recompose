'use client';

import { BadgeProgress } from '@/hooks/api/use-badges';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge as BadgeComponent } from '@/components/ui/badge';
import { Trophy, Target, TrendingUp, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BadgeStatsProps {
  progress: BadgeProgress;
  className?: string;
}

const categoryIcons = {
  COMPOSITION: '📝',
  ENGAGEMENT: '❤️',
  STREAK: '🔥',
  ACHIEVEMENT: '🏆',
};

const categoryColors = {
  COMPOSITION: 'bg-blue-100 text-blue-800 border-blue-200',
  ENGAGEMENT: 'bg-pink-100 text-pink-800 border-pink-200',
  STREAK: 'bg-orange-100 text-orange-800 border-orange-200',
  ACHIEVEMENT: 'bg-purple-100 text-purple-800 border-purple-200',
};

export function BadgeStats({ progress, className }: BadgeStatsProps) {
  const {
    totalBadges,
    earnedBadges,
    inProgressBadges,
    badgesByCategory,
    recentBadges,
  } = progress;

  const completionPercentage = totalBadges > 0 ? (earnedBadges / totalBadges) * 100 : 0;

  return (
    <div className={cn('space-y-6', className)}>
      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Badges</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBadges}</div>
            <p className="text-xs text-muted-foreground">
              Available on the platform
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Earned</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{earnedBadges}</div>
            <p className="text-xs text-muted-foreground">
              {completionPercentage.toFixed(1)}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{inProgressBadges}</div>
            <p className="text-xs text-muted-foreground">
              Working towards earning
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Progress by Category</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(badgesByCategory).map(([category, stats]) => (
              <div key={category} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">
                    {categoryIcons[category as keyof typeof categoryIcons]}
                  </span>
                  <BadgeComponent
                    className={cn(
                      'text-xs',
                      categoryColors[category as keyof typeof categoryColors]
                    )}
                  >
                    {category}
                  </BadgeComponent>
                </div>
                <div className="text-2xl font-bold">
                  {stats.earned}/{stats.total}
                </div>
                <div className="text-xs text-muted-foreground">
                  {stats.total > 0
                    ? ((stats.earned / stats.total) * 100).toFixed(1)
                    : 0}% complete
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Badges */}
      {recentBadges.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5" />
              <span>Recently Earned</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentBadges.map((userBadge) => (
                <div
                  key={userBadge.id}
                  className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">
                      {userBadge.badge.icon || '🏆'}
                    </div>
                    <div>
                      <div className="font-medium text-green-900">
                        {userBadge.badge.name}
                      </div>
                      <div className="text-sm text-green-700">
                        {userBadge.badge.description}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-green-600 font-medium">
                    {new Date(userBadge.earnedAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
