'use client';

import { useMemo } from 'react';
import { useCompositionStats } from '@/hooks/api';

type Segment = { label: string; value: number; color: string };

const RADIUS = 56;
const CIRC = 2 * Math.PI * RADIUS;

export default function CompositionDifficultyWidget(): React.ReactElement {
  const { data: stats } = useCompositionStats();

  const totalSolved =
    (stats?.easy.solved || 0) +
    (stats?.medium.solved || 0) +
    (stats?.hard.solved || 0);
  const totalAll =
    (stats?.easy.total || 0) +
    (stats?.medium.total || 0) +
    (stats?.hard.total || 0);

  const segments: Segment[] = useMemo(() => {
    if (!stats) return [];
    return [
      { label: 'Easy', value: stats.easy.solved, color: '#14b8a6' },
      { label: 'Med.', value: stats.medium.solved, color: '#f59e0b' },
      { label: 'Hard', value: stats.hard.solved, color: '#ef4444' },
    ];
  }, [stats]);

  const strokes = useMemo(() => {
    const sum = segments.reduce((a, s) => a + s.value, 0) || 1;
    let offset = 0;
    return segments.map(s => {
      const frac = s.value / sum;
      const len = frac * CIRC;
      const item = { dash: `${len} ${CIRC - len}`, offset };
      offset -= len;
      return item;
    });
  }, [segments]);

  return (
    <div className='flex items-center justify-between gap-6 rounded-xl border bg-card p-5 text-card-foreground shadow'>
      <div className='relative size-36'>
        <svg viewBox='0 0 140 140' className='size-36 -rotate-90'>
          <circle
            cx='70'
            cy='70'
            r={RADIUS}
            stroke='#1f2937'
            strokeWidth='10'
            fill='none'
          />
          {segments.map((s, i) => (
            <circle
              key={s.label}
              cx='70'
              cy='70'
              r={RADIUS}
              stroke={s.color}
              strokeWidth='10'
              fill='none'
              strokeDasharray={strokes[i]?.dash}
              strokeDashoffset={strokes[i]?.offset}
              strokeLinecap='round'
            />
          ))}
        </svg>
        <div className='absolute inset-0 grid place-items-center'>
          <div className='text-center'>
            <div className='text-3xl font-bold'>{totalSolved}</div>
            <div className='text-sm text-muted-foreground'>/ {totalAll}</div>
            <div className='text-sm text-emerald-400'>Solved</div>
            <div className='text-xs text-muted-foreground'>
              {stats?.attempting ?? 0} Attempting
            </div>
          </div>
        </div>
      </div>
      <div className='grid gap-3'>
        <Legend
          color='#14b8a6'
          title='Easy'
          solved={stats?.easy.solved ?? 0}
          total={stats?.easy.total ?? 0}
        />
        <Legend
          color='#f59e0b'
          title='Med.'
          solved={stats?.medium.solved ?? 0}
          total={stats?.medium.total ?? 0}
        />
        <Legend
          color='#ef4444'
          title='Hard'
          solved={stats?.hard.solved ?? 0}
          total={stats?.hard.total ?? 0}
        />
      </div>
    </div>
  );
}

function Legend({
  color,
  title,
  solved,
  total,
}: {
  color: string;
  title: string;
  solved: number;
  total: number;
}): React.ReactElement {
  return (
    <div className='flex items-center justify-between rounded-md bg-muted/30 px-3 py-2'>
      <div className='flex items-center gap-2'>
        <span
          className='inline-block size-2.5 rounded-full'
          style={{ backgroundColor: color }}
        />
        <span className='text-sm font-semibold' style={{ color }}>
          {title}
        </span>
      </div>
      <div className='text-sm'>
        <span className='font-medium'>{solved}</span>
        <span className='text-muted-foreground'>/{total}</span>
      </div>
    </div>
  );
}
