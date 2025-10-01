"use client";

import CompletionCalendar from "@/components/common/stage/completion-calendar";
import CompositionDifficultyWidget from "@/components/common/stage/composition-difficulty-widget";

export default function Stage(): React.ReactElement {
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CompletionCalendar />
        <CompositionDifficultyWidget />
      </div>
    </div>
  );
}
