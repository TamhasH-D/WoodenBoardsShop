import { useState, useMemo, useCallback, useEffect } from 'react';
import { useUIStore } from '../stores/uiStore';
import { usePaginatedApi } from './useApi';

/**
 * Enterprise-grade table hook with advanced features
 */
export function useTable(endpoint, options = {}) {
  const {
    tableId,
    initialPageSize = 25,
    initialSortBy = null,
    initialSortOrder = 'asc',
    initialFilters = {},
    searchFields = ['name'],
    enableSelection = true,
    enableBulkActions = true,
    persistState = true,
    ...apiOptions
  } = options;

  const { setTableState, getTableState } = useUIStore();

  // Get persisted state
  const persistedState = persistState && tableId ? getTableState(tableId) : {};

  // State management
  const [pageSize, setPageSize] = useState(persistedState.pageSize || initialPageSize);
  const [sortBy, setSortBy] = useState(persistedState.sortBy || initialSortBy);
  const [sortOrder, setSortOrder] = useState(persistedState.sortOrder || initialSortOrder);
  const [filters, setFilters] = useState(persistedState.filters || initialFilters);
  const [searchTerm, setSearchTerm] = useState(persistedState.searchTerm || '');
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [expandedRows, setExpandedRows] = useState(new Set());

  // Persist state changes
  useEffect(() => {
    if (persistState && tableId) {
      setTableState(tableId, {
        pageSize,
        sortBy,
        sortOrder,
        filters,
        searchTerm,
      });
    }
  }, [persistState, tableId, pageSize, sortBy, sortOrder, filters, searchTerm, setTableState]);

  // Build API parameters
  const apiParams = useMemo(() => {
    const params = { ...filters };

    // Add search
    if (searchTerm) {
      if (searchFields.length === 1) {
        params[`${searchFields[0]}__icontains`] = searchTerm;
      } else {
        params.search = searchTerm;
      }
    }

    // Add sorting
    if (sortBy) {
      params.ordering = sortOrder === 'desc' ? `-${sortBy}` : sortBy;
    }

    return params;
  }, [filters, searchTerm, searchFields, sortBy, sortOrder]);

  // Fetch data
  const query = usePaginatedApi(endpoint, {
    ...apiOptions,
    pageSize,
    params: apiParams,
  });

  const { data, pagination, isLoading, error, refetch } = query;

  // Selection handlers
  const handleSelectRow = useCallback((rowId) => {
    if (!enableSelection) return;

    setSelectedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(rowId)) {
        newSet.delete(rowId);
      } else {
        newSet.add(rowId);
      }
      return newSet;
    });
  }, [enableSelection]);

  const handleSelectAll = useCallback(() => {
    if (!enableSelection) return;

    setSelectedRows((prev) => {
      const allSelected = data.every((row) => prev.has(row.id));
      if (allSelected) {
        return new Set();
      } else {
        return new Set(data.map((row) => row.id));
      }
    });
  }, [enableSelection, data]);

  const clearSelection = useCallback(() => {
    setSelectedRows(new Set());
  }, []);

  // Expansion handlers
  const handleExpandRow = useCallback((rowId) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(rowId)) {
        newSet.delete(rowId);
      } else {
        newSet.add(rowId);
      }
      return newSet;
    });
  }, []);

  const expandAll = useCallback(() => {
    setExpandedRows(new Set(data.map((row) => row.id)));
  }, [data]);

  const collapseAll = useCallback(() => {
    setExpandedRows(new Set());
  }, []);

  // Sorting handlers
  const handleSort = useCallback((field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  }, [sortBy]);

  // Filter handlers
  const handleFilter = useCallback((field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
    pagination.setPage(1); // Reset to first page when filtering
  }, [pagination]);

  const handleMultipleFilters = useCallback((newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
    pagination.setPage(1);
  }, [pagination]);

  const clearFilter = useCallback((field) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[field];
      return newFilters;
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({});
    setSearchTerm('');
    pagination.setPage(1);
  }, [pagination]);

  // Search handlers
  const handleSearch = useCallback((term) => {
    setSearchTerm(term);
    pagination.setPage(1);
  }, [pagination]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    pagination.setPage(1);
  }, [pagination]);

  // Bulk action handlers
  const handleBulkAction = useCallback(async (action, selectedIds = Array.from(selectedRows)) => {
    if (!enableBulkActions || selectedIds.length === 0) return;

    try {
      await action(selectedIds);
      clearSelection();
      refetch();
    } catch (error) {
      console.error('Bulk action failed:', error);
      throw error;
    }
  }, [enableBulkActions, selectedRows, clearSelection, refetch]);

  // Export handlers
  const handleExport = useCallback(async (format = 'csv', selectedOnly = false) => {
    const exportParams = {
      ...apiParams,
      export: format,
    };

    if (selectedOnly && selectedRows.size > 0) {
      exportParams.ids = Array.from(selectedRows).join(',');
    }

    try {
      const response = await fetch(`${endpoint}/export/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(exportParams),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `export.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export failed:', error);
      throw error;
    }
  }, [endpoint, apiParams, selectedRows]);

  // Computed values
  const isAllSelected = useMemo(() => {
    return data.length > 0 && data.every((row) => selectedRows.has(row.id));
  }, [data, selectedRows]);

  const isIndeterminate = useMemo(() => {
    return selectedRows.size > 0 && !isAllSelected;
  }, [selectedRows.size, isAllSelected]);

  const hasFilters = useMemo(() => {
    return Object.keys(filters).length > 0 || searchTerm.length > 0;
  }, [filters, searchTerm]);

  const selectedCount = selectedRows.size;

  // Reset selection when data changes
  useEffect(() => {
    clearSelection();
  }, [data, clearSelection]);

  return {
    // Data
    data,
    isLoading,
    error,
    refetch,

    // Pagination
    pagination,

    // Sorting
    sortBy,
    sortOrder,
    handleSort,

    // Filtering
    filters,
    searchTerm,
    handleFilter,
    handleMultipleFilters,
    clearFilter,
    clearAllFilters,
    handleSearch,
    clearSearch,
    hasFilters,

    // Selection
    selectedRows: Array.from(selectedRows),
    selectedCount,
    isAllSelected,
    isIndeterminate,
    handleSelectRow,
    handleSelectAll,
    clearSelection,

    // Expansion
    expandedRows: Array.from(expandedRows),
    handleExpandRow,
    expandAll,
    collapseAll,

    // Bulk actions
    handleBulkAction,

    // Export
    handleExport,

    // Utilities
    isRowSelected: (rowId) => selectedRows.has(rowId),
    isRowExpanded: (rowId) => expandedRows.has(rowId),
    getSortIcon: (field) => {
      if (sortBy !== field) return null;
      return sortOrder === 'asc' ? '↑' : '↓';
    },
    getFilterValue: (field) => filters[field],
    reset: () => {
      setFilters(initialFilters);
      setSearchTerm('');
      setSortBy(initialSortBy);
      setSortOrder(initialSortOrder);
      setSelectedRows(new Set());
      setExpandedRows(new Set());
      pagination.setPage(1);
    },
  };
}
