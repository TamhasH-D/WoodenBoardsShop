import React, { useState } from 'react';

const ProductExport = ({ products, filters, onExport }) => {
  const [exportFormat, setExportFormat] = useState('csv');
  const [exportFields, setExportFields] = useState({
    title: true,
    volume: true,
    price: true,
    wood_type: true,
    delivery_possible: true,
    created_at: true,
    description: false,
    pickup_location: false
  });
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const selectedFields = Object.entries(exportFields)
        .filter(([_, selected]) => selected)
        .map(([field, _]) => field);

      await onExport(exportFormat, selectedFields);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const toggleField = (field) => {
    setExportFields(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const selectAllFields = () => {
    setExportFields(prev => 
      Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    );
  };

  const deselectAllFields = () => {
    setExportFields(prev => 
      Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {})
    );
  };

  const fieldLabels = {
    title: 'Название',
    volume: 'Объем (м³)',
    price: 'Цена (₽)',
    wood_type: 'Тип древесины',
    delivery_possible: 'Доставка',
    created_at: 'Дата создания',
    description: 'Описание',
    pickup_location: 'Адрес самовывоза'
  };

  const selectedFieldsCount = Object.values(exportFields).filter(Boolean).length;
  const totalProducts = products?.length || 0;

  return (
    <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
      <div className="card-header">
        <h3 className="card-title">📊 Экспорт результатов</h3>
        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-light)', marginTop: 'var(--space-1)' }}>
          Экспортируйте найденные товары в удобном формате
        </p>
      </div>

      <div style={{ padding: 'var(--space-4)' }}>
        {/* Export Summary */}
        <div style={{ 
          padding: 'var(--space-3)', 
          backgroundColor: 'var(--color-bg-light)', 
          borderRadius: 'var(--border-radius)',
          marginBottom: 'var(--space-4)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>Товаров для экспорта: {totalProducts}</strong>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-light)' }}>
                Полей: {selectedFieldsCount} из {Object.keys(exportFields).length}
              </div>
            </div>
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-light)' }}>
              {Object.keys(filters).length > 0 && (
                <span>🔍 Применены фильтры</span>
              )}
            </div>
          </div>
        </div>

        {/* Format Selection */}
        <div className="form-group">
          <label className="form-label">Формат экспорта</label>
          <select
            className="form-input"
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            style={{ maxWidth: '200px' }}
          >
            <option value="csv">CSV (Excel)</option>
            <option value="json">JSON</option>
            <option value="xlsx">Excel (.xlsx)</option>
          </select>
        </div>

        {/* Field Selection */}
        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
            <label className="form-label">Поля для экспорта</label>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <button
                onClick={selectAllFields}
                className="btn btn-secondary btn-sm"
                type="button"
              >
                Выбрать все
              </button>
              <button
                onClick={deselectAllFields}
                className="btn btn-secondary btn-sm"
                type="button"
              >
                Снять все
              </button>
            </div>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: 'var(--space-2)',
            padding: 'var(--space-3)',
            backgroundColor: 'var(--color-bg-light)',
            borderRadius: 'var(--border-radius)'
          }}>
            {Object.entries(fieldLabels).map(([field, label]) => (
              <label
                key={field}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-2)',
                  cursor: 'pointer',
                  padding: 'var(--space-1)',
                  borderRadius: 'var(--border-radius)',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'white'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <input
                  type="checkbox"
                  checked={exportFields[field]}
                  onChange={() => toggleField(field)}
                  className="form-checkbox"
                />
                <span style={{ fontSize: 'var(--font-size-sm)' }}>{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Export Button */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-4)' }}>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-light)' }}>
            {selectedFieldsCount === 0 && (
              <span style={{ color: 'var(--color-error)' }}>⚠️ Выберите хотя бы одно поле</span>
            )}
            {totalProducts === 0 && (
              <span style={{ color: 'var(--color-warning)' }}>ℹ️ Нет товаров для экспорта</span>
            )}
          </div>
          
          <button
            onClick={handleExport}
            disabled={isExporting || selectedFieldsCount === 0 || totalProducts === 0}
            className="btn btn-primary"
            style={{
              opacity: (selectedFieldsCount === 0 || totalProducts === 0) ? 0.6 : 1,
              cursor: (selectedFieldsCount === 0 || totalProducts === 0) ? 'not-allowed' : 'pointer'
            }}
          >
            {isExporting ? (
              <>
                <span style={{ marginRight: '0.5rem' }}>⏳</span>
                Экспортируем...
              </>
            ) : (
              <>
                <span style={{ marginRight: '0.5rem' }}>📥</span>
                Экспортировать {exportFormat.toUpperCase()}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductExport;
