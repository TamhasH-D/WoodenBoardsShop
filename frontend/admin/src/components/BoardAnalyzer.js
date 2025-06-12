import React, { useState, useRef } from 'react';
import { useApiMutation } from '../hooks/useApi';
import { apiService } from '../services/api';

function BoardAnalyzer() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [boardHeight, setBoardHeight] = useState(50); // mm
  const [boardLength, setBoardLength] = useState(6000); // mm
  const [analysisResult, setAnalysisResult] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const { mutate, loading, error, success } = useApiMutation();

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Clear previous results
      setAnalysisResult(null);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      return;
    }

    try {
      const result = await mutate(
        apiService.calculateBoardVolume,
        selectedFile,
        boardHeight,
        boardLength
      );
      setAnalysisResult(result);
    } catch (err) {
      console.error('Failed to analyze board:', err);
      setAnalysisResult(null);
    }
  };

  const clearAll = () => {
    setSelectedFile(null);
    setAnalysisResult(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatVolume = (volume) => {
    if (typeof volume === 'number') {
      return volume.toFixed(4);
    }
    return volume;
  };

  const formatCoordinates = (coords) => {
    if (Array.isArray(coords)) {
      return coords.map(coord => `(${coord[0]}, ${coord[1]})`).join(', ');
    }
    return coords;
  };

  return (
    <div className="card">
      <h3>🔍 Анализатор деревянных досок</h3>
      <p style={{ color: '#666', marginBottom: '1.5rem' }}>
        Загрузите изображение досок для автоматического определения объема и количества досок с помощью YOLO модели.
      </p>

      {/* Error and Success Messages */}
      {error && (
        <div className="error" style={{ marginBottom: '1rem' }}>
          Ошибка анализа: {error}
        </div>
      )}

      {success && (
        <div className="success" style={{ marginBottom: '1rem' }}>
          Анализ завершен успешно!
        </div>
      )}

      <div className="grid grid-2" style={{ gap: '2rem' }}>
        {/* Upload and Parameters Section */}
        <div className="card" style={{ backgroundColor: '#f7fafc' }}>
          <h4>📤 Загрузка и параметры</h4>
          
          <form onSubmit={handleAnalyze}>
            <div className="form-group">
              <label className="form-label">Изображение досок *</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="form-input"
                required
              />
              {selectedFile && (
                <small style={{ color: '#666', fontSize: '0.8em', marginTop: '0.25rem', display: 'block' }}>
                  Выбран файл: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                </small>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Высота доски (мм)</label>
              <input
                type="number"
                value={boardHeight}
                onChange={(e) => setBoardHeight(parseFloat(e.target.value) || 0)}
                className="form-input"
                min="1"
                max="1000"
                step="0.1"
                placeholder="50"
              />
              <small style={{ color: '#666', fontSize: '0.8em' }}>
                Типичные значения: 25, 32, 40, 50 мм
              </small>
            </div>

            <div className="form-group">
              <label className="form-label">Длина доски (мм)</label>
              <input
                type="number"
                value={boardLength}
                onChange={(e) => setBoardLength(parseFloat(e.target.value) || 0)}
                className="form-input"
                min="100"
                max="12000"
                step="1"
                placeholder="6000"
              />
              <small style={{ color: '#666', fontSize: '0.8em' }}>
                Типичные значения: 3000, 4000, 6000 мм
              </small>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loading || !selectedFile}
              >
                {loading ? 'Анализ...' : 'Анализировать'}
              </button>
              <button 
                type="button" 
                onClick={clearAll}
                className="btn btn-secondary"
                disabled={loading}
              >
                Очистить
              </button>
            </div>
          </form>
        </div>

        {/* Preview Section */}
        <div className="card" style={{ backgroundColor: '#f0fff4' }}>
          <h4>🖼️ Предварительный просмотр</h4>
          {previewUrl ? (
            <div style={{ textAlign: 'center' }}>
              <img
                src={previewUrl}
                alt="Preview"
                style={{
                  maxWidth: '100%',
                  maxHeight: '300px',
                  objectFit: 'contain',
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px'
                }}
              />
              <p style={{ fontSize: '0.9em', color: '#666', marginTop: '0.5rem' }}>
                Размеры: {boardHeight} × {boardLength} мм
              </p>
            </div>
          ) : (
            <div 
              style={{
                height: '300px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f8f9fa',
                border: '2px dashed #dee2e6',
                borderRadius: '4px',
                color: '#6c757d'
              }}
            >
              Выберите изображение для предварительного просмотра
            </div>
          )}
        </div>
      </div>

      {/* Analysis Results */}
      {analysisResult && (
        <div className="card" style={{ backgroundColor: '#e6fffa', marginTop: '2rem' }}>
          <h4>📊 Результаты анализа</h4>
          
          <div className="grid grid-2" style={{ gap: '1.5rem' }}>
            {/* Summary */}
            <div>
              <h5>📈 Сводка</h5>
              <div className="card" style={{ backgroundColor: 'white', padding: '1rem' }}>
                <p><strong>Общий объем:</strong> {formatVolume(analysisResult.total_volume)} м³</p>
                <p><strong>Количество досок:</strong> {analysisResult.board_count || 'Не определено'}</p>
                <p><strong>Время анализа:</strong> {new Date().toLocaleString()}</p>
                {analysisResult.confidence && (
                  <p><strong>Уверенность:</strong> {(analysisResult.confidence * 100).toFixed(1)}%</p>
                )}
              </div>
            </div>

            {/* Detailed Results */}
            <div>
              <h5>🔍 Детали</h5>
              <div className="card" style={{ backgroundColor: 'white', padding: '1rem', maxHeight: '200px', overflowY: 'auto' }}>
                <pre style={{ fontSize: '0.8em', margin: 0, whiteSpace: 'pre-wrap' }}>
                  {JSON.stringify(analysisResult, null, 2)}
                </pre>
              </div>
            </div>
          </div>

          {/* Board Coordinates */}
          {analysisResult.board_coordinates && (
            <div style={{ marginTop: '1rem' }}>
              <h5>📍 Координаты досок</h5>
              <div className="card" style={{ backgroundColor: 'white', padding: '1rem' }}>
                <p style={{ fontSize: '0.9em', fontFamily: 'monospace' }}>
                  {formatCoordinates(analysisResult.board_coordinates)}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Help Section */}
      <div className="card" style={{ backgroundColor: '#f8f9fa', marginTop: '1rem' }}>
        <h5>💡 Справка по анализу досок</h5>
        <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem', fontSize: '0.9em' }}>
          <li><strong>Поддерживаемые форматы:</strong> JPG, PNG, WEBP</li>
          <li><strong>Рекомендуемое разрешение:</strong> от 640x640 до 1920x1080 пикселей</li>
          <li><strong>Качество изображения:</strong> четкое, хорошо освещенное</li>
          <li><strong>Угол съемки:</strong> перпендикулярно к поверхности досок</li>
          <li><strong>YOLO модель:</strong> обученная для детекции деревянных досок</li>
          <li><strong>Точность:</strong> зависит от качества изображения и условий съемки</li>
        </ul>
      </div>
    </div>
  );
}

export default BoardAnalyzer;
