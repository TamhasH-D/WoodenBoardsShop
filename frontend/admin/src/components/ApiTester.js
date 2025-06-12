import React, { useState } from 'react';
import { apiService } from '../services/api';

function ApiTester() {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);

  const testEndpoints = [
    { name: 'Health Check', func: () => apiService.healthCheck() },
    { name: 'Get Buyers', func: () => apiService.getBuyers(0, 5) },
    { name: 'Get Sellers', func: () => apiService.getSellers(0, 5) },
    { name: 'Get Products', func: () => apiService.getProducts(0, 5) },
    { name: 'Get Wood Types', func: () => apiService.getWoodTypes(0, 5) },
    { name: 'Get Wood Type Prices', func: () => apiService.getWoodTypePrices(0, 5) },
    { name: 'Get Wooden Boards', func: () => apiService.getWoodenBoards(0, 5) },
    { name: 'Get Images', func: () => apiService.getImages(0, 5) },
    { name: 'Get Chat Threads', func: () => apiService.getChatThreads(0, 5) },
    { name: 'Get Chat Messages', func: () => apiService.getChatMessages(0, 5) },
  ];

  const testCreateOperations = [
    {
      name: 'Create Wood Type',
      func: () => apiService.createWoodType({
        id: generateUUID(),
        neme: 'Test Wood Type',
        description: 'Test description'
      })
    },
    {
      name: 'Create Buyer',
      func: () => apiService.createBuyer({
        id: generateUUID(),
        name: 'Test Buyer',
        email: 'test@buyer.com'
      })
    },
    {
      name: 'Create Seller',
      func: () => apiService.createSeller({
        id: generateUUID(),
        name: 'Test Seller',
        email: 'test@seller.com'
      })
    }
  ];

  const generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : ((r & 0x3) | 0x8);
      return v.toString(16);
    });
  };

  const runTest = async (test) => {
    setLoading(true);
    try {
      const result = await test.func();
      setResults(prev => ({
        ...prev,
        [test.name]: { success: true, data: result, error: null }
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [test.name]: { success: false, data: null, error: error.message }
      }));
    }
    setLoading(false);
  };

  const runAllTests = async () => {
    setLoading(true);
    setResults({});
    
    for (const test of testEndpoints) {
      try {
        const result = await test.func();
        setResults(prev => ({
          ...prev,
          [test.name]: { success: true, data: result, error: null }
        }));
      } catch (error) {
        setResults(prev => ({
          ...prev,
          [test.name]: { success: false, data: null, error: error.message }
        }));
      }
    }
    setLoading(false);
  };

  const clearResults = () => {
    setResults({});
  };

  return (
    <div className="card">
      <h2>🧪 API Tester</h2>
      <p>Test all API endpoints to verify connectivity and functionality.</p>
      
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
        <button 
          onClick={runAllTests} 
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? 'Testing...' : 'Run All Tests'}
        </button>
        <button 
          onClick={clearResults}
          className="btn btn-secondary"
        >
          Clear Results
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
        {/* Read Operations */}
        <div className="card" style={{ backgroundColor: '#f7fafc' }}>
          <h3>📖 Read Operations</h3>
          {testEndpoints.map(test => (
            <div key={test.name} style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{test.name}</span>
                <button 
                  onClick={() => runTest(test)}
                  disabled={loading}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.8em', padding: '0.25rem 0.5rem' }}
                >
                  Test
                </button>
              </div>
              {results[test.name] && (
                <div style={{ 
                  marginTop: '0.5rem', 
                  padding: '0.5rem', 
                  borderRadius: '4px',
                  backgroundColor: results[test.name].success ? '#d4edda' : '#f8d7da',
                  color: results[test.name].success ? '#155724' : '#721c24',
                  fontSize: '0.8em'
                }}>
                  {results[test.name].success ? (
                    <div>
                      ✅ Success
                      {results[test.name].data?.data && (
                        <div>Found {results[test.name].data.data.length} items</div>
                      )}
                    </div>
                  ) : (
                    <div>❌ Error: {results[test.name].error}</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Create Operations */}
        <div className="card" style={{ backgroundColor: '#fff3cd' }}>
          <h3>✏️ Create Operations</h3>
          <p style={{ fontSize: '0.9em', color: '#856404' }}>
            ⚠️ These tests create actual data. Use with caution!
          </p>
          {testCreateOperations.map(test => (
            <div key={test.name} style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{test.name}</span>
                <button 
                  onClick={() => runTest(test)}
                  disabled={loading}
                  className="btn btn-secondary"
                  style={{ 
                    fontSize: '0.8em', 
                    padding: '0.25rem 0.5rem',
                    backgroundColor: '#ffc107',
                    color: '#212529'
                  }}
                >
                  Test
                </button>
              </div>
              {results[test.name] && (
                <div style={{ 
                  marginTop: '0.5rem', 
                  padding: '0.5rem', 
                  borderRadius: '4px',
                  backgroundColor: results[test.name].success ? '#d4edda' : '#f8d7da',
                  color: results[test.name].success ? '#155724' : '#721c24',
                  fontSize: '0.8em'
                }}>
                  {results[test.name].success ? (
                    <div>✅ Created successfully</div>
                  ) : (
                    <div>❌ Error: {results[test.name].error}</div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      {Object.keys(results).length > 0 && (
        <div className="card" style={{ marginTop: '2rem', backgroundColor: '#e7f3ff' }}>
          <h3>📊 Test Summary</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <strong>Total Tests:</strong> {Object.keys(results).length}
            </div>
            <div style={{ color: '#155724' }}>
              <strong>Passed:</strong> {Object.values(results).filter(r => r.success).length}
            </div>
            <div style={{ color: '#721c24' }}>
              <strong>Failed:</strong> {Object.values(results).filter(r => !r.success).length}
            </div>
            <div>
              <strong>Success Rate:</strong> {
                Object.keys(results).length > 0 
                  ? Math.round((Object.values(results).filter(r => r.success).length / Object.keys(results).length) * 100)
                  : 0
              }%
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ApiTester;
