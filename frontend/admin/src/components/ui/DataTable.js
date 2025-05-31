import React, { useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { SORT_DIRECTIONS, PAGINATION } from '../../utils/constants';
import { formatDate, formatNumber, formatCurrency, truncateText } from '../../utils/helpers';
import Button from './Button';
import Input from './Input';
import Checkbox from './Checkbox';
import LoadingSpinner from './LoadingSpinner';
import EmptyState from './EmptyState';
import './DataTable.css';

/**
 * Advanced data table component with sorting, filtering, pagination, and bulk actions
 */
const DataTable = ({
  data = [],
  columns = [],
  loading = false,
  error = null,
  totalCount = 0,
  currentPage = 0,
  pageSize = PAGINATION.defaultPageSize,
  onPageChange,
  onPageSizeChange,
  onSort,
  sortField = null,
  sortDirection = SORT_DIRECTIONS.ASC,
  selectable = false,
  selectedItems = [],
  onSelectionChange,
  bulkActions = [],
  searchable = true,
  searchValue = '',
  onSearchChange,
  filterable = true,
  filters = {},
  onFilterChange,
  exportable = false,
  onExport,
  className = '',
  emptyMessage = 'No data available',
  rowKey = 'id',
  onRowClick,
  stickyHeader = false,
  compact = false,
  striped = true,
  bordered = false,
  hoverable = true
}) => {
  const [localSearchValue, setLocalSearchValue] = useState(searchValue);
  const [columnFilters, setColumnFilters] = useState(filters);
  const [visibleColumns, setVisibleColumns] = useState(
    columns.reduce((acc, col) => ({ ...acc, [col.key]: col.visible !== false }), {})
  );

  // Calculate pagination info
  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = currentPage * pageSize + 1;
  const endIndex = Math.min((currentPage + 1) * pageSize, totalCount);

  // Handle search
  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setLocalSearchValue(value);
    onSearchChange?.(value);
  }, [onSearchChange]);

  // Handle column filter
  const handleColumnFilter = useCallback((columnKey, value) => {
    const newFilters = { ...columnFilters, [columnKey]: value };
    setColumnFilters(newFilters);
    onFilterChange?.(newFilters);
  }, [columnFilters, onFilterChange]);

  // Handle sort
  const handleSort = useCallback((columnKey) => {
    const newDirection = sortField === columnKey && sortDirection === SORT_DIRECTIONS.ASC
      ? SORT_DIRECTIONS.DESC
      : SORT_DIRECTIONS.ASC;
    onSort?.(columnKey, newDirection);
  }, [sortField, sortDirection, onSort]);

  // Handle selection
  const handleSelectAll = useCallback((checked) => {
    const newSelection = checked ? data.map(item => item[rowKey]) : [];
    onSelectionChange?.(newSelection);
  }, [data, rowKey, onSelectionChange]);

  const handleSelectItem = useCallback((itemId, checked) => {
    const newSelection = checked
      ? [...selectedItems, itemId]
      : selectedItems.filter(id => id !== itemId);
    onSelectionChange?.(newSelection);
  }, [selectedItems, onSelectionChange]);

  // Handle column visibility
  const handleColumnVisibility = useCallback((columnKey, visible) => {
    setVisibleColumns(prev => ({ ...prev, [columnKey]: visible }));
  }, []);

  // Render cell content based on column type
  const renderCellContent = useCallback((item, column) => {
    const value = item[column.key];
    
    if (value === null || value === undefined) {
      return <span className="data-table__cell-empty">—</span>;
    }

    if (column.render) {
      return column.render(value, item);
    }

    switch (column.type) {
      case 'boolean':
        return value ? '✅' : '❌';
      case 'date':
        return formatDate(value);
      case 'datetime':
        return formatDate(value, 'MM/dd/yyyy HH:mm');
      case 'number':
        return formatNumber(value, column.numberOptions);
      case 'currency':
        return formatCurrency(value, column.currency);
      case 'url':
        return (
          <a 
            href={value} 
            target="_blank" 
            rel="noopener noreferrer"
            className="data-table__link"
          >
            {truncateText(value, 30)}
          </a>
        );
      case 'email':
        return (
          <a href={`mailto:${value}`} className="data-table__link">
            {value}
          </a>
        );
      case 'uuid':
        return (
          <code className="data-table__uuid">
            {truncateText(value, 8)}
          </code>
        );
      default:
        return column.truncate !== false ? truncateText(value, column.maxLength || 50) : value;
    }
  }, []);

  // Filter visible columns
  const visibleColumnsData = useMemo(() => {
    return columns.filter(col => visibleColumns[col.key]);
  }, [columns, visibleColumns]);

  // Check if all items are selected
  const allSelected = data.length > 0 && selectedItems.length === data.length;
  const someSelected = selectedItems.length > 0 && selectedItems.length < data.length;

  const tableClasses = [
    'data-table',
    compact && 'data-table--compact',
    striped && 'data-table--striped',
    bordered && 'data-table--bordered',
    hoverable && 'data-table--hoverable',
    stickyHeader && 'data-table--sticky-header',
    className
  ].filter(Boolean).join(' ');

  if (loading) {
    return (
      <div className="data-table-container">
        <LoadingSpinner size="large" message="Loading data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="data-table-container">
        <EmptyState
          icon="❌"
          title="Error Loading Data"
          description={error}
          action={
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          }
        />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="data-table-container">
        <EmptyState
          icon="📊"
          title="No Data"
          description={emptyMessage}
        />
      </div>
    );
  }

  return (
    <div className="data-table-container">
      {/* Table Header with Search and Actions */}
      <div className="data-table__header">
        <div className="data-table__header-left">
          {searchable && (
            <Input
              type="search"
              placeholder="Search..."
              value={localSearchValue}
              onChange={handleSearchChange}
              icon="🔍"
              clearable
              className="data-table__search"
            />
          )}
        </div>
        
        <div className="data-table__header-right">
          {selectedItems.length > 0 && bulkActions.length > 0 && (
            <div className="data-table__bulk-actions">
              <span className="data-table__selection-count">
                {selectedItems.length} selected
              </span>
              {bulkActions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'secondary'}
                  size="small"
                  onClick={() => action.onClick(selectedItems)}
                  icon={action.icon}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
          
          {exportable && (
            <Button
              variant="ghost"
              size="small"
              onClick={onExport}
              icon="📥"
            >
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="data-table__wrapper">
        <table className={tableClasses}>
          <thead className="data-table__head">
            <tr className="data-table__row data-table__row--header">
              {selectable && (
                <th className="data-table__cell data-table__cell--checkbox">
                  <Checkbox
                    checked={allSelected}
                    indeterminate={someSelected}
                    onChange={handleSelectAll}
                    aria-label="Select all rows"
                  />
                </th>
              )}
              
              {visibleColumnsData.map((column) => (
                <th
                  key={column.key}
                  className={`data-table__cell data-table__cell--header ${
                    column.sortable !== false ? 'data-table__cell--sortable' : ''
                  }`}
                  onClick={column.sortable !== false ? () => handleSort(column.key) : undefined}
                  style={{ width: column.width }}
                >
                  <div className="data-table__header-content">
                    <span className="data-table__header-text">
                      {column.title || column.key}
                    </span>
                    
                    {column.sortable !== false && (
                      <span className="data-table__sort-indicator">
                        {sortField === column.key ? (
                          sortDirection === SORT_DIRECTIONS.ASC ? '↑' : '↓'
                        ) : '↕️'}
                      </span>
                    )}
                  </div>
                  
                  {filterable && column.filterable !== false && (
                    <div className="data-table__filter">
                      <Input
                        size="small"
                        placeholder={`Filter ${column.title || column.key}...`}
                        value={columnFilters[column.key] || ''}
                        onChange={(e) => handleColumnFilter(column.key, e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody className="data-table__body">
            {data.map((item, index) => (
              <tr
                key={item[rowKey] || index}
                className={`data-table__row ${
                  selectedItems.includes(item[rowKey]) ? 'data-table__row--selected' : ''
                } ${onRowClick ? 'data-table__row--clickable' : ''}`}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
              >
                {selectable && (
                  <td className="data-table__cell data-table__cell--checkbox">
                    <Checkbox
                      checked={selectedItems.includes(item[rowKey])}
                      onChange={(checked) => handleSelectItem(item[rowKey], checked)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                )}
                
                {visibleColumnsData.map((column) => (
                  <td
                    key={column.key}
                    className={`data-table__cell ${column.className || ''}`}
                    title={column.showTooltip !== false ? item[column.key] : undefined}
                  >
                    {renderCellContent(item, column)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalCount > pageSize && (
        <div className="data-table__footer">
          <div className="data-table__pagination-info">
            Showing {startIndex} to {endIndex} of {totalCount} entries
          </div>
          
          <div className="data-table__pagination">
            <Button
              variant="ghost"
              size="small"
              disabled={currentPage === 0}
              onClick={() => onPageChange?.(currentPage - 1)}
            >
              Previous
            </Button>
            
            <span className="data-table__page-info">
              Page {currentPage + 1} of {totalPages}
            </span>
            
            <Button
              variant="ghost"
              size="small"
              disabled={currentPage >= totalPages - 1}
              onClick={() => onPageChange?.(currentPage + 1)}
            >
              Next
            </Button>
          </div>
          
          <div className="data-table__page-size">
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange?.(parseInt(e.target.value))}
              className="data-table__page-size-select"
            >
              {PAGINATION.pageSizeOptions.map(size => (
                <option key={size} value={size}>
                  {size} per page
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

DataTable.propTypes = {
  data: PropTypes.array,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      title: PropTypes.string,
      type: PropTypes.oneOf(['text', 'number', 'boolean', 'date', 'datetime', 'currency', 'url', 'email', 'uuid']),
      sortable: PropTypes.bool,
      filterable: PropTypes.bool,
      visible: PropTypes.bool,
      width: PropTypes.string,
      render: PropTypes.func,
      className: PropTypes.string,
      truncate: PropTypes.bool,
      maxLength: PropTypes.number,
      showTooltip: PropTypes.bool,
      numberOptions: PropTypes.object,
      currency: PropTypes.string
    })
  ),
  loading: PropTypes.bool,
  error: PropTypes.string,
  totalCount: PropTypes.number,
  currentPage: PropTypes.number,
  pageSize: PropTypes.number,
  onPageChange: PropTypes.func,
  onPageSizeChange: PropTypes.func,
  onSort: PropTypes.func,
  sortField: PropTypes.string,
  sortDirection: PropTypes.oneOf(Object.values(SORT_DIRECTIONS)),
  selectable: PropTypes.bool,
  selectedItems: PropTypes.array,
  onSelectionChange: PropTypes.func,
  bulkActions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
      variant: PropTypes.string,
      icon: PropTypes.node
    })
  ),
  searchable: PropTypes.bool,
  searchValue: PropTypes.string,
  onSearchChange: PropTypes.func,
  filterable: PropTypes.bool,
  filters: PropTypes.object,
  onFilterChange: PropTypes.func,
  exportable: PropTypes.bool,
  onExport: PropTypes.func,
  className: PropTypes.string,
  emptyMessage: PropTypes.string,
  rowKey: PropTypes.string,
  onRowClick: PropTypes.func,
  stickyHeader: PropTypes.bool,
  compact: PropTypes.bool,
  striped: PropTypes.bool,
  bordered: PropTypes.bool,
  hoverable: PropTypes.bool
};

export default DataTable;
