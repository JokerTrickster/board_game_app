import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for managing timeouts and intervals with automatic cleanup
 * Prevents memory leaks by ensuring all timers are cleared on unmount
 */
export const useTimers = () => {
  const timeoutsRef = useRef<Set<NodeJS.Timeout>>(new Set());
  const intervalsRef = useRef<Set<NodeJS.Timeout>>(new Set());

  // Create a timeout with automatic tracking
  const setTimeout = useCallback((callback: () => void, delay: number): NodeJS.Timeout => {
    const timeoutId = global.setTimeout(() => {
      // Remove from tracking set when executed
      timeoutsRef.current.delete(timeoutId);
      callback();
    }, delay);

    // Track the timeout for cleanup
    timeoutsRef.current.add(timeoutId);
    return timeoutId;
  }, []);

  // Create an interval with automatic tracking
  const setInterval = useCallback((callback: () => void, delay: number): NodeJS.Timeout => {
    const intervalId = global.setInterval(callback, delay);

    // Track the interval for cleanup
    intervalsRef.current.add(intervalId);
    return intervalId;
  }, []);

  // Clear a specific timeout
  const clearTimeout = useCallback((timeoutId: NodeJS.Timeout) => {
    global.clearTimeout(timeoutId);
    timeoutsRef.current.delete(timeoutId);
  }, []);

  // Clear a specific interval
  const clearInterval = useCallback((intervalId: NodeJS.Timeout) => {
    global.clearInterval(intervalId);
    intervalsRef.current.delete(intervalId);
  }, []);

  // Clear all timers immediately
  const clearAllTimers = useCallback(() => {
    // Clear all timeouts
    timeoutsRef.current.forEach(id => {
      global.clearTimeout(id);
    });
    timeoutsRef.current.clear();

    // Clear all intervals
    intervalsRef.current.forEach(id => {
      global.clearInterval(id);
    });
    intervalsRef.current.clear();
  }, []);

  // Get timer counts for debugging
  const getTimerCounts = useCallback(() => ({
    timeouts: timeoutsRef.current.size,
    intervals: intervalsRef.current.size,
    total: timeoutsRef.current.size + intervalsRef.current.size,
  }), []);

  // Cleanup all timers on unmount
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, [clearAllTimers]);

  return {
    setTimeout,
    setInterval,
    clearTimeout,
    clearInterval,
    clearAllTimers,
    getTimerCounts,
  };
};

/**
 * Hook for a single timeout that automatically cleans up
 * @param callback - Function to execute after delay
 * @param delay - Delay in milliseconds (null to disable)
 */
export const useTimeout = (callback: () => void, delay: number | null) => {
  const savedCallback = useRef(callback);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the timeout
  useEffect(() => {
    if (delay === null) {
      return;
    }

    const tick = () => savedCallback.current();

    timeoutRef.current = global.setTimeout(tick, delay);

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        global.clearTimeout(timeoutRef.current);
      }
    };
  }, [delay]);

  // Return early clear function
  const clearEarly = useCallback(() => {
    if (timeoutRef.current) {
      global.clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, []);

  return clearEarly;
};

/**
 * Hook for a single interval that automatically cleans up
 * @param callback - Function to execute repeatedly
 * @param delay - Delay in milliseconds (null to disable)
 */
export const useInterval = (callback: () => void, delay: number | null) => {
  const savedCallback = useRef(callback);
  const intervalRef = useRef<NodeJS.Timeout>();

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    if (delay === null) {
      return;
    }

    const tick = () => savedCallback.current();

    intervalRef.current = global.setInterval(tick, delay);

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        global.clearInterval(intervalRef.current);
      }
    };
  }, [delay]);

  // Return early clear function
  const clearEarly = useCallback(() => {
    if (intervalRef.current) {
      global.clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  }, []);

  return clearEarly;
};
