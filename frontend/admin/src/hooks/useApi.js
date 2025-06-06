import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '../utils/api/client';

/**
 * Simple API hook for basic API calls with loading and error states
 */
export function useApi(apiFunction, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);
  const apiRef = useRef(apiFunction);

  // Update the API function reference without triggering re-renders
  apiRef.current = apiFunction;

  const fetchData = useCallback(async () => {
    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);
      const result = await apiRef.current();

      if (!abortControllerRef.current.signal.aborted) {
        setData(result);
      }
    } catch (err) {
      if (!abortControllerRef.current.signal.aborted) {
        setError(err.message || 'An error occurred');
        console.error('API Error:', err);
      }
    } finally {
      if (!abortControllerRef.current.signal.aborted) {
        setLoading(false);
      }
    }
  }, dependencies);

  useEffect(() => {
    fetchData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}

/**
 * Debounced API hook to prevent excessive requests
 */
export function useDebouncedApi(apiFunction, dependencies = [], delay = 300) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);
  const timeoutRef = useRef(null);
  const apiRef = useRef(apiFunction);

  // Update the API function reference without triggering re-renders
  apiRef.current = apiFunction;

  const debouncedFetch = useCallback(async () => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    timeoutRef.current = setTimeout(async () => {
      abortControllerRef.current = new AbortController();

      try {
        setLoading(true);
        setError(null);
        const result = await apiRef.current();

        if (!abortControllerRef.current.signal.aborted) {
          setData(result);
        }
      } catch (err) {
        if (!abortControllerRef.current.signal.aborted) {
          setError(err.message || 'An error occurred');
          console.error('API Error:', err);
        }
      } finally {
        if (!abortControllerRef.current.signal.aborted) {
          setLoading(false);
        }
      }
    }, delay);
  }, [...dependencies, delay]);

  useEffect(() => {
    debouncedFetch();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedFetch]);

  const refetch = useCallback(() => {
    debouncedFetch();
  }, [debouncedFetch]);

  return { data, loading, error, refetch };
}

/**
 * Hook for API mutations (create, update, delete)
 */
export function useApiMutation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const mutate = useCallback(async (apiFunction, ...args) => {
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
  }, []);

  const clearError = useCallback(() => setError(null), []);
  const clearSuccess = useCallback(() => setSuccess(false), []);

  return { mutate, loading, error, success, clearError, clearSuccess };
}

/**
 * Paginated data hook
 */
export function usePaginatedApi(endpoint, options = {}) {
  const {
    pageSize = 25,
    initialPage = 1,
    params = {},
  } = options;

  const [page, setPage] = useState(initialPage);
  const [pageSize_, setPageSize] = useState(pageSize);

  // Serialize params to prevent infinite loops from object recreation
  const paramsString = JSON.stringify(params);

  const apiFunction = useCallback(async () => {
    const paginatedParams = {
      ...JSON.parse(paramsString),
      page,
      page_size: pageSize_,
    };
    return await apiClient.get(endpoint, paginatedParams);
  }, [endpoint, paramsString, page, pageSize_]);

  const { data, loading, error, refetch } = useApi(apiFunction, [endpoint, paramsString, page, pageSize_]);

  const results = data?.results || [];
  const totalCount = data?.count || 0;
  const totalPages = Math.ceil(totalCount / pageSize_);

  return {
    data: results,
    loading,
    error,
    refetch,
    pagination: {
      page,
      pageSize: pageSize_,
      totalCount,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
      setPage,
      setPageSize,
      nextPage: () => setPage((p) => Math.min(p + 1, totalPages)),
      previousPage: () => setPage((p) => Math.max(p - 1, 1)),
      firstPage: () => setPage(1),
      lastPage: () => setPage(totalPages),
    },
  };
}
