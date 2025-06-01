import React, { useState, useEffect } from 'react';

// Simple component to monitor API request frequency
const RequestMonitor = () => {
  const [requestCount, setRequestCount] = useState(0);
  const [lastRequestTime, setLastRequestTime] = useState(null);
  const [requestHistory, setRequestHistory] = useState([]);

  useEffect(() => {
    // Override fetch to monitor requests
    const originalFetch = window.fetch;
    
    window.fetch = function(...args) {
      const now = new Date();
      setRequestCount(prev => prev + 1);
      setLastRequestTime(now);
      setRequestHistory(prev => [...prev.slice(-9), now].slice(-10)); // Keep last 10 requests
      
      return originalFetch.apply(this, args);
    };

    // Cleanup
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  const getRequestFrequency = () => {
    if (requestHistory.length < 2) return 'N/A';
    
    const timeSpan = requestHistory[requestHistory.length - 1] - requestHistory[0];
    const frequency = (requestHistory.length - 1) / (timeSpan / 1000); // requests per second
    
    return frequency.toFixed(2) + ' req/s';
  };

  const isHighFrequency = () => {
    if (requestHistory.length < 5) return false;
    
    const recentRequests = requestHistory.slice(-5);
    const timeSpan = recentRequests[recentRequests.length - 1] - recentRequests[0];
    
    // If 5 requests in less than 2 seconds, consider it high frequency
    return timeSpan < 2000;
  };

  return (
    <div className="card" style={{ position: 'fixed', top: '10px', right: '10px', zIndex: 1000, minWidth: '250px' }}>
      <h4>Request Monitor</h4>
      <div style={{ fontSize: '0.875rem' }}>
        <p><strong>Total Requests:</strong> {requestCount}</p>
        <p><strong>Last Request:</strong> {lastRequestTime ? lastRequestTime.toLocaleTimeString() : 'None'}</p>
        <p><strong>Frequency:</strong> {getRequestFrequency()}</p>
        <p>
          <strong>Status:</strong> 
          <span style={{ 
            color: isHighFrequency() ? '#dc2626' : '#16a34a',
            fontWeight: 'bold',
            marginLeft: '0.5rem'
          }}>
            {isHighFrequency() ? '⚠️ High Frequency' : '✅ Normal'}
          </span>
        </p>
        
        {requestHistory.length > 0 && (
          <details style={{ marginTop: '0.5rem' }}>
            <summary>Recent Requests</summary>
            <ul style={{ fontSize: '0.75rem', marginTop: '0.5rem', maxHeight: '100px', overflowY: 'auto' }}>
              {requestHistory.slice(-10).reverse().map((time, index) => (
                <li key={index}>{time.toLocaleTimeString()}</li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </div>
  );
};

export default RequestMonitor;
