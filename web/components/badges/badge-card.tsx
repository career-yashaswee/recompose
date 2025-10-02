'use client';

import { Badge } from '@/hooks/api/use-badges';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge as BadgeComponent } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Trophy, Lock, Download } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BadgeCardProps {
  badge: Badge;
  className?: string;
}

const tierColors = {
  BRONZE: 'bg-amber-100 text-amber-800 border-amber-200',
  SILVER: 'bg-gray-100 text-gray-800 border-gray-200',
  GOLD: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  PLATINUM: 'bg-purple-100 text-purple-800 border-purple-200',
};

const tierIcons = {
  BRONZE: '🥉',
  SILVER: '🥈',
  GOLD: '🥇',
  PLATINUM: '💎',
};

export function BadgeCard({ badge, className }: BadgeCardProps) {
  const { userProgress } = badge;
  const isEarned = userProgress.isEarned;
  const progressPercentage = Math.min(
    (userProgress.progress / badge.criteria.count) * 100,
    100
  );

  const handleViewBadge = () => {
    // TODO: Implement badge detail view
    console.log('View badge:', badge.id);
  };

  const handleDownloadBadge = () => {
    // TODO: Implement badge download
    console.log('Download badge:', badge.id);
  };

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all duration-200 hover:shadow-md',
        isEarned
          ? 'border-2 border-green-200 bg-green-50/50'
          : 'border border-gray-200 bg-white',
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={cn(
                'flex h-16 w-16 items-center justify-center rounded-full text-2xl',
                isEarned
                  ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-400'
              )}
            >
              {isEarned ? (
                badge.icon || <Trophy className="h-8 w-8" />
              ) : (
                <Lock className="h-6 w-6" />
              )}
            </div>
            <div className="flex-1">
              <h3
                className={cn(
                  'font-semibold text-lg',
                  isEarned ? 'text-gray-900' : 'text-gray-600'
                )}
              >
                {badge.name}
              </h3>
              <BadgeComponent
                className={cn(
                  'mt-1 text-xs',
                  tierColors[badge.tier],
                  !isEarned && 'opacity-50'
                )}
              >
                {tierIcons[badge.tier]} {badge.tier}
              </BadgeComponent>
            </div>
          </div>
          {isEarned && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownloadBadge}
              className="h-8 w-8 p-0"
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p
          className={cn(
            'text-sm leading-relaxed',
            isEarned ? 'text-gray-700' : 'text-gray-500'
          )}
        >
          {badge.description}
        </p>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span
              className={cn(
                'font-medium',
                isEarned ? 'text-green-700' : 'text-gray-600'
              )}
            >
              Progress
            </span>
            <span
              className={cn(
                'font-mono',
                isEarned ? 'text-green-700' : 'text-gray-600'
              )}
            >
              {userProgress.progress}/{badge.criteria.count}
            </span>
          </div>
          <Progress
            value={progressPercentage}
            className={cn(
              'h-2',
              isEarned ? '[&>div]:bg-green-500' : '[&>div]:bg-blue-500'
            )}
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            {badge.category} • {badge.criteria.type.replace('_', ' ')}
          </div>
          <Button
            variant={isEarned ? 'default' : 'outline'}
            size="sm"
            onClick={handleViewBadge}
            disabled={!isEarned}
            className={cn(
              'text-xs',
              !isEarned && 'opacity-50 cursor-not-allowed'
            )}
          >
            {isEarned ? 'View Badge' : 'Locked'}
          </Button>
        </div>

        {isEarned && userProgress.earnedAt && (
          <div className="text-xs text-green-600 font-medium">
            Earned on {new Date(userProgress.earnedAt).toLocaleDateString()}
          </div>
        )}
      </CardContent>

      {isEarned && (
        <div className="absolute top-2 right-2">
          <div className="h-6 w-6 rounded-full bg-green-500 flex items-center justify-center">
            <Trophy className="h-3 w-3 text-white" />
          </div>
        </div>
      )}
    </Card>
  );
}
