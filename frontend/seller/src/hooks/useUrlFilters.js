import { useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Hook for managing filter state in URL search parameters
 * Allows filters to persist across page reloads and be shareable
 */
export const useUrlFilters = (filterState, setFilterState) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Load filters from URL on mount
  useEffect(() => {
    const urlFilters = {};
    
    // Extract all filter parameters from URL
    for (const [key, value] of searchParams.entries()) {
      if (key.startsWith('filter_') || key === 'search' || key === 'sort_by' || key === 'sort_order') {
        const filterKey = key.replace('filter_', '');
        
        // Parse different types of values
        if (value === 'true') {
          urlFilters[filterKey] = true;
        } else if (value === 'false') {
          urlFilters[filterKey] = false;
        } else if (!isNaN(value) && value !== '') {
          urlFilters[filterKey] = parseFloat(value);
        } else {
          urlFilters[filterKey] = value;
        }
      }
    }

    // Apply URL filters to state if any exist
    if (Object.keys(urlFilters).length > 0) {
      setFilterState(prev => ({ ...prev, ...urlFilters }));
    }
  }, []); // Only run on mount

  // Update URL when filters change
  const updateUrlFilters = useCallback((filters) => {
    const newSearchParams = new URLSearchParams();

    // Add all non-empty filter values to URL
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        const paramKey = ['search', 'sort_by', 'sort_order'].includes(key) ? key : `filter_${key}`;
        newSearchParams.set(paramKey, value.toString());
      }
    });

    setSearchParams(newSearchParams);
  }, [setSearchParams]);

  // Clear all filters from URL
  const clearUrlFilters = useCallback(() => {
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  // Get shareable URL with current filters
  const getShareableUrl = useCallback(() => {
    return `${window.location.origin}${window.location.pathname}?${searchParams.toString()}`;
  }, [searchParams]);

  return {
    updateUrlFilters,
    clearUrlFilters,
    getShareableUrl
  };
};

/**
 * Hook specifically for product filters
 */
export const useProductFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Extract filters from URL
  const getFiltersFromUrl = useCallback(() => {
    const filters = {
      searchQuery: searchParams.get('search') || '',
      priceMin: searchParams.get('filter_price_min') || '',
      priceMax: searchParams.get('filter_price_max') || '',
      volumeMin: searchParams.get('filter_volume_min') || '',
      volumeMax: searchParams.get('filter_volume_max') || '',
      selectedWoodType: searchParams.get('filter_wood_type') || '',
      deliveryFilter: searchParams.get('filter_delivery') || '',
      pickupLocationFilter: searchParams.get('filter_pickup_location') || '',
      dateFrom: searchParams.get('filter_date_from') || '',
      dateTo: searchParams.get('filter_date_to') || '',
      sortBy: searchParams.get('sort_by') || 'created_at',
      sortOrder: searchParams.get('sort_order') || 'desc'
    };
    return filters;
  }, [searchParams]);

  // Update URL with current filters
  const updateFiltersInUrl = useCallback((filters) => {
    const newSearchParams = new URLSearchParams();

    // Map filter state to URL parameters
    const urlMapping = {
      searchQuery: 'search',
      priceMin: 'filter_price_min',
      priceMax: 'filter_price_max',
      volumeMin: 'filter_volume_min',
      volumeMax: 'filter_volume_max',
      selectedWoodType: 'filter_wood_type',
      deliveryFilter: 'filter_delivery',
      pickupLocationFilter: 'filter_pickup_location',
      dateFrom: 'filter_date_from',
      dateTo: 'filter_date_to',
      sortBy: 'sort_by',
      sortOrder: 'sort_order'
    };

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        const urlKey = urlMapping[key] || key;
        newSearchParams.set(urlKey, value.toString());
      }
    });

    setSearchParams(newSearchParams);
  }, [setSearchParams]);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  // Check if any filters are active
  const hasActiveFilters = useCallback(() => {
    const filters = getFiltersFromUrl();
    return Object.values(filters).some(value => 
      value !== '' && value !== 'created_at' && value !== 'desc'
    );
  }, [getFiltersFromUrl]);

  return {
    getFiltersFromUrl,
    updateFiltersInUrl,
    clearAllFilters,
    hasActiveFilters
  };
};
