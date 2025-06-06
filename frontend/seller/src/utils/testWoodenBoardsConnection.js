// Test utility to verify wooden-boards microservice connection
// This file can be used for debugging and testing the direct connection

export const testWoodenBoardsConnection = async () => {
  const WOODEN_BOARDS_API_URL = process.env.REACT_APP_WOODEN_BOARDS_API_URL || 'http://localhost:8001';
  
  console.log('Testing wooden-boards microservice connection...');
  console.log('Wooden Boards API URL:', WOODEN_BOARDS_API_URL);
  
  try {
    // Test health endpoint first
    const healthResponse = await fetch(`${WOODEN_BOARDS_API_URL}/health`);
    console.log('Health check response:', healthResponse.status, healthResponse.statusText);
    
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('Health check data:', healthData);
      return {
        success: true,
        message: 'Wooden-boards microservice is accessible',
        healthData
      };
    } else {
      return {
        success: false,
        message: `Health check failed: ${healthResponse.status} ${healthResponse.statusText}`
      };
    }
  } catch (error) {
    console.error('Connection test failed:', error);
    return {
      success: false,
      message: `Connection failed: ${error.message}`,
      error: error.message
    };
  }
};

export const testImageAnalysisEndpoint = async () => {
  const WOODEN_BOARDS_API_URL = process.env.REACT_APP_WOODEN_BOARDS_API_URL || 'http://localhost:8001';
  
  console.log('Testing wooden-boards image analysis endpoint...');
  
  try {
    // Test if the endpoint exists (without sending actual image)
    const testUrl = `${WOODEN_BOARDS_API_URL}/wooden_boards_volume_seg/?height=0.05&length=1.0`;
    
    // Use HEAD request to check if endpoint exists
    const response = await fetch(testUrl, { 
      method: 'HEAD',
      mode: 'cors'
    });
    
    console.log('Image analysis endpoint test:', response.status, response.statusText);
    
    return {
      success: response.status !== 404,
      status: response.status,
      message: response.status === 404 
        ? 'Image analysis endpoint not found' 
        : 'Image analysis endpoint is accessible'
    };
  } catch (error) {
    console.error('Image analysis endpoint test failed:', error);
    return {
      success: false,
      message: `Endpoint test failed: ${error.message}`,
      error: error.message
    };
  }
};

// Export configuration for debugging
export const getWoodenBoardsConfig = () => {
  return {
    WOODEN_BOARDS_API_URL: process.env.REACT_APP_WOODEN_BOARDS_API_URL || 'http://localhost:8001',
    MAIN_API_URL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
    NODE_ENV: process.env.NODE_ENV,
    allEnvVars: Object.keys(process.env)
      .filter(key => key.startsWith('REACT_APP_'))
      .reduce((obj, key) => {
        obj[key] = process.env[key];
        return obj;
      }, {})
  };
};
