import { useState, useEffect, useCallback, useRef } from 'react';

export function usePoller<T>(
  fetchFn: () => Promise<T>,
  intervalMs: number,
  shouldPoll: boolean
) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const timeoutRef = useRef<number | ReturnType<typeof setTimeout> | null>(null);

  const executePoll = useCallback(async () => {
    try {
      setIsPolling(true);
      const result = await fetchFn();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsPolling(false);
      if (shouldPoll) {
        timeoutRef.current = setTimeout(executePoll, intervalMs);
      }
    }
  }, [fetchFn, intervalMs, shouldPoll]);

  useEffect(() => {
    if (shouldPoll) {
      executePoll();
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setIsPolling(false);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [shouldPoll, executePoll]);

  // Expose manual trigger
  const trigger = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    return executePoll();
  }, [executePoll]);

  return { data, error, isPolling, trigger };
}
