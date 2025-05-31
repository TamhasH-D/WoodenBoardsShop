import React, { useState } from 'react';
import { useApiMutation } from '../hooks/useApi';
import { apiService } from '../services/api';

const EXPORT_ENTITIES = [
  { key: 'buyers', label: 'Buyers', icon: '👥' },
  { key: 'sellers', label: 'Sellers', icon: '🏪' },
  { key: 'products', label: 'Products', icon: '📦' },
  { key: 'woodTypes', label: 'Wood Types', icon: '🌳' },
  { key: 'prices', label: 'Wood Type Prices', icon: '💰' },
  { key: 'boards', label: 'Wooden Boards', icon: '🪵' },
  { key: 'images', label: 'Images', icon: '🖼️' },
  { key: 'threads', label: 'Chat Threads', icon: '💬' },
  { key: 'messages', label: 'Chat Messages', icon: '💭' }
];

const EXPORT_FORMATS = [
  { key: 'json', label: 'JSON', description: 'JavaScript Object Notation - structured data' },
  { key: 'csv', label: 'CSV', description: 'Comma Separated Values - spreadsheet compatible' }
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
      alert('Please select at least one entity to export.');
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

  const getProgressIcon = (status) => {
    switch (status) {
      case 'exporting': return '⏳';
      case 'completed': return '✅';
      case 'error': return '❌';
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
      <h2>📊 Data Export</h2>
      <p style={{ color: '#666', marginBottom: '2rem' }}>
        Export system data for backup, analysis, or migration purposes. 
        Select the entities and format you want to export.
      </p>

      {/* Format Selection */}
      <div style={{ marginBottom: '2rem' }}>
        <h3>Export Format</h3>
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
          <h3>Select Entities to Export</h3>
          <button 
            onClick={handleSelectAll}
            className="btn btn-secondary"
          >
            {selectedEntities.length === EXPORT_ENTITIES.length ? 'Deselect All' : 'Select All'}
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
                <span style={{ fontSize: '1.2em' }}>{entity.icon}</span>
                <div style={{ flex: 1 }}>
                  <strong>{entity.label}</strong>
                  {progress && (
                    <div style={{ 
                      fontSize: '0.8em', 
                      color: getProgressColor(progress),
                      marginTop: '0.25rem'
                    }}>
                      {getProgressIcon(progress)} {progress}
                    </div>
                  )}
                  {completed && (
                    <div style={{ fontSize: '0.8em', color: '#10b981', marginTop: '0.25rem' }}>
                      ✅ {completed.recordCount} records exported
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
          <strong>Selected:</strong> {selectedEntities.length} entities
          <br />
          <strong>Format:</strong> {EXPORT_FORMATS.find(f => f.key === selectedFormat)?.label}
        </div>
        <button 
          onClick={handleExport}
          disabled={loading || selectedEntities.length === 0}
          className="btn btn-primary"
          style={{ padding: '0.75rem 2rem' }}
        >
          {loading ? '⏳ Exporting...' : '📥 Export Data'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error" style={{ marginBottom: '1rem' }}>
          Export failed: {error}
        </div>
      )}

      {/* Export Results */}
      {Object.keys(completedExports).length > 0 && (
        <div>
          <h3>✅ Export Results</h3>
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
                    <span style={{ fontSize: '1.1em' }}>{entity?.icon}</span>
                    <strong style={{ marginLeft: '0.5rem' }}>{entity?.label}</strong>
                    <span style={{ marginLeft: '1rem', color: '#666' }}>
                      {result.recordCount} records
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
            💡 Files have been downloaded to your default download folder.
          </p>
        </div>
      )}

      {/* Usage Instructions */}
      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem' }}>
        <h4>📋 Export Instructions</h4>
        <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
          <li><strong>JSON Format:</strong> Best for data backup and system migration. Preserves data types and structure.</li>
          <li><strong>CSV Format:</strong> Best for analysis in spreadsheet applications like Excel or Google Sheets.</li>
          <li><strong>Bulk Export:</strong> Select multiple entities to export them all at once.</li>
          <li><strong>File Naming:</strong> Files are automatically named with entity type and current date.</li>
        </ul>
        <p style={{ fontSize: '0.9em', color: '#666', margin: '0.5rem 0 0 0' }}>
          <strong>Note:</strong> Large datasets may take some time to export. Please be patient during the export process.
        </p>
      </div>
    </div>
  );
}

export default DataExport;
