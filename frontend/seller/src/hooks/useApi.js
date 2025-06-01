import { useState, useEffect, useCallback, useRef } from 'react';

// Custom hook for API calls with loading and error states
export const useApi = (apiFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);
  const timeoutRef = useRef(null);

  const fetchData = useCallback(async () => {
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      // Add a small delay to debounce rapid requests
      await new Promise(resolve => {
        timeoutRef.current = setTimeout(resolve, 100);
      });

      const result = await apiFunction();

      // Only update state if request wasn't aborted
      if (!abortControllerRef.current.signal.aborted) {
        setData(result);
      }
    } catch (err) {
      // Only update error state if request wasn't aborted
      if (!abortControllerRef.current.signal.aborted) {
        setError(err.message || 'An error occurred');
        console.error('API Error:', err);
      }
    } finally {
      // Only update loading state if request wasn't aborted
      if (!abortControllerRef.current.signal.aborted) {
        setLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies); // Only depend on the actual dependencies, not apiFunction to prevent infinite loops

  useEffect(() => {
    fetchData();

    // Cleanup function to abort requests on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [fetchData]);

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

  const mutate = async (apiFunction, ...args) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      const result = await apiFunction(...args);
      setSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
      
      return result;
    } catch (err) {
      setError(err.message || 'An error occurred');
      console.error('API Mutation Error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);
  const clearSuccess = () => setSuccess(false);

  return { mutate, loading, error, success, clearError, clearSuccess };
};
