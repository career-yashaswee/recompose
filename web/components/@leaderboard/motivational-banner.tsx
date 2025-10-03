import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface MotivationalBannerProps {
  message: string;
  pointsToNext: number;
  showMotivation: boolean;
}

export function MotivationalBanner({
  message,
  pointsToNext,
  showMotivation,
}: MotivationalBannerProps) {
  if (!showMotivation) {
    return null;
  }

  return (
    <div className='bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-6 mb-6 text-white'>
      <div className='flex items-center justify-between'>
        <div className='flex-1'>
          <h3 className='text-xl font-bold mb-2'>
            You're closer than you think!
          </h3>
          <p className='text-purple-100 mb-4'>
            Just <strong>{pointsToNext} points</strong> away from breaking into
            the Top 10! Complete one more composition or maintain your streak to
            boost your rank.
          </p>
          <Button
            variant='secondary'
            className='bg-white text-purple-700 hover:bg-purple-50'
          >
            Continue Learning
          </Button>
        </div>
        <div className='hidden md:flex flex-wrap gap-2 ml-6'>
          <Badge
            variant='secondary'
            className='bg-white/20 text-white border-white/30'
          >
            Monthly Champ
          </Badge>
          <Badge
            variant='secondary'
            className='bg-white/20 text-white border-white/30'
          >
            Top Designer
          </Badge>
          <Badge
            variant='secondary'
            className='bg-white/20 text-white border-white/30'
          >
            Fast Learner
          </Badge>
          <Badge
            variant='secondary'
            className='bg-white/20 text-white border-white/30'
          >
            Quiz Master
          </Badge>
          <Badge
            variant='secondary'
            className='bg-white/20 text-white border-white/30'
          >
            Rising Star
          </Badge>
          <Badge
            variant='secondary'
            className='bg-white/20 text-white border-white/30'
          >
            Code Streak
          </Badge>
        </div>
      </div>
    </div>
  );
}
