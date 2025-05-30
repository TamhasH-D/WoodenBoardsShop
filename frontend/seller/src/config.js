const config = {
  api: {
    baseURL: process.env.REACT_APP_API_URL || 'http://172.27.65.14:8000',
    timeout: parseInt(process.env.REACT_APP_API_TIMEOUT) || 30000,
  },
  app: {
    enableAnalytics: process.env.REACT_APP_ENABLE_ANALYTICS === 'true',
    enableDebugTools: process.env.REACT_APP_ENABLE_DEBUG_TOOLS === 'true',
  },
};

export default config;