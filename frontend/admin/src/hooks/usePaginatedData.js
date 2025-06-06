/**
 * React hooks for handling paginated data with progressive loading
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchAllPages, ProgressiveDataLoader } from '../utils/paginationUtils';

/**
 * Hook for fetching complete datasets with pagination handling
 * 
 * @param {Function} fetchFunction - Function that takes (offset, limit) and returns paginated response
 * @param {Array} dependencies - Dependencies that trigger refetch
 * @param {Object} options - Configuration options
 * @returns {Object} { data, loading, error, total, refetch, progress }
 */
export function useCompleteDataset(fetchFunction, _dependencies = [], options = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [progress, setProgress] = useState({ loaded: 0, total: 0 });
  
  const abortControllerRef = useRef(null);

  const fetchData = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setLoading(true);
    setError(null);
    setProgress({ loaded: 0, total: 0 });

    try {
      const result = await fetchAllPages(fetchFunction, {
        onProgress: (loaded, total) => {
          setProgress({ loaded, total });
        },
        debug: process.env.NODE_ENV === 'development',
        ...options
      });

      if (!abortControllerRef.current.signal.aborted) {
        setData(result.data || []);
        setTotal(result.total || 0);
        setProgress({ loaded: result.total || 0, total: result.total || 0 });
      }
    } catch (err) {
      if (!abortControllerRef.current.signal.aborted) {
        setError(err);
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to fetch complete dataset:', err);
        }
      }
    } finally {
      if (!abortControllerRef.current.signal.aborted) {
        setLoading(false);
      }
    }
  }, [fetchFunction, options]);

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

  return {
    data,
    loading,
    error,
    total,
    progress,
    refetch
  };
}

/**
 * Hook for progressive data loading with chunked updates
 * Useful for large datasets that need to show partial results
 * 
 * @param {Function} fetchFunction - Function that takes (offset, limit) and returns paginated response
 * @param {Array} dependencies - Dependencies that trigger refetch
 * @param {Object} options - Configuration options
 * @returns {Object} { data, loading, error, total, progress, refetch, loadMore, hasMore }
 */
export function useProgressiveData(fetchFunction, _dependencies = [], options = {}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [progress, setProgress] = useState({ loaded: 0, total: 0 });
  const [hasMore, setHasMore] = useState(true);
  
  const loaderRef = useRef(null);
  const abortControllerRef = useRef(null);

  const startLoading = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    setError(null);
    setData([]);
    setProgress({ loaded: 0, total: 0 });
    setHasMore(true);

    if (loaderRef.current) {
      loaderRef.current.stop();
    }

    loaderRef.current = new ProgressiveDataLoader(fetchFunction, {
      onProgress: (loaded, total) => {
        setProgress({ loaded, total });
      },
      onChunkLoaded: (chunk, loaded, total) => {
        if (!abortControllerRef.current.signal.aborted) {
          setData(prevData => [...prevData, ...chunk]);
          setProgress({ loaded, total });
        }
      },
      onComplete: (allData, total) => {
        if (!abortControllerRef.current.signal.aborted) {
          setData(allData);
          setTotal(total);
          setProgress({ loaded: total, total });
          setHasMore(false);
          setLoading(false);
        }
      },
      onError: (err) => {
        if (!abortControllerRef.current.signal.aborted) {
          setError(err);
          setLoading(false);
        }
      },
      ...options
    });

    try {
      await loaderRef.current.load();
    } catch (err) {
      if (!abortControllerRef.current.signal.aborted) {
        setError(err);
        setLoading(false);
      }
    }
  }, [fetchFunction, options]);

  useEffect(() => {
    startLoading();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (loaderRef.current) {
        loaderRef.current.stop();
      }
    };
  }, [startLoading]);

  const refetch = useCallback(() => {
    startLoading();
  }, [startLoading]);

  const loadMore = useCallback(() => {
    // For progressive loading, this would continue loading if paused
    if (loaderRef.current && !loading) {
      loaderRef.current.load();
    }
  }, [loading]);

  return {
    data,
    loading,
    error,
    total,
    progress,
    hasMore,
    refetch,
    loadMore
  };
}

/**
 * Hook for standard paginated data (page-by-page navigation)
 * 
 * @param {Function} fetchFunction - Function that takes (page, size) and returns paginated response
 * @param {Array} dependencies - Dependencies that trigger refetch
 * @param {Object} options - Configuration options
 * @returns {Object} Pagination state and controls
 */
export function usePaginatedData(fetchFunction, _dependencies = [], options = {}) {
  const {
    initialPage = 0,
    pageSize = 20
  } = options;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(initialPage);
  
  const abortControllerRef = useRef(null);

  const fetchData = useCallback(async (pageNum = page) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    setError(null);

    try {
      const result = await fetchFunction(pageNum, pageSize);
      
      if (!abortControllerRef.current.signal.aborted) {
        setData(result.data || []);
        setTotal(result.total || 0);
      }
    } catch (err) {
      if (!abortControllerRef.current.signal.aborted) {
        setError(err);
        if (process.env.NODE_ENV === 'development') {
          console.error('Failed to fetch paginated data:', err);
        }
      }
    } finally {
      if (!abortControllerRef.current.signal.aborted) {
        setLoading(false);
      }
    }
  }, [fetchFunction, page, pageSize]);

  useEffect(() => {
    fetchData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData, page]);

  const goToPage = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  const nextPage = useCallback(() => {
    const totalPages = Math.ceil(total / pageSize);
    if (page < totalPages - 1) {
      setPage(page + 1);
    }
  }, [page, total, pageSize]);

  const prevPage = useCallback(() => {
    if (page > 0) {
      setPage(page - 1);
    }
  }, [page]);

  const refetch = useCallback(() => {
    fetchData(page);
  }, [fetchData, page]);

  const totalPages = Math.ceil(total / pageSize);
  const hasNext = page < totalPages - 1;
  const hasPrev = page > 0;

  return {
    data,
    loading,
    error,
    total,
    page,
    pageSize,
    totalPages,
    hasNext,
    hasPrev,
    goToPage,
    nextPage,
    prevPage,
    refetch
  };
}

const paginatedDataHooks = {
  useCompleteDataset,
  useProgressiveData,
  usePaginatedData
};

export default paginatedDataHooks;
