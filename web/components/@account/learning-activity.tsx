'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { useTimeTracking } from '@/hooks/use-time-tracking';
import { useEffect, useState } from 'react';

interface LearningData {
  day: string;
  hours: number;
  seconds: number;
  sessionCount: number;
}

interface TimeTrackingData {
  date: string;
  day: string;
  hours: number;
  seconds: number;
  sessionCount: number;
}

interface LearningActivityProps {
  className?: string;
}

// Default data for when no real data is available
const defaultLearningData: LearningData[] = [
  { day: 'Mon', hours: 0, seconds: 0, sessionCount: 0 },
  { day: 'Tue', hours: 0, seconds: 0, sessionCount: 0 },
  { day: 'Wed', hours: 0, seconds: 0, sessionCount: 0 },
  { day: 'Thu', hours: 0, seconds: 0, sessionCount: 0 },
  { day: 'Fri', hours: 0, seconds: 0, sessionCount: 0 },
  { day: 'Sat', hours: 0, seconds: 0, sessionCount: 0 },
  { day: 'Sun', hours: 0, seconds: 0, sessionCount: 0 },
];

export function LearningActivity({
  className,
}: LearningActivityProps): React.ReactElement {
  const { getDailyTimeData } = useTimeTracking();
  const [learningData, setLearningData] =
    useState<LearningData[]>(defaultLearningData);
  const [totalHours, setTotalHours] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadTimeData = async () => {
      try {
        setIsLoading(true);
        const timeData = await getDailyTimeData(7);

        if (timeData) {
          // Convert API data to component format
          const convertedData = timeData.data.map((item: TimeTrackingData) => ({
            day: item.day,
            hours: item.hours,
            seconds: item.seconds,
            sessionCount: item.sessionCount,
          }));

          setLearningData(convertedData);
          setTotalHours(timeData.total.hours);
        }
      } catch (error) {
        console.error('Failed to load time data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTimeData();
  }, [getDailyTimeData]);

  const maxHours = Math.max(...learningData.map(d => d.hours), 1); // Minimum 1 to avoid division by zero

  return (
    <Card className={className}>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <CardTitle>Learning Activity</CardTitle>
            <p className='text-2xl font-bold text-gray-900 mt-2'>
              {isLoading
                ? 'Loading...'
                : `${Math.floor(totalHours)} hours ${Math.round((totalHours % 1) * 60)} minutes`}
            </p>
          </div>
          <div className='flex items-center gap-2'>
            <select className='px-3 py-1 border rounded-md text-sm'>
              <option>This Week</option>
            </select>
            <Button variant='ghost' size='icon'>
              <MoreHorizontal className='w-4 h-4' />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Bar Chart */}
        <div className='mb-6'>
          <div className='flex items-end justify-between h-32 gap-2'>
            {learningData.map((data, index) => (
              <div key={index} className='flex flex-col items-center flex-1'>
                <div className='flex flex-col justify-end h-full w-full'>
                  <div
                    className={`bg-gradient-to-t from-blue-500 to-blue-400 rounded-t transition-all duration-300 ${
                      isLoading ? 'animate-pulse' : ''
                    }`}
                    style={{
                      height: `${Math.max((data.hours / maxHours) * 100, 2)}%`,
                    }}
                    title={`${data.hours.toFixed(1)} hours (${data.sessionCount} sessions)`}
                  />
                </div>
                <span className='text-xs text-gray-600 mt-2'>{data.day}</span>
                {!isLoading && (
                  <span className='text-xs text-gray-400 mt-1'>
                    {data.hours > 0 ? `${data.hours.toFixed(1)}h` : '0h'}
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className='flex justify-between text-xs text-gray-500 mt-2'>
            <span>0h</span>
            <span>{Math.ceil(maxHours)}h</span>
          </div>
        </div>

        {/* Session Summary */}
        <div className='grid grid-cols-3 gap-4'>
          <div className='bg-blue-100 rounded-lg p-3'>
            <p className='text-sm font-semibold'>
              {isLoading
                ? '...'
                : `${learningData.reduce((sum, day) => sum + day.sessionCount, 0)}`}
            </p>
            <p className='text-xs text-gray-600'>Total Sessions</p>
          </div>
          <div className='bg-green-100 rounded-lg p-3'>
            <p className='text-sm font-semibold'>
              {isLoading
                ? '...'
                : `${learningData.filter(day => day.hours > 0).length}`}
            </p>
            <p className='text-xs text-gray-600'>Active Days</p>
          </div>
          <div className='bg-purple-100 rounded-lg p-3'>
            <p className='text-sm font-semibold'>
              {isLoading ? '...' : `${(totalHours / 7).toFixed(1)}h`}
            </p>
            <p className='text-xs text-gray-600'>Avg Daily</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
