'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface TimeTrackingData {
  date: string;
  day: string;
  hours: number;
  seconds: number;
  sessionCount: number;
}

interface TimeTrackingResponse {
  data: TimeTrackingData[];
  total: {
    hours: number;
    seconds: number;
    days: number;
  };
}

export function useTimeTracking() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const lastUpdateRef = useRef<number>(0);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update session with current activity
  const updateSession = useCallback(async () => {
    if (!sessionId) return;

    try {
      const response = await fetch('/api/time-tracking/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      if (response.ok) {
        const data = await response.json();
        lastUpdateRef.current = Date.now();
        return data;
      }
    } catch (error) {
      console.error('Failed to update session:', error);
    }
  }, [sessionId]);

  // Start session tracking
  const startTracking = useCallback(async () => {
    try {
      const response = await fetch('/api/time-tracking/start', {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        setSessionId(data.sessionId);
        setIsTracking(true);
        lastUpdateRef.current = Date.now();

        // Start periodic updates every 60 seconds
        updateIntervalRef.current = setInterval(() => {
          updateSession();
        }, 60000);

        return data.sessionId;
      }
    } catch (error) {
      console.error('Failed to start time tracking:', error);
    }
    return null;
  }, [updateSession]);

  // End session tracking
  const endTracking = useCallback(async () => {
    if (!sessionId) return;

    try {
      const response = await fetch('/api/time-tracking/end', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      if (response.ok) {
        setIsTracking(false);
        setSessionId(null);

        if (updateIntervalRef.current) {
          clearInterval(updateIntervalRef.current);
          updateIntervalRef.current = null;
        }

        return await response.json();
      }
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  }, [sessionId]);

  // Get daily time data
  const getDailyTimeData = useCallback(
    async (days: number = 7): Promise<TimeTrackingResponse | null> => {
      try {
        const response = await fetch(`/api/time-tracking/daily?days=${days}`);

        if (response.ok) {
          return await response.json();
        }
      } catch (error) {
        console.error('Failed to fetch daily time data:', error);
      }
      return null;
    },
    []
  );

  // Track user activity events
  useEffect(() => {
    const handleActivity = () => {
      if (isTracking && sessionId) {
        const now = Date.now();
        // Only update if it's been more than 30 seconds since last update
        if (now - lastUpdateRef.current > 30000) {
          updateSession();
        }
      }
    };

    // Track various user activities
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [isTracking, sessionId, updateSession]);

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, end session
        if (isTracking) {
          endTracking();
        }
      } else {
        // Page is visible, start new session
        if (!isTracking) {
          startTracking();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isTracking, endTracking, startTracking]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
      if (isTracking && sessionId) {
        endTracking();
      }
    };
  }, [isTracking, sessionId, endTracking]);

  return {
    sessionId,
    isTracking,
    startTracking,
    updateSession,
    endTracking,
    getDailyTimeData,
  };
}
