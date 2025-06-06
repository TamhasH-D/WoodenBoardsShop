/**
 * Universal pagination utilities for handling backend API pagination
 * 
 * Backend API Structure:
 * - Uses offset-based pagination with limit <= 20
 * - Returns: { data: [...], pagination: { total: number } }
 * - Query params: ?offset=0&limit=20
 */

/**
 * Configuration constants
 */
export const PAGINATION_CONFIG = {
  MAX_LIMIT: 20, // Backend enforced maximum
  DEFAULT_LIMIT: 20,
  DEFAULT_OFFSET: 0,
  PARALLEL_REQUEST_LIMIT: 5, // Max concurrent requests
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
};

/**
 * Simple cache for complete datasets
 */
class PaginationCache {
  constructor() {
    this.cache = new Map();
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    const now = Date.now();
    if (now - item.timestamp > PAGINATION_CONFIG.CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  set(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  delete(key) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }
}

const paginationCache = new PaginationCache();

/**
 * Fetch all pages of data from a paginated endpoint
 * 
 * @param {Function} fetchFunction - Function that takes (offset, limit) and returns paginated response
 * @param {Object} options - Configuration options
 * @param {string} options.cacheKey - Cache key for the complete dataset
 * @param {boolean} options.useCache - Whether to use caching (default: true)
 * @param {boolean} options.parallel - Whether to fetch pages in parallel (default: true)
 * @param {number} options.maxConcurrent - Max concurrent requests (default: 5)
 * @param {Function} options.onProgress - Progress callback (current, total)
 * @param {boolean} options.debug - Enable debug logging
 * @returns {Promise<Object>} Complete dataset with all items
 */
export async function fetchAllPages(fetchFunction, options = {}) {
  const {
    cacheKey,
    useCache = true,
    parallel = true,
    maxConcurrent = PAGINATION_CONFIG.PARALLEL_REQUEST_LIMIT,
    onProgress,
    debug = false
  } = options;

  // Check cache first
  if (useCache && cacheKey) {
    const cached = paginationCache.get(cacheKey);
    if (cached) {
      if (debug) console.log(`[PaginationUtils] Cache hit for ${cacheKey}`);
      return cached;
    }
  }

  try {
    if (debug) console.log(`[PaginationUtils] Fetching all pages for ${cacheKey || 'uncached request'}`);

    // Fetch first page to get total count
    const firstPage = await fetchFunction(0, PAGINATION_CONFIG.DEFAULT_LIMIT);
    const total = firstPage.pagination?.total || firstPage.total || 0;
    let allData = [...(firstPage.data || [])];

    if (debug) console.log(`[PaginationUtils] First page: ${allData.length} items, total: ${total}`);

    // If there are more items, fetch remaining pages
    if (total > PAGINATION_CONFIG.DEFAULT_LIMIT) {
      const remainingItems = total - PAGINATION_CONFIG.DEFAULT_LIMIT;
      const additionalPages = Math.ceil(remainingItems / PAGINATION_CONFIG.DEFAULT_LIMIT);
      
      if (debug) console.log(`[PaginationUtils] Need to fetch ${additionalPages} additional pages`);

      if (parallel) {
        // Fetch pages in parallel with concurrency limit
        const pagePromises = [];
        for (let page = 1; page <= additionalPages; page++) {
          const offset = page * PAGINATION_CONFIG.DEFAULT_LIMIT;
          pagePromises.push(() => fetchFunction(offset, PAGINATION_CONFIG.DEFAULT_LIMIT));
        }

        // Execute with concurrency limit
        const additionalPagesData = await executeWithConcurrencyLimit(
          pagePromises,
          maxConcurrent,
          (completed, total) => {
            if (onProgress) onProgress(completed + 1, total + 1); // +1 for first page
            if (debug) console.log(`[PaginationUtils] Progress: ${completed + 1}/${total + 1} pages`);
          }
        );

        // Combine all data
        additionalPagesData.forEach(pageData => {
          if (pageData && pageData.data) {
            allData = allData.concat(pageData.data);
          }
        });
      } else {
        // Fetch pages sequentially
        for (let page = 1; page <= additionalPages; page++) {
          const offset = page * PAGINATION_CONFIG.DEFAULT_LIMIT;
          const pageData = await fetchFunction(offset, PAGINATION_CONFIG.DEFAULT_LIMIT);
          
          if (pageData && pageData.data) {
            allData = allData.concat(pageData.data);
          }

          if (onProgress) onProgress(page + 1, additionalPages + 1);
          if (debug) console.log(`[PaginationUtils] Fetched page ${page + 1}/${additionalPages + 1}`);
        }
      }
    }

    const result = {
      data: allData,
      total: total,
      offset: 0,
      limit: allData.length,
      pages: Math.ceil(total / PAGINATION_CONFIG.DEFAULT_LIMIT),
      fetchedAt: new Date().toISOString()
    };

    // Cache the complete dataset
    if (useCache && cacheKey) {
      paginationCache.set(cacheKey, result);
      if (debug) console.log(`[PaginationUtils] Cached complete dataset for ${cacheKey}`);
    }

    if (debug) console.log(`[PaginationUtils] Completed: ${allData.length} total items`);
    return result;

  } catch (error) {
    console.error('[PaginationUtils] Error fetching all pages:', error);
    throw error;
  }
}

/**
 * Execute promises with concurrency limit
 */
async function executeWithConcurrencyLimit(promiseFunctions, limit, onProgress) {
  const results = [];
  const executing = [];
  let completed = 0;

  const createPromiseWithProgress = (promiseFunction) => {
    return promiseFunction().then((result) => {
      completed++;
      if (onProgress) onProgress(completed, promiseFunctions.length);
      return result;
    });
  };

  for (const promiseFunction of promiseFunctions) {
    const promise = createPromiseWithProgress(promiseFunction);
    results.push(promise);

    if (promiseFunctions.length >= limit) {
      executing.push(promise);

      if (executing.length >= limit) {
        await Promise.race(executing);
        executing.splice(executing.findIndex(p => p === promise), 1);
      }
    }
  }

  return Promise.all(results);
}

/**
 * Create a paginated fetch function for a specific endpoint
 * 
 * @param {Function} apiCall - Base API call function
 * @param {string} endpoint - Endpoint identifier for caching
 * @returns {Function} Function that can fetch all pages
 */
export function createPaginatedFetcher(apiCall, endpoint) {
  return async (options = {}) => {
    const fetchFunction = async (offset, limit) => {
      return await apiCall(Math.floor(offset / limit), limit);
    };

    return await fetchAllPages(fetchFunction, {
      cacheKey: `all_${endpoint}`,
      debug: process.env.NODE_ENV === 'development',
      ...options
    });
  };
}

/**
 * Clear pagination cache
 */
export function clearPaginationCache(key = null) {
  if (key) {
    paginationCache.delete(key);
  } else {
    paginationCache.clear();
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  const entries = Array.from(paginationCache.cache.entries());
  return {
    size: entries.length,
    keys: entries.map(([key]) => key),
    totalItems: entries.reduce((sum, [, value]) => sum + (value.data?.data?.length || 0), 0)
  };
}

/**
 * Progressive data loader for UI components
 * Loads data in chunks and provides progress updates
 */
export class ProgressiveDataLoader {
  constructor(fetchFunction, options = {}) {
    this.fetchFunction = fetchFunction;
    this.options = {
      chunkSize: PAGINATION_CONFIG.DEFAULT_LIMIT,
      onProgress: () => {},
      onChunkLoaded: () => {},
      onComplete: () => {},
      onError: () => {},
      ...options
    };
    
    this.isLoading = false;
    this.data = [];
    this.total = 0;
    this.loadedCount = 0;
  }

  async load() {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.data = [];
    this.loadedCount = 0;

    try {
      // Get first chunk to determine total
      const firstChunk = await this.fetchFunction(0, this.options.chunkSize);
      this.total = firstChunk.pagination?.total || firstChunk.total || 0;
      this.data = [...(firstChunk.data || [])];
      this.loadedCount = this.data.length;

      this.options.onProgress(this.loadedCount, this.total);
      this.options.onChunkLoaded(firstChunk.data || [], this.loadedCount, this.total);

      // Load remaining chunks
      if (this.total > this.options.chunkSize) {
        const remainingChunks = Math.ceil((this.total - this.options.chunkSize) / this.options.chunkSize);
        
        for (let i = 1; i <= remainingChunks; i++) {
          const offset = i * this.options.chunkSize;
          const chunk = await this.fetchFunction(offset, this.options.chunkSize);
          
          if (chunk.data) {
            this.data = this.data.concat(chunk.data);
            this.loadedCount = this.data.length;
            
            this.options.onProgress(this.loadedCount, this.total);
            this.options.onChunkLoaded(chunk.data, this.loadedCount, this.total);
          }
        }
      }

      this.options.onComplete(this.data, this.total);
      return {
        data: this.data,
        total: this.total,
        loadedCount: this.loadedCount
      };

    } catch (error) {
      this.options.onError(error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  stop() {
    this.isLoading = false;
  }
}

const paginationUtils = {
  fetchAllPages,
  createPaginatedFetcher,
  clearPaginationCache,
  getCacheStats,
  ProgressiveDataLoader,
  PAGINATION_CONFIG
};

export default paginationUtils;
