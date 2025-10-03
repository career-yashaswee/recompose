import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LeaderboardUser } from '@/hooks/api/use-leaderboard';
import { Trophy, Flame, Circle, Star } from 'lucide-react';

interface LeaderboardCardProps {
  user: LeaderboardUser;
  rank: number;
  isCurrentUser?: boolean;
}

export function LeaderboardCard({ user, rank, isCurrentUser = false }: LeaderboardCardProps) {
  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-yellow-500 text-white';
      case 2:
        return 'bg-gray-400 text-white';
      case 3:
        return 'bg-amber-600 text-white';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank <= 3) {
      return <Trophy className="w-4 h-4" />;
    }
    return null;
  };

  return (
    <div className={`p-6 rounded-lg border ${isCurrentUser ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'} hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getRankColor(rank)}`}>
            {getRankIcon(rank) || <span className="text-sm font-bold">{rank}</span>}
          </div>
          <Avatar className="w-12 h-12">
            <AvatarImage src={user.image || ''} alt={user.name || 'User'} />
            <AvatarFallback>
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="text-right">
          <div className="flex items-center text-lg font-bold text-gray-900">
            <Star className="w-4 h-4 mr-1 text-yellow-500" />
            {user.totalPoints.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold text-gray-900 mb-2">
          {user.name || 'Anonymous User'}
          {isCurrentUser && <span className="ml-2 text-blue-600">(You)</span>}
        </h3>
        
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center">
            <Circle className="w-4 h-4 mr-1" />
            {user.compositionsCompleted} compositions
          </div>
          <div className="flex items-center">
            <Flame className="w-4 h-4 mr-1 text-orange-500" />
            {user.currentStreak} days streak
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {user.badges.slice(0, 2).map((badge) => (
          <Badge key={badge.id} variant="secondary" className="text-xs">
            {badge.name}
          </Badge>
        ))}
        {user.badges.length > 2 && (
          <Badge variant="outline" className="text-xs">
            +{user.badges.length - 2}
          </Badge>
        )}
      </div>
    </div>
  );
}
