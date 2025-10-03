'use client';

import { useCompositionStats } from '@/hooks/api';

const RADIUS = 40;
const CIRC = 2 * Math.PI * RADIUS;

interface CircularProgressProps {
  label: string;
  solved: number;
  total: number;
  color: string;
}

function CircularProgress({
  label,
  solved,
  total,
  color,
}: CircularProgressProps) {
  const progress = total > 0 ? (solved / total) * 100 : 0;
  const strokeDasharray = `${(progress / 100) * CIRC} ${CIRC}`;

  return (
    <div className='flex flex-col items-center'>
      <div className='relative size-24'>
        <svg viewBox='0 0 100 100' className='size-24 -rotate-90'>
          {/* Background circle */}
          <circle
            cx='50'
            cy='50'
            r={RADIUS}
            stroke='#374151'
            strokeWidth='8'
            fill='none'
          />
          {/* Progress circle */}
          <circle
            cx='50'
            cy='50'
            r={RADIUS}
            stroke={color}
            strokeWidth='8'
            fill='none'
            strokeDasharray={strokeDasharray}
            strokeLinecap='round'
            className='transition-all duration-500'
          />
        </svg>
        <div className='absolute inset-0 grid place-items-center'>
          <div className='text-center'>
            <div className='text-lg font-bold text-foreground'>{solved}</div>
            <div className='text-xs text-muted-foreground'>/{total}</div>
          </div>
        </div>
      </div>
      <div
        className='mt-2 text-sm font-medium text-foreground'
        style={{ color }}
      >
        {label}
      </div>
    </div>
  );
}

export default function CompositionDifficultyWidget(): React.ReactElement {
  const { data: stats } = useCompositionStats();

  return (
    <div className='flex items-center justify-center gap-8 rounded-xl border bg-card p-6 text-card-foreground shadow'>
      <CircularProgress
        label='Easy'
        solved={stats?.easy.solved ?? 0}
        total={stats?.easy.total ?? 0}
        color='#06b6d4'
      />
      <CircularProgress
        label='Medium'
        solved={stats?.medium.solved ?? 0}
        total={stats?.medium.total ?? 0}
        color='#f59e0b'
      />
      <CircularProgress
        label='Hard'
        solved={stats?.hard.solved ?? 0}
        total={stats?.hard.total ?? 0}
        color='#ef4444'
      />
    </div>
  );
}
