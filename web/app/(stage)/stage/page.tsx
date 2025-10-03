'use client';

import React from 'react';
import CompletionCalendar from '@/components/common/stage/completion-calendar';
import CompositionDifficultyWidget from '@/components/common/stage/composition-difficulty-widget';
import CompositionHeatmap from '@/components/common/stage/composition-heatmap';

export default function Stage(): React.ReactElement {
  return (
    <>
      <div className='p-2 grid grid-cols-1 gap-6 lg:grid-cols-2'>
        {/* Heatmap - Full width */}
        <CompositionHeatmap />
        <CompositionDifficultyWidget />
        <CompletionCalendar />
      </div>
    </>
  );
}
