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
  const [isPolling, setIsPolling] = useState(enabled);

  const attemptCountRef = useRef(0);
  const timeoutRef = useRef<number | null>(null);

  const clearPollingTimeout = () => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const startPolling = useCallback(() => {
    clearPollingTimeout();
    setIsPolling(true);
    setStopped(false);
    setLoading(true);
    attemptCountRef.current = 0;
  }, []);

  const stopPolling = useCallback(() => {
    clearPollingTimeout();
    setStopped(true);
    setIsPolling(false);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!isPolling) {
      console.log("Polling not enabled");
      return;
    }

    let isMounted = true;

    const poll = async () => {
      if (!isMounted || stopped) {
        console.log("Polling stopped: component unmounted or stopped flag set");
        return;
      }

      try {
        attemptCountRef.current += 1;
        const result = await pollingFn();
        if (isMounted) {
          setData(result);
          const shouldStop = stopCondition(result);
          if (shouldStop) {
            setStopped(true);
            setLoading(false);
            setIsPolling(false);
            if (onSuccess) onSuccess(result);
            return;
          }

          if (attemptCountRef.current >= maxAttempts) {
            setStopped(true);
            setLoading(false);
            setIsPolling(false);
            if (onMaxAttemptsReached) onMaxAttemptsReached();
            return;
          }
          clearPollingTimeout();
          timeoutRef.current = window.setTimeout(poll, interval);
        }
      } catch (err) {
        if (isMounted) {
          const error = err instanceof Error ? err : new Error(String(err));
          setError(error);
          setLoading(false);
          setStopped(true);
          setIsPolling(false);
          if (onError) onError(error);
        }
      }
    };

    poll();

    return () => {
      console.log("Cleaning up polling effect");
      isMounted = false;
      clearPollingTimeout();
    };
  }, [
    isPolling,
    pollingFn,
    interval,
    maxAttempts,
    stopCondition,
    stopped,
    onSuccess,
    onMaxAttemptsReached,
    onError,
  ]);

  useEffect(() => {
    if (enabled && !isPolling && !stopped) {
      console.log("Auto-starting polling because enabled=true");
      startPolling();
    }
  }, [enabled, isPolling, stopped, startPolling]);

  return {
    data,
    loading,
    error,
    stopped,
    isPolling,
    startPolling,
    stopPolling,
  };
}
