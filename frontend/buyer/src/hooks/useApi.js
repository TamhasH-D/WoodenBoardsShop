import { useState, useEffect, useCallback } from 'react';

// Custom hook for API calls with loading and error states
export const useApi = (apiFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiFunction();
      setData(result);
    } catch (err) {
      setError(err.message || 'An error occurred');
      console.error('API Error:', err);
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]); // eslint-disable-line react-hooks/exhaustive-deps

  const refetch = () => {
    fetchData();
  };

  return { data, loading, error, refetch };
};

// Hook for API mutations (create, update, delete)
export const useApiMutation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const mutate = async (apiFunction, ...args) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      const result = await apiFunction(...args);
      setSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
      
      return result;
    } catch (err) {
      setError(err.message || 'An error occurred');
      console.error('API Mutation Error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);
  const clearSuccess = () => setSuccess(false);

  return { mutate, loading, error, success, clearError, clearSuccess };
};
