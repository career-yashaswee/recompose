'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PerformanceData {
  month: string;
  score: number;
}

interface PerformanceProps {
  className?: string;
}

const performanceData: PerformanceData[] = [
  { month: 'Jan', score: 65 },
  { month: 'Feb', score: 72 },
  { month: 'Mar', score: 85 },
  { month: 'Apr', score: 68 },
  { month: 'May', score: 78 },
  { month: 'Jun', score: 82 },
  { month: 'Jul', score: 80 },
];

export function Performance({
  className,
}: PerformanceProps): React.ReactElement {
  const maxScore = Math.max(...performanceData.map(d => d.score));

  return (
    <Card className={className}>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle>Performance</CardTitle>
          <select className='px-3 py-1 border rounded-md text-sm'>
            <option>Last 6 Months</option>
          </select>
        </div>
      </CardHeader>
      <CardContent>
        <div className='grid grid-cols-2 gap-6'>
          {/* Gauge */}
          <div className='text-center'>
            <div className='relative w-32 h-16 mx-auto mb-4'>
              <div className='absolute inset-0 rounded-t-full border-8 border-gray-200'></div>
              <div className='absolute inset-0 rounded-t-full border-8 border-transparent border-t-pink-400 border-r-yellow-400 border-b-blue-400'></div>
              <div className='absolute inset-0 flex items-center justify-center'>
                <div className='text-center'>
                  <p className='text-sm font-semibold'>Total Score</p>
                  <p className='text-2xl font-bold'>80%</p>
                </div>
              </div>
            </div>
            <div className='space-y-2 text-sm'>
              <div className='flex items-center gap-2'>
                <div className='w-3 h-3 bg-pink-400 rounded'></div>
                <span>Participation - 55%</span>
              </div>
              <div className='flex items-center gap-2'>
                <div className='w-3 h-3 bg-yellow-400 rounded'></div>
                <span>Quiz - 15%</span>
              </div>
              <div className='flex items-center gap-2'>
                <div className='w-3 h-3 bg-blue-400 rounded'></div>
                <span>Exam - 10%</span>
              </div>
            </div>
          </div>

          {/* Line Chart */}
          <div>
            <div className='h-24 flex items-end justify-between gap-1'>
              {performanceData.map((data, index) => (
                <div key={index} className='flex flex-col items-center flex-1'>
                  <div
                    className='bg-blue-500 w-full rounded-t'
                    style={{
                      height: `${(data.score / maxScore) * 100}%`,
                    }}
                  />
                  <span className='text-xs text-gray-600 mt-1'>
                    {data.month}
                  </span>
                </div>
              ))}
            </div>
            <div className='flex justify-between text-xs text-gray-500 mt-2'>
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Motivational Quote */}
        <div className='mt-6 bg-yellow-100 rounded-lg p-4'>
          <p className='text-sm text-gray-800'>
            Success is the sum of small efforts, repeated day in and day out.
            Keep pushing forward! 💪
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
