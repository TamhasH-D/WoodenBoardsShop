import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import keycloak from './utils/keycloak'; // Import Keycloak instance

const root = ReactDOM.createRoot(document.getElementById('root'));

// Show a loading message while Keycloak is initializing
root.render(
  <React.StrictMode>
    <div>Loading...</div>
  </React.StrictMode>
);

keycloak.init({ onLoad: 'login-required' }).then((authenticated) => {
  if (authenticated) {
    console.log("User is authenticated");
    // Store token and refresh token if needed, or handle it within Keycloak adapter
    // For example: localStorage.setItem('kc_token', keycloak.token);
    // localStorage.setItem('kc_refreshToken', keycloak.refreshToken);

    // Set up token refresh
    setInterval(() => {
      keycloak.updateToken(70).then((refreshed) => {
        if (refreshed) {
          console.log('Token refreshed' + refreshed);
          // localStorage.setItem('kc_token', keycloak.token);
        } else {
          // console.warn('Token not refreshed, valid for ' + Math.round(keycloak.tokenParsed.exp + keycloak.timeSkew - new Date().getTime() / 1000) + ' seconds');
        }
      }).catch(() => {
        console.error('Failed to refresh token');
      });
    }, 60000)


    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } else {
    console.warn("User is not authenticated. Redirecting to login.");
    // keycloak.login() will be called automatically due to onLoad: 'login-required'
    // Or you can explicitly call keycloak.login();
  }
}).catch((error) => {
  console.error("Keycloak initialization failed:", error);
  root.render(
    <React.StrictMode>
      <div>Error initializing Keycloak. Please check the console for details.</div>
    </React.StrictMode>
  );
});
