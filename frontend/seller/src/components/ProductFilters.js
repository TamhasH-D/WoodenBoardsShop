import React from 'react';

const ProductFilters = ({
  // Search state
  searchQuery,
  setSearchQuery,
  
  // Filter state
  priceMin,
  setPriceMin,
  priceMax,
  setPriceMax,
  volumeMin,
  setVolumeMin,
  volumeMax,
  setVolumeMax,
  selectedWoodType,
  setSelectedWoodType,
  deliveryFilter,
  setDeliveryFilter,
  pickupLocationFilter,
  setPickupLocationFilter,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  
  // Sorting state
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  
  // UI state
  showFilters,
  setShowFilters,
  activeFilterTab,
  setActiveFilterTab,
  
  // Data
  woodTypes,
  woodTypesLoading,
  
  // Actions
  clearFilters,
  applyQuickFilter,
  hasActiveFilters,
  filters,

  // Results
  totalFound
}) => {
  return (
    <div className="card mb-6">
      <div className="card-header">
        <div className="flex justify-between items-center">
          <h2 className="card-title">🔍 Поиск и фильтрация товаров</h2>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-secondary btn-sm"
          >
            {showFilters ? 'Скрыть фильтры' : 'Показать фильтры'}
          </button>
        </div>
      </div>

      {/* Basic Search */}
      <div className="form-group">
        <label className="form-label">Поиск по названию и описанию</label>
        <input
          type="text"
          className="form-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Введите название товара или ключевые слова..."
        />
      </div>

      {/* Quick Filter Presets */}
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <label className="form-label">Быстрые фильтры</label>
        <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
          <button
            onClick={() => applyQuickFilter('recent')}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.875rem' }}
          >
            📅 За неделю
          </button>
          <button
            onClick={() => applyQuickFilter('expensive')}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.875rem' }}
          >
            💰 Дорогие (>10к)
          </button>
          <button
            onClick={() => applyQuickFilter('large_volume')}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.875rem' }}
          >
            📦 Большой объем (>0.1м³)
          </button>
          <button
            onClick={() => applyQuickFilter('with_delivery')}
            className="btn btn-secondary btn-sm"
            style={{ fontSize: '0.875rem' }}
          >
            🚚 С доставкой
          </button>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div>
          {/* Filter Tabs */}
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <div style={{ display: 'flex', gap: 'var(--space-2)', borderBottom: '1px solid var(--color-border)' }}>
              <button
                onClick={() => setActiveFilterTab('basic')}
                className={`btn btn-sm ${activeFilterTab === 'basic' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: '4px 4px 0 0' }}
              >
                Основные
              </button>
              <button
                onClick={() => setActiveFilterTab('advanced')}
                className={`btn btn-sm ${activeFilterTab === 'advanced' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: '4px 4px 0 0' }}
              >
                Расширенные
              </button>
              <button
                onClick={() => setActiveFilterTab('sorting')}
                className={`btn btn-sm ${activeFilterTab === 'sorting' ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: '4px 4px 0 0' }}
              >
                Сортировка
              </button>
            </div>
          </div>

          {/* Basic Filters Tab */}
          {activeFilterTab === 'basic' && (
            <div className="form-grid form-grid-3">
              <div className="form-group">
                <label className="form-label">Мин. цена (₽)</label>
                <input
                  type="number"
                  className="form-input"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                  placeholder="0"
                  min="0"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Макс. цена (₽)</label>
                <input
                  type="number"
                  className="form-input"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                  placeholder="999999"
                  min="0"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Тип древесины</label>
                <select
                  className="form-input"
                  value={selectedWoodType}
                  onChange={(e) => setSelectedWoodType(e.target.value)}
                  disabled={woodTypesLoading}
                >
                  <option value="">Все типы</option>
                  {woodTypes?.data?.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.neme || `Type ${type.id?.substring(0, 8)}`}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Доставка</label>
                <select
                  className="form-input"
                  value={deliveryFilter}
                  onChange={(e) => setDeliveryFilter(e.target.value)}
                >
                  <option value="">Все товары</option>
                  <option value="true">С доставкой</option>
                  <option value="false">Только самовывоз</option>
                </select>
              </div>
            </div>
          )}

          {/* Advanced Filters Tab */}
          {activeFilterTab === 'advanced' && (
            <div className="form-grid form-grid-3">
              <div className="form-group">
                <label className="form-label">Мин. объем (м³)</label>
                <input
                  type="number"
                  step="0.001"
                  className="form-input"
                  value={volumeMin}
                  onChange={(e) => setVolumeMin(e.target.value)}
                  placeholder="0.001"
                  min="0"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Макс. объем (м³)</label>
                <input
                  type="number"
                  step="0.001"
                  className="form-input"
                  value={volumeMax}
                  onChange={(e) => setVolumeMax(e.target.value)}
                  placeholder="10"
                  min="0"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Адрес самовывоза</label>
                <select
                  className="form-input"
                  value={pickupLocationFilter}
                  onChange={(e) => setPickupLocationFilter(e.target.value)}
                >
                  <option value="">Все товары</option>
                  <option value="true">Есть адрес</option>
                  <option value="false">Нет адреса</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Дата создания от</label>
                <input
                  type="date"
                  className="form-input"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Дата создания до</label>
                <input
                  type="date"
                  className="form-input"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Sorting Tab */}
          {activeFilterTab === 'sorting' && (
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">Сортировка</label>
                <select
                  className="form-input"
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field);
                    setSortOrder(order);
                  }}
                >
                  <option value="created_at-desc">Новые сначала</option>
                  <option value="created_at-asc">Старые сначала</option>
                  <option value="price-asc">Цена: по возрастанию</option>
                  <option value="price-desc">Цена: по убыванию</option>
                  <option value="title-asc">Название: А-Я</option>
                  <option value="title-desc">Название: Я-А</option>
                  <option value="volume-asc">Объем: по возрастанию</option>
                  <option value="volume-desc">Объем: по убыванию</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Действия</label>
                <button
                  onClick={clearFilters}
                  className="btn btn-secondary w-full"
                  disabled={!hasActiveFilters}
                >
                  🗑️ Очистить все фильтры
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filter Status */}
      {hasActiveFilters && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-700">
            🔍 Активные фильтры: {Object.keys(filters).length} |
            Найдено товаров: {totalFound || 0}
          </p>
          <div style={{ marginTop: 'var(--space-2)', fontSize: '0.875rem' }}>
            {Object.entries(filters).map(([key, value]) => (
              <span key={key} style={{ 
                display: 'inline-block', 
                margin: '2px', 
                padding: '2px 6px', 
                backgroundColor: 'var(--color-primary)', 
                color: 'white', 
                borderRadius: '4px',
                fontSize: '0.75rem'
              }}>
                {key}: {typeof value === 'boolean' ? (value ? 'да' : 'нет') : value}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductFilters;
