'use client';

import CompletionCalendar from '@/components/common/stage/completion-calendar';
import CompositionDifficultyWidget from '@/components/common/stage/composition-difficulty-widget';
import CompositionHeatmap from '@/components/common/stage/composition-heatmap';

export default function Stage(): React.ReactElement {
  return (
    <div className='p-6 space-y-6'>
      {/* Heatmap - Full width */}
      <CompositionHeatmap />

      {/* Other widgets in grid */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        <CompletionCalendar />
        <CompositionDifficultyWidget />
      </div>
    </div>
  );
}
