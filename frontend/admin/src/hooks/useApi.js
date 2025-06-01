import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../utils/api/client';

/**
 * Simple API hook for basic API calls with loading and error states
 */
export function useApi(apiFunction, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await apiFunction();

        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'An error occurred');
          console.error('API Error:', err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction();
      setData(result);
    } catch (err) {
      setError(err.message || 'An error occurred');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies); // Use dependencies instead of apiFunction to prevent infinite loops

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

  const apiFunction = useCallback(async () => {
    const paginatedParams = {
      ...params,
      page,
      page_size: pageSize_,
    };
    return await apiClient.get(endpoint, paginatedParams);
  }, [endpoint, params, page, pageSize_]);

  const { data, loading, error, refetch } = useApi(apiFunction, [endpoint, page, pageSize_, params]);

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
