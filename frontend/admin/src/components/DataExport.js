import React, { useState } from 'react';
import { useApiMutation } from '../hooks/useApi';
import { apiService } from '../services/api';
import { ADMIN_TEXTS } from '../utils/localization';

const EXPORT_ENTITIES = [
  { key: 'buyers', label: ADMIN_TEXTS.BUYERS },
  { key: 'sellers', label: ADMIN_TEXTS.SELLERS },
  { key: 'products', label: ADMIN_TEXTS.PRODUCTS },
  { key: 'woodTypes', label: ADMIN_TEXTS.WOOD_TYPES },
  { key: 'prices', label: ADMIN_TEXTS.WOOD_TYPE_PRICES },
  { key: 'boards', label: ADMIN_TEXTS.WOODEN_BOARDS },
  { key: 'images', label: ADMIN_TEXTS.IMAGES },
  { key: 'threads', label: ADMIN_TEXTS.CHAT_THREADS },
  { key: 'messages', label: ADMIN_TEXTS.CHAT_MESSAGES }
];

const EXPORT_FORMATS = [
  { key: 'json', label: 'JSON', description: ADMIN_TEXTS.JSON_FORMAT_DESC },
  { key: 'csv', label: 'CSV', description: ADMIN_TEXTS.CSV_FORMAT_DESC }
];

function DataExport() {
  const [selectedEntities, setSelectedEntities] = useState([]);
  const [selectedFormat, setSelectedFormat] = useState('json');
  const [exportProgress, setExportProgress] = useState({});
  const [completedExports, setCompletedExports] = useState({});

  const { mutate, loading, error } = useApiMutation();

  const handleEntityToggle = (entityKey) => {
    setSelectedEntities(prev => 
      prev.includes(entityKey) 
        ? prev.filter(key => key !== entityKey)
        : [...prev, entityKey]
    );
  };

  const handleSelectAll = () => {
    if (selectedEntities.length === EXPORT_ENTITIES.length) {
      setSelectedEntities([]);
    } else {
      setSelectedEntities(EXPORT_ENTITIES.map(entity => entity.key));
    }
  };

  const downloadFile = (data, filename, mimeType) => {
    const blob = new Blob([data], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    if (selectedEntities.length === 0) {
      alert(ADMIN_TEXTS.PLEASE_SELECT_ENTITY);
      return;
    }

    setExportProgress({});
    setCompletedExports({});

    for (const entityKey of selectedEntities) {
      try {
        setExportProgress(prev => ({ ...prev, [entityKey]: 'exporting' }));

        const data = await mutate(apiService.exportData, entityKey, selectedFormat);
        
        const timestamp = new Date().toISOString().split('T')[0];
        const filename = `${entityKey}_${timestamp}.${selectedFormat}`;
        
        let fileContent;
        let mimeType;
        
        if (selectedFormat === 'csv') {
          fileContent = data;
          mimeType = 'text/csv';
        } else {
          fileContent = JSON.stringify(data, null, 2);
          mimeType = 'application/json';
        }

        downloadFile(fileContent, filename, mimeType);
        
        setExportProgress(prev => ({ ...prev, [entityKey]: 'completed' }));
        setCompletedExports(prev => ({ 
          ...prev, 
          [entityKey]: { 
            filename, 
            timestamp: new Date().toLocaleString(),
            recordCount: data.data?.length || (Array.isArray(data) ? data.length : 0)
          }
        }));

      } catch (err) {
        console.error(`Failed to export ${entityKey}:`, err);
        setExportProgress(prev => ({ ...prev, [entityKey]: 'error' }));
      }
    }
  };

  const getProgressText = (status) => {
    switch (status) {
      case 'exporting': return 'Экспорт...';
      case 'completed': return 'Завершено';
      case 'error': return 'Ошибка';
      default: return '';
    }
  };

  const getProgressColor = (status) => {
    switch (status) {
      case 'exporting': return '#f59e0b';
      case 'completed': return '#10b981';
      case 'error': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="card">
      <h2>{ADMIN_TEXTS.DATA_EXPORT}</h2>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        {ADMIN_TEXTS.EXPORT_DESCRIPTION}
      </p>

      {/* Format Selection */}
      <div style={{ marginBottom: '2rem' }}>
        <h3>{ADMIN_TEXTS.EXPORT_FORMAT}</h3>
        <div className="grid grid-2">
          {EXPORT_FORMATS.map((format) => (
            <label 
              key={format.key} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                padding: '1rem',
                border: selectedFormat === format.key ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                backgroundColor: selectedFormat === format.key ? '#eff6ff' : 'white'
              }}
            >
              <input
                type="radio"
                name="format"
                value={format.key}
                checked={selectedFormat === format.key}
                onChange={(e) => setSelectedFormat(e.target.value)}
              />
              <div>
                <strong>{format.label}</strong>
                <br />
                <small style={{ color: '#666' }}>{format.description}</small>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Entity Selection */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3>{ADMIN_TEXTS.SELECT_ENTITIES_TO_EXPORT}</h3>
          <button
            onClick={handleSelectAll}
            className="btn btn-secondary"
          >
            {selectedEntities.length === EXPORT_ENTITIES.length ? ADMIN_TEXTS.DESELECT_ALL : ADMIN_TEXTS.SELECT_ALL}
          </button>
        </div>

        <div className="grid grid-3">
          {EXPORT_ENTITIES.map((entity) => {
            const isSelected = selectedEntities.includes(entity.key);
            const progress = exportProgress[entity.key];
            const completed = completedExports[entity.key];

            return (
              <label 
                key={entity.key}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  padding: '1rem',
                  border: isSelected ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  backgroundColor: isSelected ? '#eff6ff' : 'white',
                  position: 'relative'
                }}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleEntityToggle(entity.key)}
                />

                <div style={{ flex: 1 }}>
                  <strong>{entity.label}</strong>
                  {progress && (
                    <div style={{ 
                      fontSize: '0.8em', 
                      color: getProgressColor(progress),
                      marginTop: '0.25rem'
                    }}>
                      {getProgressText(progress)}
                    </div>
                  )}
                  {completed && (
                    <div style={{ fontSize: '0.8em', color: '#10b981', marginTop: '0.25rem' }}>
                      Экспортировано: {completed.recordCount} {ADMIN_TEXTS.RECORDS_EXPORTED}
                    </div>
                  )}
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Export Controls */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '1rem',
        backgroundColor: '#f8fafc',
        borderRadius: '0.5rem',
        marginBottom: '2rem'
      }}>
        <div>
          <strong>{ADMIN_TEXTS.SELECTED}:</strong> {selectedEntities.length} {ADMIN_TEXTS.ENTITIES}
          <br />
          <strong>{ADMIN_TEXTS.FORMAT}:</strong> {EXPORT_FORMATS.find(f => f.key === selectedFormat)?.label}
        </div>
        <button
          onClick={handleExport}
          disabled={loading || selectedEntities.length === 0}
          className="btn btn-primary"
          style={{ padding: '0.75rem 2rem' }}
        >
          {loading ? `${ADMIN_TEXTS.EXPORTING}...` : `${ADMIN_TEXTS.EXPORT_DATA}`}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error" style={{ marginBottom: '1rem' }}>
          {ADMIN_TEXTS.EXPORT_FAILED}: {error}
        </div>
      )}

      {/* Export Results */}
      {Object.keys(completedExports).length > 0 && (
        <div>
          <h3>{ADMIN_TEXTS.EXPORT_RESULTS}</h3>
          <div style={{ backgroundColor: '#f0fdf4', padding: '1rem', borderRadius: '0.5rem' }}>
            {Object.entries(completedExports).map(([entityKey, result]) => {
              const entity = EXPORT_ENTITIES.find(e => e.key === entityKey);
              return (
                <div key={entityKey} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '0.5rem 0',
                  borderBottom: '1px solid #dcfce7'
                }}>
                  <div>

                    <strong style={{ marginLeft: '0.5rem' }}>{entity?.label}</strong>
                    <span style={{ marginLeft: '1rem', color: '#666' }}>
                      {result.recordCount} {ADMIN_TEXTS.RECORDS}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.9em', color: '#666' }}>
                    {result.filename} • {result.timestamp}
                  </div>
                </div>
              );
            })}
          </div>
          <p style={{ fontSize: '0.9em', color: '#666', marginTop: '1rem' }}>
            {ADMIN_TEXTS.FILES_DOWNLOADED}
          </p>
        </div>
      )}

      {/* Usage Instructions */}
      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem' }}>
        <h4>{ADMIN_TEXTS.EXPORT_INSTRUCTIONS}</h4>
        <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
          <li><strong>JSON {ADMIN_TEXTS.FORMAT}:</strong> {ADMIN_TEXTS.JSON_FORMAT_INFO}</li>
          <li><strong>CSV {ADMIN_TEXTS.FORMAT}:</strong> {ADMIN_TEXTS.CSV_FORMAT_INFO}</li>
          <li><strong>Массовый экспорт:</strong> {ADMIN_TEXTS.BULK_EXPORT_INFO}</li>
          <li><strong>Именование файлов:</strong> {ADMIN_TEXTS.FILE_NAMING_INFO}</li>
        </ul>
        <p style={{ fontSize: '0.9em', color: '#666', margin: '0.5rem 0 0 0' }}>
          <strong>Примечание:</strong> {ADMIN_TEXTS.EXPORT_NOTE}
        </p>
      </div>
    </div>
  );
}

export default DataExport;
