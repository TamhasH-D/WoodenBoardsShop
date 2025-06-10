import { useState, useEffect, useCallback, useRef } from 'react';

// Custom hook for API calls with loading and error states
export const useApi = (apiFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);
  const apiRef = useRef(apiFunction);
  const lastDepsRef = useRef(dependencies);
  const requestCountRef = useRef(0);

  // Update the API function reference without triggering re-renders
  apiRef.current = apiFunction;

  // Check if dependencies actually changed to prevent unnecessary requests
  const depsChanged = JSON.stringify(dependencies) !== JSON.stringify(lastDepsRef.current);

  const fetchData = useCallback(async () => {
    // Prevent too many requests
    requestCountRef.current += 1;
    const currentRequestId = requestCountRef.current;

    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      // Use the current API function reference
      const result = await apiRef.current(abortControllerRef.current.signal);

      // Only update state if this is still the latest request and wasn't aborted
      if (currentRequestId === requestCountRef.current && !abortControllerRef.current.signal.aborted) {
        setData(result);
      }
    } catch (err) {
      // Only update error state if this is still the latest request and wasn't aborted
      if (currentRequestId === requestCountRef.current && !abortControllerRef.current.signal.aborted) {
        setError(err.message || 'An error occurred');
        console.error('API Error:', err);
      }
    } finally {
      // Only update loading state if this is still the latest request and wasn't aborted
      if (currentRequestId === requestCountRef.current && !abortControllerRef.current.signal.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    // Only fetch if dependencies actually changed or it's the first load
    if (depsChanged || lastDepsRef.current === dependencies) {
      lastDepsRef.current = dependencies;
      fetchData();
    }

    // Cleanup function to abort request on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
};

// Hook for API mutations (create, update, delete)
export const useApiMutation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const abortControllerRef = useRef(null);
  const timeoutRef = useRef(null);

  const mutate = useCallback(async (apiFunction, ...args) => {
    // Prevent multiple simultaneous mutations
    if (loading) {
      console.warn('Mutation already in progress, ignoring duplicate request');
      return;
    }

    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const result = await apiFunction(...args, abortControllerRef.current.signal);

      // Only update state if request wasn't aborted
      if (!abortControllerRef.current.signal.aborted) {
        setSuccess(true);

        // Clear success message after 3 seconds
        timeoutRef.current = setTimeout(() => {
          setSuccess(false);
        }, 3000);
      }

      return result;
    } catch (err) {
      // Only update error state if request wasn't aborted
      if (!abortControllerRef.current.signal.aborted) {
        setError(err.message || 'An error occurred');
        console.error('API Mutation Error:', err);
      }
      throw err;
    } finally {
      // Only update loading state if request wasn't aborted
      if (!abortControllerRef.current.signal.aborted) {
        setLoading(false);
      }
    }
  }, [loading]);

  const clearError = useCallback(() => setError(null), []);
  const clearSuccess = useCallback(() => {
    setSuccess(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { mutate, loading, error, success, clearError, clearSuccess };
};
