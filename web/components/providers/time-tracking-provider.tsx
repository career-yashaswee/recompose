'use client';

import { createContext, useContext, useEffect, ReactNode } from 'react';
import { useTimeTracking } from '@/hooks/use-time-tracking';

interface TimeTrackingContextType {
  sessionId: string | null;
  isTracking: boolean;
  startTracking: () => Promise<string | null>;
  updateSession: () => Promise<any>;
  endTracking: () => Promise<any>;
  getDailyTimeData: (days?: number) => Promise<any>;
}

const TimeTrackingContext = createContext<TimeTrackingContextType | undefined>(
  undefined
);

interface TimeTrackingProviderProps {
  children: ReactNode;
}

export function TimeTrackingProvider({ children }: TimeTrackingProviderProps) {
  const timeTracking = useTimeTracking();

  // Auto-start tracking when component mounts
  useEffect(() => {
    const initializeTracking = async () => {
      if (!timeTracking.isTracking) {
        await timeTracking.startTracking();
      }
    };

    initializeTracking();
  }, [timeTracking.isTracking]);

  return (
    <TimeTrackingContext.Provider value={timeTracking}>
      {children}
    </TimeTrackingContext.Provider>
  );
}

export function useTimeTrackingContext() {
  const context = useContext(TimeTrackingContext);
  if (context === undefined) {
    throw new Error(
      'useTimeTrackingContext must be used within a TimeTrackingProvider'
    );
  }
  return context;
}
