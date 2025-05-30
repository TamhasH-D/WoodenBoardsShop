import React, { useState } from 'react';
import { useApiMutation } from '../hooks/useApi';
import { apiService } from '../services/api';

function BoardAnalyzer() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const { mutate, loading, error, success } = useApiMutation();

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setAnalysisResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    try {
      // Create FormData for file upload (mock implementation)
      const formData = new FormData();
      formData.append('image', selectedFile);
      
      const result = await mutate(apiService.analyzeWoodenBoard, formData);
      setAnalysisResult(result);
    } catch (err) {
      console.error('Analysis failed:', err);
    }
  };

  const clearAnalysis = () => {
    setSelectedFile(null);
    setAnalysisResult(null);
  };

  return (
    <div>
      <div className="card">
        <h2>🔍 AI-Powered Board Analyzer</h2>
        <p>Upload an image of a wooden board to get volume estimation and quality analysis.</p>
        
        <div className="form-group">
          <label className="form-label">Select Board Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="form-input"
          />
          {selectedFile && (
            <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#718096' }}>
              Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
          <button
            onClick={handleAnalyze}
            disabled={!selectedFile || loading}
            className="btn btn-primary"
          >
            {loading ? 'Analyzing...' : 'Analyze Board'}
          </button>
          {selectedFile && (
            <button onClick={clearAnalysis} className="btn btn-secondary">
              Clear
            </button>
          )}
        </div>

        {error && (
          <div className="error" style={{ marginTop: '1rem' }}>
            Analysis failed: {error}
          </div>
        )}

        {success && analysisResult && (
          <div className="success" style={{ marginTop: '1rem' }}>
            Analysis completed successfully!
          </div>
        )}
      </div>

      {/* Image Preview */}
      {selectedFile && (
        <div className="card">
          <h3>Image Preview</h3>
          <div style={{ textAlign: 'center' }}>
            <img
              src={URL.createObjectURL(selectedFile)}
              alt="Board preview"
              style={{
                maxWidth: '100%',
                maxHeight: '400px',
                borderRadius: '0.375rem',
                border: '1px solid #e2e8f0'
              }}
            />
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analysisResult && (
        <div className="card">
          <h3>📊 Analysis Results</h3>
          
          <div className="grid grid-2">
            <div className="stats-card" style={{ background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)' }}>
              <div className="stats-number">
                {analysisResult.volume?.toFixed(2) || 'N/A'} m³
              </div>
              <div className="stats-label">Estimated Volume</div>
            </div>

            <div className="stats-card" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <div className="stats-number">
                {analysisResult.confidence ? `${(analysisResult.confidence * 100).toFixed(1)}%` : 'N/A'}
              </div>
              <div className="stats-label">Confidence Level</div>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f7fafc', borderRadius: '0.375rem' }}>
            <h4>Analysis Details</h4>
            <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
              <li>Volume estimation: {analysisResult.volume?.toFixed(3) || 'N/A'} cubic meters</li>
              <li>Analysis confidence: {analysisResult.confidence ? `${(analysisResult.confidence * 100).toFixed(1)}%` : 'N/A'}</li>
              <li>Status: {analysisResult.success ? 'Successful' : 'Failed'}</li>
              {analysisResult.message && <li>Message: {analysisResult.message}</li>}
            </ul>
          </div>

          {analysisResult.volume && (
            <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#e6fffa', borderRadius: '0.375rem' }}>
              <h4>💡 Recommendations</h4>
              <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
                <li>Estimated market value: ${(analysisResult.volume * 150).toFixed(2)} - ${(analysisResult.volume * 250).toFixed(2)}</li>
                <li>Consider comparing with similar products in our marketplace</li>
                <li>Contact sellers with similar wood types for pricing</li>
                <li>Use this volume estimate when negotiating with sellers</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {/* How It Works */}
      <div className="card">
        <h3>How Board Analysis Works</h3>
        <div className="grid grid-2">
          <div>
            <h4>🤖 AI Technology</h4>
            <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
              <li>Advanced computer vision algorithms</li>
              <li>Machine learning models trained on wood data</li>
              <li>Real-time image processing</li>
              <li>Accurate volume calculations</li>
            </ul>
          </div>
          
          <div>
            <h4>📏 What We Analyze</h4>
            <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
              <li>Board dimensions and geometry</li>
              <li>Wood grain patterns and quality</li>
              <li>Surface defects and irregularities</li>
              <li>Volume estimation with confidence scores</li>
            </ul>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#fff5cd', borderRadius: '0.375rem' }}>
          <h4>⚠️ Important Notes</h4>
          <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
            <li>Results are estimates and may vary from actual measurements</li>
            <li>For best results, ensure good lighting and clear board visibility</li>
            <li>Include reference objects (like rulers) for scale when possible</li>
            <li>This tool is for estimation purposes only</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default BoardAnalyzer;
