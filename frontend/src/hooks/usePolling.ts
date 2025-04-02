import { useCallback, useEffect, useRef, useState } from "react";

interface UsePollingProps<T> {
  pollingFn: () => Promise<T>;
  interval?: number;
  maxAttempts?: number;
  stopCondition?: (data: T) => boolean;
  onSuccess?: (data: T) => void;
  onMaxAttemptsReached?: () => void;
  onError?: (error: Error) => void;
  enabled?: boolean;
}

export function usePolling<T>({
  pollingFn,
  interval = 3000,
  maxAttempts = 20,
  stopCondition = () => false,
  onSuccess,
  onMaxAttemptsReached,
  onError,
  enabled = true,
}: UsePollingProps<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [stopped, setStopped] = useState(false);

  const attemptCountRef = useRef(0);
  const timeoutRef = useRef<number | null>(null);

  const clearPollingTimeout = () => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const startPolling = useCallback(() => {
    if (!enabled) return;

    setLoading(true);
    setStopped(false);
    attemptCountRef.current = 0;

    const poll = async () => {
      if (stopped || !enabled) return;

      try {
        attemptCountRef.current += 1;

        const result = await pollingFn();
        setData(result);

        const shouldStop = stopCondition(result);

        if (shouldStop) {
          setStopped(true);
          setLoading(false);
          if (onSuccess) onSuccess(result);
          return;
        }

        if (attemptCountRef.current >= maxAttempts) {
          setStopped(true);
          setLoading(false);
          if (onMaxAttemptsReached) onMaxAttemptsReached();
          return;
        }

        clearPollingTimeout();
        timeoutRef.current = window.setTimeout(poll, interval);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        setLoading(false);
        setStopped(true);
        if (onError) onError(error);
      }
    };

    poll();

    return () => {
      clearPollingTimeout();
      setStopped(true);
    };
  }, [
    enabled,
    interval,
    maxAttempts,
    onError,
    onMaxAttemptsReached,
    onSuccess,
    pollingFn,
    stopCondition,
    stopped,
  ]);

  const stopPolling = useCallback(() => {
    clearPollingTimeout();
    setStopped(true);
    setLoading(false);
  }, []);

  useEffect(() => {
    return () => {
      clearPollingTimeout();
    };
  }, []);

  return {
    data,
    loading,
    error,
    stopped,
    startPolling,
    stopPolling,
  };
}
