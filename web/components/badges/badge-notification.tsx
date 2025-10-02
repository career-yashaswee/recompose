'use client';

import { useEffect, useState } from 'react';
import { useBadgeProgress } from '@/hooks/api/use-badges';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Trophy, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BadgeNotificationProps {
  className?: string;
}

export function BadgeNotification({ className }: BadgeNotificationProps) {
  const { data: progress } = useBadgeProgress();
  const [showNotification, setShowNotification] = useState(false);
  const [lastEarnedCount, setLastEarnedCount] = useState(0);

  useEffect(() => {
    if (progress && progress.recentBadges.length > 0) {
      const currentEarnedCount = progress.earnedBadges;
      
      // Show notification if we have new badges
      if (currentEarnedCount > lastEarnedCount && lastEarnedCount > 0) {
        setShowNotification(true);
        
        // Auto-hide after 5 seconds
        const timer = setTimeout(() => {
          setShowNotification(false);
        }, 5000);
        
        return () => clearTimeout(timer);
      }
      
      setLastEarnedCount(currentEarnedCount);
    }
  }, [progress, lastEarnedCount]);

  if (!showNotification || !progress || progress.recentBadges.length === 0) {
    return null;
  }

  const latestBadge = progress.recentBadges[0];

  return (
    <Card
      className={cn(
        'fixed top-4 right-4 z-50 w-80 shadow-lg border-2 border-green-200 bg-green-50 animate-in slide-in-from-right-5 duration-300',
        className
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
              <Trophy className="h-6 w-6 text-white" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-green-900">
                🎉 Badge Earned!
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotification(false)}
                className="h-6 w-6 p-0 text-green-600 hover:text-green-800"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <p className="text-sm text-green-800 mt-1">
              You&apos;ve earned the <strong>{latestBadge.badge.name}</strong> badge!
            </p>
            
            <p className="text-xs text-green-700 mt-1">
              {latestBadge.badge.description}
            </p>
            
            <div className="flex items-center space-x-2 mt-2">
              <Button
                size="sm"
                variant="outline"
                className="text-xs h-7 border-green-300 text-green-700 hover:bg-green-100"
                onClick={() => {
                  setShowNotification(false);
                  // Navigate to badges page
                  window.location.href = '/stage/badges';
                }}
              >
                View Badges
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
